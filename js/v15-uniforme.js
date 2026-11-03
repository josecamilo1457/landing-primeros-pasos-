/* UI only: deadline and countdown. Tracking remains in v13-visita.js. */
(() => {
 const dialog=document.getElementById('uniform-dialog');if(!dialog||typeof dialog.showModal!=='function')return;
 const key='pp_uniforme_v15_seen',read=k=>{try{return sessionStorage.getItem(k)}catch{return null}},write=()=>{try{sessionStorage.setItem(key,'1')}catch{}};
 let seen=read(key)==='1',elapsed=false,clicked=false,opener=null;
 // Buenos Aires UTC-03: weekly offer cutoff is Thursday 23:59:59.
 function deadline(now){const local=new Date(now-3*3600000);let days=(5-local.getUTCDay()+7)%7;if(days===0)days=7;return Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate()+days,3);}
 function tick(){const now=Date.now(),end=deadline(now),left=Math.max(0,Math.ceil((end-now)/1000));const d=Math.floor(left/86400),h=Math.floor(left%86400/3600),m=Math.floor(left%3600/60),s=left%60;
  dialog.querySelector('[data-week-deadline]').textContent='Beneficio disponible hasta el jueves '+new Intl.DateTimeFormat('es-AR',{timeZone:'America/Argentina/Buenos_Aires',day:'numeric',month:'numeric'}).format(end-1000)+' a las 23:59.';
  dialog.querySelector('[data-week-countdown]').textContent=d+'d · '+String(h).padStart(2,'0')+'h · '+String(m).padStart(2,'0')+'m · '+String(s).padStart(2,'0')+'s';
 }
 function open(){if(dialog.open)return;opener=document.activeElement;seen=true;write();tick();dialog.showModal();}
 function close(){dialog.close();opener?.focus?.({preventScroll:true});}
 document.querySelectorAll('[data-open-uniform]').forEach(b=>{b.hidden=false;b.addEventListener('click',open)});
 dialog.querySelector('.promo-close').addEventListener('click',close);dialog.querySelector('.promo-later').addEventListener('click',close);
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}});
 dialog.addEventListener('close',()=>{opener?.focus?.({preventScroll:true})});
 document.querySelectorAll('[data-whatsapp]').forEach(a=>a.addEventListener('click',()=>{clicked=true;if(dialog.open)close()}));
 function maybeOpen(){const max=document.documentElement.scrollHeight-innerHeight;if(!seen&&!clicked&&!read('pp_nov_dic_whatsapp_clicked')&&elapsed&&document.visibilityState==='visible'&&max>0&&scrollY/max>=.45)open()}
 setTimeout(()=>{elapsed=true;maybeOpen()},30000);window.addEventListener('scroll',maybeOpen,{passive:true});
 document.addEventListener('visibilitychange',maybeOpen);setInterval(()=>{if(dialog.open)tick()},1000);
 if(window.__PP_QA)window.__PP_UNIFORM={deadline};
})();