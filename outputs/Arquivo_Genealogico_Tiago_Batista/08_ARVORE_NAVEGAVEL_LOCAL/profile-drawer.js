/* Perfil sobreposto: preserva a posição da árvore durante a consulta. */
(function () {
  const panel=document.querySelector('.detail-panel');if(!panel)return;
  panel.classList.add('profile-drawer');panel.setAttribute('aria-hidden','true');
  const close=document.createElement('button');close.type='button';close.className='profile-close';close.setAttribute('aria-label','Fechar perfil');close.textContent='×';panel.prepend(close);
  const backdrop=document.createElement('button');backdrop.type='button';backdrop.className='profile-backdrop';backdrop.setAttribute('aria-label','Fechar perfil');backdrop.hidden=true;document.body.append(backdrop);
  function open(){panel.classList.add('open');panel.setAttribute('aria-hidden','false');backdrop.hidden=false;requestAnimationFrame(()=>backdrop.classList.add('open'));close.focus({preventScroll:true})}
  function shut(){panel.classList.remove('open');panel.setAttribute('aria-hidden','true');backdrop.classList.remove('open');setTimeout(()=>{if(!panel.classList.contains('open'))backdrop.hidden=true},180)}
  window.openFamilyProfile=open;window.closeFamilyProfile=shut;
  close.addEventListener('click',shut);backdrop.addEventListener('click',shut);document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel.classList.contains('open'))shut()});
})();
