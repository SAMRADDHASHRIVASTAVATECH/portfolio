/* Lightweight portfolio runtime: one RAF loop, delegated events, no animation library. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer:fine)').matches;
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];

  // Loader never blocks content for more than a single frame.
  requestAnimationFrame(() => { $('#loader')?.remove(); document.body.classList.add('is-ready'); });

  const nav = $('#nav'), toggle = $('#nav-toggle'), list = $('#nav-list');
  const closeMenu = () => { list?.classList.remove('is-open'); toggle?.setAttribute('aria-expanded','false'); };
  toggle?.addEventListener('click', () => { const open=list.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', String(open)); });
  list?.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(() => { nav?.classList.toggle('nav--scrolled', scrollY > 24); ticking=false; }); ticking=true; } }, {passive:true});

  // Reveal using IntersectionObserver; no scroll handler per element.
  const reveal = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('is-visible'); reveal.unobserve(e.target); } }), {rootMargin:'0px 0px -8%'});
  $$('[data-reveal], [data-split-text]').forEach(el => reveal.observe(el));

  // Counters only animate when visible.
  const count = new IntersectionObserver(entries => entries.forEach(e => { if(!e.isIntersecting)return; const el=e.target, end=Number(el.dataset.count); if(!end)return; const start=performance.now(); const run=now=>{ const p=Math.min((now-start)/700,1); el.textContent=Math.round(end*(1-Math.pow(1-p,3))); if(p<1)requestAnimationFrame(run); }; requestAnimationFrame(run); count.unobserve(el); }), {threshold:.5});
  $$('[data-count]').forEach(el=>count.observe(el));

  if (finePointer && !reduce) {
    const cursor=$('#cursor'), dot=cursor?.querySelector('.cursor__dot'), ring=cursor?.querySelector('.cursor__ring'); let x=0,y=0,tx=0,ty=0;
    addEventListener('pointermove', e=>{tx=e.clientX;ty=e.clientY},{passive:true});
    const frame=()=>{x+=(tx-x)*.22;y+=(ty-y)*.22; if(dot)dot.style.transform=`translate3d(${tx}px,${ty}px,0)`; if(ring)ring.style.transform=`translate3d(${x}px,${y}px,0)`; requestAnimationFrame(frame)}; frame();
    document.addEventListener('pointerover', e=>{if(e.target.closest('a,button,[data-magnetic]'))cursor?.classList.add('cursor--hover')},{passive:true});
    document.addEventListener('pointerout', e=>{if(e.target.closest('a,button,[data-magnetic]'))cursor?.classList.remove('cursor--hover')},{passive:true});
  }

  // Low-cost background particles: capped, paused off-screen/tab, no connection O(n²).
  const canvas=$('#bg-canvas'), ctx=canvas?.getContext('2d');
  if(canvas && ctx && !reduce && !matchMedia('(prefers-reduced-data: reduce)').matches){
    let w=0,h=0,dpr=1, particles=[], raf=0;
    const resize=()=>{dpr=Math.min(devicePixelRatio||1,1.5);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:w<768?18:36},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12,r:Math.random()*1.2+.4}));};
    const draw=()=>{if(document.hidden)return;ctx.clearRect(0,0,w,h);for(const p of particles){p.x=(p.x+p.vx+w)%w;p.y=(p.y+p.vy+h)%h;ctx.globalAlpha=.28;ctx.fillStyle='#00f0ff';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.28);ctx.fill();}raf=requestAnimationFrame(draw)};
    resize(); addEventListener('resize',resize,{passive:true}); addEventListener('scroll',()=>{}, {passive:true}); document.addEventListener('visibilitychange',()=>document.hidden?cancelAnimationFrame(raf):draw()); draw();
  }

  // Accessible terminal micro-interaction.
  const terminal=$('#terminal-text'); if(terminal){ const text='cat ./availability.txt'; let i=0; const type=()=>{terminal.textContent=text.slice(0,i++);if(i<=text.length)setTimeout(type,35)}; setTimeout(type,400); }
})();
