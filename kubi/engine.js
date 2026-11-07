/* Little Cube Coach: exact sticker geometry and a layer-by-layer planner. */
(function(root){
'use strict';
const NAMES=['U','R','F','D','L','B'];
const V={U:{n:[0,1,0],r:[1,0,0],u:[0,0,-1]},R:{n:[1,0,0],r:[0,0,-1],u:[0,1,0]},F:{n:[0,0,1],r:[1,0,0],u:[0,1,0]},D:{n:[0,-1,0],r:[1,0,0],u:[0,0,1]},L:{n:[-1,0,0],r:[0,0,1],u:[0,1,0]},B:{n:[0,0,-1],r:[-1,0,0],u:[0,1,0]}};
const add=(a,b)=>a.map((x,i)=>x+b[i]),mul=(a,s)=>a.map(x=>x*s),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function rotate(v,n,a){return add(add(mul(v,Math.cos(a)),mul(cross(n,v),Math.sin(a))),mul(n,dot(n,v)*(1-Math.cos(a))));}
const STICKERS=NAMES.flatMap((f,fi)=>Array.from({length:9},(_,j)=>({f,index:fi*9+j,n:V[f].n,p:add(V[f].n,add(mul(V[f].r,j%3-1),mul(V[f].u,1-Math.floor(j/3)))),r:V[f].r,u:V[f].u})));
const key=s=>s.p.join(',')+'/'+s.n.join(',');const index=new Map(STICKERS.map((s,i)=>[key(s),i]));
const SOLVED=NAMES.map(f=>f.repeat(9)).join('');
function tokens(s){return Array.isArray(s)?s:s.trim().split(/\s+/).filter(Boolean);}
const inverse=s=>tokens(s).reverse().map(m=>m.endsWith('2')?m:m.endsWith("'")?m[0]:m+"'");
const PERMS={};
for(const f of NAMES){let p=STICKERS.map(s=>{if(dot(s.p,V[f].n)!==1)return s.index;return index.get(key({p:rotate(s.p,V[f].n,-Math.PI/2).map(Math.round),n:rotate(s.n,V[f].n,-Math.PI/2).map(Math.round)}));});PERMS[f]=p;PERMS[f+'2']=p.map(x=>p[x]);PERMS[f+"'"]=p.map(x=>p[p[x]]);}
function permute(a,p){const b=Array(54);for(let i=0;i<54;i++)b[p[i]]=a[i];return b;}
function apply(state,seq){let a=Array.from(state);for(const m of tokens(seq))a=permute(a,PERMS[m]);return typeof state==='string'?a.join(''):a;}
function sequencePerm(seq){let p=STICKERS.map(s=>s.index);for(const m of tokens(seq))p=p.map(x=>PERMS[m][x]);return p;}
const edgeSlots=STICKERS.filter(s=>s.p.filter(x=>x!==0).length===2).map(s=>s.index),cornerSlots=STICKERS.filter(s=>s.p.filter(x=>x!==0).length===3).map(s=>s.index);
const groups=new Map();for(const s of STICKERS){const k=s.p.join(',');if(!groups.has(k))groups.set(k,[]);groups.get(k).push(s.index);}
const groupOf=i=>groups.get(STICKERS[i].p.join(','));
function locate(state,anchors){return anchors.map(i=>{let colors=groupOf(i).map(j=>SOLVED[j]).sort().join('');for(let j=0;j<54;j++){if(state[j]===SOLVED[i]&&groupOf(j).map(k=>state[k]).sort().join('')===colors)return j;}throw new Error('A piece has colors that do not belong together. Please check the entered colors.');});}
const turns=['U','U2',"U'"];
function around(alg){const ring=['F','R','B','L'];return [0,1,2,3].map(n=>tokens(alg).map(m=>ring.includes(m[0])?ring[(ring.indexOf(m[0])+n)%4]+m.slice(1):m).join(' '));}
const macros={cross:NAMES.flatMap(f=>[f,f+'2',f+"'"]),corners:[...turns,...around("R U R' U'"),...around("U R U' R'")],middle:[...turns,...around("U R U' R' U' F' U F"),...around("U' L' U L U F U' F'")],yellow:[...turns,...around("F R U R' U' F'")],edges:[...turns,...around("R U R' U R U2 R'")],homes:around("U R U' L' U R' U' L")};
const anchors={cross:[28,30,32,34],corners:[27,29,33,35],middle:[21,23,48,50],yellow:[1,3,5,7],edges:[1,3,5,7],homes:[0,2,6,8]};
function encode(a){return ((a[0]*24+a[1])*24+a[2])*24+a[3];}
function decode(n){return [Math.floor(n/13824),Math.floor(n/576)%24,Math.floor(n/24)%24,n%24];}
function permutations(a){if(!a.length)return [[]];return a.flatMap((v,i)=>permutations(a.filter((_,j)=>i!==j)).map(r=>[v,...r]));}
const tables={};
function makeTable(name){if(tables[name])return tables[name];const slots=['corners','homes'].includes(name)?cornerSlots:edgeSlots;const rev=Object.fromEntries(slots.map((s,i)=>[s,i]));const algs=macros[name];const maps=algs.map(a=>sequencePerm(a)).map(p=>slots.map(s=>rev[p[s]]));const back=algs.map(a=>sequencePerm(inverse(a))).map(p=>slots.map(s=>rev[p[s]]));let goals=[anchors[name].map(s=>rev[s])];if(name==='yellow')goals=permutations(goals[0]);if(name==='homes'){goals=[[]];for(const s of anchors[name])goals=goals.flatMap(g=>groupOf(s).map(i=>[...g,rev[i]]));}
const how=new Int8Array(24**4).fill(-1),queue=new Int32Array(24**4);let head=0,tail=0;for(const g of goals){let k=encode(g);if(how[k]!==-1)continue;how[k]=-2;queue[tail++]=k;}
while(head<tail){const a=decode(queue[head++]);for(let mi=0;mi<back.length;mi++){const p=back[mi],k=((p[a[0]]*24+p[a[1]])*24+p[a[2]])*24+p[a[3]];if(how[k]===-1){how[k]=mi;queue[tail++]=k;}}}
return tables[name]={how,maps,rev,algs,count:tail};}
function route(state,name){const t=makeTable(name);let loc=locate(state,anchors[name]).map(s=>t.rev[s]);let k=encode(loc),out=[],guard=0;if(t.how[k]===-1)throw new Error('These colors do not make a solvable cube. Check the face directions and each sticker.');while(t.how[k]>=0){const m=t.how[k];out.push(tokens(t.algs[m]));loc=loc.map(x=>t.maps[m][x]);k=encode(loc);if(++guard>100)throw new Error('Planner could not finish. Please check the colors.');}return out;}
function checkValid(s,Cube){if(typeof s!=='string'||s.length!==54||NAMES.some(f=>[...s].filter(x=>x===f).length!==9))throw new Error('Each color needs exactly 9 stickers. Check the color counts.');if(NAMES.some((f,i)=>s[i*9+4]!==f))throw new Error('The center colors must stay in their marked places.');const seen=new Set();for(const g of groups.values()){let sig=g.map(i=>s[i]).sort().join('');let expected=[...groups.values()].some(q=>q.map(i=>SOLVED[i]).sort().join('')===sig);if(!expected||seen.has(sig))throw new Error('Please check the colors: a corner or edge is repeated or has an impossible color pair.');seen.add(sig);}
if(Cube){const c=Cube.fromString(s);if(c.asString()!==s)throw new Error('A corner has its colors in the wrong order. Check the direction you held that face.');const parity=a=>a.reduce((n,x,i)=>n+a.slice(i+1).filter(y=>y<x).length,0)%2;if(c.co.reduce((a,b)=>a+b,0)%3||c.eo.reduce((a,b)=>a+b,0)%2||parity(c.cp)!==parity(c.ep))throw new Error('This pattern cannot be made by normal turns. Please check the colors and face directions.');}return true;}
function solve(state,onProgress=()=>{}){let current=state;const stages=[];for(const [i,name] of ['cross','corners','middle','yellow','edges','homes'].entries()){onProgress(i);let chunks=route(current,name);let moves=chunks.flat();stages.push({name,moves,chunks,start:current});current=apply(current,moves);}
onProgress(6);let chunks=[];for(let c=0;c<4;c++){let count=0;while(current[8]!=='U'){const seq=tokens("R' D' R D");chunks.push(seq);current=apply(current,seq);if(++count>6)throw new Error('The final corners could not be matched. Check the colors.');}chunks.push(['U']);current=apply(current,'U');}
// Avoid four empty lap turns when all corners already face up.
let lastStart=stages.length?apply(stages[5].start,stages[5].moves):state;if(lastStart===SOLVED)chunks=[];
stages.push({name:'finish',moves:chunks.flat(),chunks,start:lastStart});if(current!==SOLVED)throw new Error('The solution did not pass its final check. Please check the cube colors.');return stages;}
function scramble(n=20){let a=[],last='';for(let i=0;i<n;i++){let f;do{f=NAMES[Math.floor(Math.random()*6)];}while(f===last);a.push(f+['',"'",'2'][Math.floor(Math.random()*3)]);last=f;}return a;}
root.CubeCoach={NAMES,V,STICKERS,SOLVED,PERMS,add,mul,dot,cross,rotate,apply,tokens,inverse,sequencePerm,groupOf,locate,makeTable,checkValid,solve,scramble,anchors};
if(typeof module!=='undefined')module.exports=root.CubeCoach;
})(typeof self!=='undefined'?self:globalThis);
