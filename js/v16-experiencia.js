(()=>{const root=document.querySelector('.review-carousel');if(!root)return;const slides=[...root.querySelectorAll('.review-slide')],status=root.querySelector('[data-review-status]');let index=0,start=null;
function show(n){index=(n+slides.length)%slides.length;slides.forEach((s,i)=>s.hidden=i!==index);status.textContent=(index+1)+' de '+slides.length}
root.querySelector('.review-controls').hidden=false;root.querySelector('[data-review-prev]').addEventListener('click',()=>show(index-1));root.querySelector('[data-review-next]').addEventListener('click',()=>show(index+1));
root.addEventListener('keydown',e=>{if(e.target!==root)return;if(e.key==='ArrowRight'){e.preventDefault();show(index+1)}if(e.key==='ArrowLeft'){e.preventDefault();show(index-1)}});
root.addEventListener('touchstart',e=>{start={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});root.addEventListener('touchend',e=>{if(!start)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)show(index+(dx<0?1:-1));start=null},{passive:true});show(0)})();

// El CTA fijo acompaña el recorrido, sin competir con los CTA principales.
(()=>{
  const sticky=document.querySelector('.mobile-cta');
  const hero=document.querySelector('.hero__action .button');
  const closing=document.querySelector('.closing .button');
  const dialog=document.querySelector('#uniform-dialog');
  if(!sticky||!hero)return;
  const inView=el=>{if(!el)return false;const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight-72};
  const update=()=>sticky.classList.toggle('is-hidden',
    !matchMedia('(max-width:767px)').matches||inView(hero)||inView(closing)||!!dialog?.open);
  let queued=false;
  const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;update()})};
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  if(dialog)new MutationObserver(schedule).observe(dialog,{attributes:true,attributeFilter:['open']});
  update();
})();