const speed=1; function notify(message){console.warn(message)}
export class DiveRenderer{
 constructor(){this.canvas=document.createElement('canvas');this.canvas.setAttribute('aria-hidden','true');this.gl=this.canvas.getContext('webgl2',{alpha:false,antialias:false,premultipliedAlpha:false,preserveDrawingBuffer:true});this.host=null;this.item=null;this.phase=0;this.running=false;this.token=0;this.request=0;this.last=0;this.failed=false;this.resizeObserver=new ResizeObserver(()=>this.resize());if(!this.gl){this.failed=true;return}const gl=this.gl;
 const vertex=`#version 300 es
in vec2 position;out vec2 vUV;void main(){vUV=.5*(position+1.0);gl_Position=vec4(position,0.,1.);}`;
 const fragment=`#version 300 es
precision highp float;
in vec2 vUV;
out vec4 colour;
uniform sampler2D picture;
uniform vec2 centre;
uniform vec2 pixelStep;
uniform float shrink;
uniform float turn;
uniform float phase;
uniform float poleDistance;
uniform vec2 rim;
uniform int mode;
uniform int diagnostic;
const float L=1.38629436112;
const float PI=3.14159265359;

vec2 cm(vec2 a,vec2 b){return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);}
vec2 cd(vec2 a,vec2 b){return vec2(dot(a,b),a.y*b.x-a.x*b.y)/max(dot(b,b),1.e-24);}
vec2 rot(float a){return vec2(cos(a),sin(a));}
vec2 root(vec2 z){float r=length(z);return vec2(sqrt(max(0.,.5*(r+z.x))),(z.y<0.?-1.:1.)*sqrt(max(0.,.5*(r-z.x))));}
float border(vec2 p){return min(min(p.x,1.-p.x),min(p.y,1.-p.y));}

struct Copy {vec2 uv; vec2 jx; vec2 jy; float density; float coverage;};
Copy emptyCopy(){return Copy(vec2(.5),vec2(1.,0.),vec2(0.,1.),0.,0.);}
Copy conformal(vec2 p,vec2 derivative){
  float margin=border(p);
  float density=length(derivative);
  // The 4%-wide edge mask is spatial, not a timed whole-image crossfade.
  return Copy(p,derivative,vec2(-derivative.y,derivative.x),density,smoothstep(0.,.04,margin));
}
Copy geometricCopy(vec2 uv,float t){
  vec2 f=pow(shrink,t)*rot(turn*t);
  if(mode<2)return conformal(centre+cm(uv-centre,f),f);
  vec2 z=2.*(uv-centre);
  vec2 w,d;
  if(mode==2){
    vec2 a=vec2(-poleDistance,0.),b=-a;
    vec2 m=cm(cd(z-a,z-b),f);
    w=cd(a-cm(b,m),vec2(1.,0.)-m);
    vec2 ratio=cd(w-b,z-b);
    d=cm(f,cm(ratio,ratio));
  }else{
    vec2 d2=vec2(poleDistance*poleDistance,0.);
    w=root(d2+cm(cm(z,z)-d2,f));
    if(dot(w,z)<0.)w=-w;
    d=cd(cm(f,z),w);
  }
  return conformal(.5*w+centre,d);
}
// Rimrings retains the existing bands rather than reconstructing them
// from a different radius. This is the earlier direct display flow.
float rimCoordinate(float r){
  float q=L/(2.*PI),c=min(r,rim.y-.001);
  return (1.+q*q)*log(max(r,1.e-12))+rim.x*c/(rim.y-c);
}
vec2 rimPosition(vec2 uv,float t){
  vec2 z=2.*(uv-centre);float r=max(length(z),1.e-9);
  if(abs(t)<1.e-7 || r>=rim.y-.002)return uv;
  float target=rimCoordinate(r)-L*t;
  float lo=1.e-12,hi=min(rim.y-.001,r*exp(max(0.,-L*t)));
  for(int j=0;j<24;j++){
    float mid=.5*(lo+hi);
    if(rimCoordinate(mid)<target)lo=mid;else hi=mid;
  }
  float rr=.5*(lo+hi),angle=(L/(2.*PI))*log(rr/r);
  return centre+.5*(rr/r)*cm(z,rot(angle));
}
vec3 rimFrame(vec2 uv){
  // Match the original direct sampler. No radial period wrapping, copy
  // replacement, or derivative-driven coarse mip selection at the rim.
  vec3 a=textureLod(picture,rimPosition(uv,phase),0.).rgb;
  vec3 b=textureLod(picture,rimPosition(uv,phase-1.),0.).rgb;
  return mix(a,b,smoothstep(.57,1.,phase));
}
void keep(Copy candidate,inout Copy first,inout Copy second,inout Copy third){
  if(candidate.coverage<=0.||candidate.density<=0.||isnan(candidate.density)||isinf(candidate.density))return;
  if(candidate.density>first.density){third=second;second=first;first=candidate;}
  else if(candidate.density>second.density){third=second;second=candidate;}
  else if(candidate.density>third.density){third=candidate;}
}
vec3 sampleCopy(Copy c){
  // Explicit derivatives prevent a change of copy index from selecting a
  // spuriously blurred mip level at a tile boundary.
  return textureGrad(picture,c.uv,c.jx*pixelStep.x,c.jy*pixelStep.y).rgb;
}
vec3 resolve(Copy first,Copy second,Copy third){
  if(second.density<=0.)return sampleCopy(first);
  vec3 a=sampleCopy(first),b=sampleCopy(second);
  if(third.density>0.)b=mix(sampleCopy(third),b,second.coverage);
  // Nonlinear maps can have two equally detailed representatives. A narrow
  // density crossover prevents a pop when their ranking exchanges.
  float dominance=smoothstep(0.,log(1.16),log(first.density/second.density));
  return mix(b,a,first.coverage*(.5+.5*dominance));
}
void main(){
  vec2 uv=vec2(vUV.x,1.-vUV.y);
  if(mode==4){colour=vec4(rimFrame(uv),1.);return;}
  Copy first=emptyCopy(),second=emptyCopy(),third=emptyCopy();
  if(mode<2){
    float radius=length(uv-centre);
    if(radius<1.e-10){colour=vec4(textureLod(picture,vec2(.5),12.).rgb,1.);return;}
    vec2 extents=max(centre,vec2(1.)-centre);
    float maximumRadius=length(extents);
    // Start at the largest radius that could fit in the source rectangle,
    // then inspect inward copies until three actual in-bounds copies exist.
    float firstPeriod=ceil(log(maximumRadius/radius)/log(shrink)-phase);
    for(int j=0;j<8;j++){
      keep(geometricCopy(uv,phase+firstPeriod+float(j)),first,second,third);
      if(third.density>0.)break;
    }
  }else{
    // At phase+1 the same set of equivalent copies is chosen, shifted by one
    // integer. No frame-level fade or temporal resolution reset is needed.
    for(int j=-12;j<=12;j++)keep(geometricCopy(uv,phase+float(j)),first,second,third);
  }
  vec3 result=first.density>0.?resolve(first,second,third):texture(picture,uv).rgb;
  if(diagnostic==1){float lod=log2(max(first.density,1.e-12));result=vec3(clamp((lod+3.)/8.,0.,1.),first.coverage,.2);}
  colour=vec4(result,1.);
}
`;
 const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader};
 try{const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));gl.useProgram(p);this.program=p;const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(p,'position');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);this.uniforms={};for(const n of ['picture','centre','pixelStep','shrink','turn','phase','poleDistance','rim','mode','diagnostic'])this.uniforms[n]=gl.getUniformLocation(p,n);this.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.uniform1i(this.uniforms.picture,0);const anisotropy=gl.getExtension('EXT_texture_filter_anisotropic');if(anisotropy)gl.texParameterf(gl.TEXTURE_2D,anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(16,gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)))}catch(error){this.failed=true;console.error(error)}
 this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.stop();this.failed=true;notify('The animation context was interrupted. Reload to resume; still images remain available.');});}
 async start(item,host,playing=true){if(this.failed||item.mode==='still')return false;this.stop();const token=++this.token;const img=new Image();img.src=item.image;await img.decode();if(token!==this.token)return false;this.host=host;this.item=item;this.phase=0;this.last=0;this.canvas.hidden=false;const gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,this.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);gl.generateMipmap(gl.TEXTURE_2D);const m=item.motion;gl.uniform2f(this.uniforms.centre,m.center[0],m.center[1]);gl.uniform1f(this.uniforms.shrink,m.scale);gl.uniform1f(this.uniforms.turn,m.angle);gl.uniform1f(this.uniforms.poleDistance,m.poleDistance||.42);gl.uniform2f(this.uniforms.rim,m.radialA||1.2,m.radialRadius||.97);gl.uniform1i(this.uniforms.mode,{similarity:0,square:1,mobius:2,poles:3,rimrings:4}[item.mode]);host.append(this.canvas);this.resizeObserver.observe(host);this.resize();this.draw();if(playing)this.resume();return true;}
 resize(){if(!this.host||this.failed)return;const r=this.host.getBoundingClientRect();const px=Math.min(devicePixelRatio||1,2);const n=Math.min(1300,Math.max(200,Math.round(r.width*px)));if(this.canvas.width!==n||this.canvas.height!==n){this.canvas.width=n;this.canvas.height=n;this.gl.viewport(0,0,n,n);this.gl.uniform2f(this.uniforms.pixelStep,1/n,1/n);this.draw();}}
 draw(){if(!this.item||this.failed)return;this.gl.uniform1f(this.uniforms.phase,this.phase);this.gl.drawArrays(this.gl.TRIANGLES,0,6);}
 tick(now){if(!this.running)return;if(this.last)this.phase=(this.phase+Math.min(now-this.last,100)*speed/8000)%1;this.last=now;this.draw();this.request=requestAnimationFrame(t=>this.tick(t));}
 resume(){if(!this.item||this.running||this.failed)return;this.running=true;this.last=0;this.request=requestAnimationFrame(t=>this.tick(t));}
 pause(){this.running=false;cancelAnimationFrame(this.request);this.last=0;}
 stop(){this.pause();this.token++;this.resizeObserver.disconnect();this.canvas.remove();this.canvas.hidden=false;this.host=null;this.item=null;this.phase=0;}
 seek(phase){this.phase=phase;this.draw();}
}
