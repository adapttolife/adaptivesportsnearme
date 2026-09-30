/* One moving selection surface per segmented control, including rerendered views. */
(() => {
  const previous = new Map();
  const observed = new Set();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; sync(); });
  }
  const resize = new ResizeObserver(schedule);
  function sync() {
    for (const group of observed) if (!group.isConnected) { resize.unobserve(group); observed.delete(group); }
    document.querySelectorAll('.seg, .gate-tabs').forEach(group => {
      const buttons = Array.from(group.children).filter(el => el.tagName === 'BUTTON');
      const active = buttons.find(button => button.classList.contains('on'));
      if (!active || !group.getClientRects().length || !active.offsetWidth) return;
      if (!observed.has(group)) { resize.observe(group); observed.add(group); }
      const key = buttons.map(button => ['data-layout','data-dbview','data-grant-aud','data-gate-tab']
        .map(attr => button.hasAttribute(attr) ? attr+':'+button.getAttribute(attr) : '').join('')).join('|');
      let indicator = group.querySelector(':scope > .seg-indicator');
      if (!indicator) {
        indicator = document.createElement('span');
        indicator.className = 'seg-indicator';
        indicator.setAttribute('aria-hidden','true');
        group.prepend(indicator);
      }
      group.setAttribute('data-sliding','');
      const next = {x:active.offsetLeft,y:active.offsetTop,width:active.offsetWidth,height:active.offsetHeight,index:buttons.indexOf(active)};
      const from = previous.get(key);
      const frame = value => ({transform:`translate(${value.x}px, ${value.y}px)`,width:value.width+'px',height:value.height+'px'});
      Object.assign(indicator.style,frame(next));
      // Preserve the previous selection across innerHTML replacements (Gallery/
      // Table and grant audiences), as well as in-place layout/tab changes.
      if (from && from.index !== next.index) {
        const running=indicator.getAnimations();
        let start=frame(from);
        if(running.length) {
          const current=getComputedStyle(indicator);
          start={transform:current.transform,width:current.width,height:current.height};
        }
        running.forEach(animation=>animation.cancel());
        if(!reduced.matches) indicator.animate([start,frame(next)],{duration:220,easing:'cubic-bezier(.2,.8,.2,1)'});
      }
      previous.set(key,next);
      buttons.forEach(button=>button.setAttribute(button.getAttribute('role')==='tab'?'aria-selected':'aria-pressed',String(button===active)));
    });
  }
  new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  window.addEventListener('resize',schedule);
  reduced.addEventListener('change',()=>{
    if(reduced.matches) document.querySelectorAll('.seg-indicator').forEach(el=>el.getAnimations().forEach(animation=>animation.cancel()));
    schedule();
  });
  document.fonts?.ready.then(schedule);
  sync();
})();
