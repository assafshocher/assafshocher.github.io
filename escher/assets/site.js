import { DiveRenderer } from './dive.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const video=document.getElementById('teaser'),toggle=document.getElementById('teaser-toggle');
let requested=!reduced.matches,inView=true;
function syncVideo(){if(requested&&inView&&!document.hidden)video.play().catch(()=>{requested=false;updateVideoButton()});else video.pause();updateVideoButton()}
function updateVideoButton(){toggle.textContent=requested?'Pause animation':'Play animation';toggle.setAttribute('aria-label',requested?'Pause teaser animation':'Play teaser animation')}
toggle.addEventListener('click',()=>{requested=!requested;syncVideo()});
new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;syncVideo()}).observe(video);
document.addEventListener('visibilitychange',syncVideo);
reduced.addEventListener('change',()=>{if(reduced.matches){requested=false;syncVideo();renderer?.stop()}});
syncVideo();
document.querySelectorAll('.placeholder').forEach(link=>link.addEventListener('click',event=>event.preventDefault()));
const bib=document.getElementById('bibtex'),copy=document.getElementById('copy-bib');
copy.addEventListener('click',async()=>{
  try{if(!navigator.clipboard?.writeText)throw Error('Clipboard API unavailable');await navigator.clipboard.writeText(bib.textContent)}
  catch{const text=document.createElement('textarea');text.value=bib.textContent;text.style.cssText='position:fixed;left:-9999px';document.body.append(text);text.select();const ok=document.execCommand('copy');text.remove();if(!ok){document.getElementById('copy-status').textContent='Please select and copy the citation below.';return}}
  copy.querySelector('span').textContent='Copied';document.getElementById('copy-status').textContent='BibTeX copied to clipboard.';setTimeout(()=>copy.querySelector('span').textContent='Copy',2000);
});
let renderer=null;
const selected=['scene-sky','scene-camera','assorted-eye','assorted-chess','assorted-birds','assorted-attic','clock-mobius','clock-poles','clock-square'];
const transforms=['puppet-p1','puppet-p2','puppet-poles','puppet-mobius','puppet-square','puppet-rimrings'];
const labels=['Conformal · |p| = 1','Conformal · |p| = 2','Poles','Möbius','Square','Rimrings'];
function createCard(item,label,compact=false){
  const figure=document.createElement('figure');figure.className='result-card';
  const caption=document.createElement('figcaption');caption.textContent=label||item.title;
  const link=document.createElement('a');link.className='dive-link';link.dataset.image=item.id;link.href='supplement.html?image='+encodeURIComponent(item.id);link.setAttribute('aria-label','Open '+item.title+' in the animated supplement');
  const img=document.createElement('img');img.src=item.poster||item.image;img.alt=item.title;img.loading='lazy';img.decoding='async';img.width=720;img.height=720;link.append(img);
  if(compact)figure.append(caption,link);else figure.append(link,caption);return figure;
}
try{
  const response=await fetch('assets/gallery.json');if(!response.ok)throw Error('Could not load the gallery');
  const data=await response.json(),byId=new Map(data.items.map(item=>[item.id,item]));
  selected.forEach(id=>document.getElementById('selected-results').append(createCard(byId.get(id))));
  transforms.forEach((id,index)=>document.getElementById('transformation-results').append(createCard(byId.get(id),labels[index],true)));
  renderer=new DiveRenderer();
  const start=link=>{if(link&&!reduced.matches&&!renderer.failed)renderer.start(byId.get(link.dataset.image),link).catch(()=>renderer.stop())};
  for(const container of document.querySelectorAll('.result-grid,.transform-grid')){
    container.addEventListener('pointerover',event=>{const link=event.target.closest('.dive-link');if(!link||link.contains(event.relatedTarget)||event.pointerType==='touch')return;start(link)});
    container.addEventListener('pointerout',event=>{const link=event.target.closest('.dive-link');if(!link||link.contains(event.relatedTarget))return;renderer.stop()});
    container.addEventListener('focusin',event=>start(event.target.closest('.dive-link')));
    container.addEventListener('focusout',()=>renderer.stop());
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)renderer.pause();else if(renderer.host&&!reduced.matches)renderer.resume()});
  window.addEventListener('blur',()=>renderer.pause());window.addEventListener('focus',()=>{if(renderer.host&&!reduced.matches)renderer.resume()});
  window.PROJECT={data,renderer};
}catch(error){console.warn(error);document.getElementById('selected-results').textContent='The gallery could not be loaded. Please reload the page, or open the supplementary material.'}
