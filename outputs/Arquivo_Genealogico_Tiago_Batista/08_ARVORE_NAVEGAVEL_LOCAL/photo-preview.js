/* Fotos publicadas no acervo e canal de correções da família. */
(function () {
  const WHATSAPP_NUMBER='5511950187016';
  const DEFAULT_PHOTOS={
    iraci:'assets/photos/iraci.jpeg',jose:'assets/photos/jose.jpeg',ivanildo:'assets/photos/ivanildo.png',
    marina:'assets/photos/marina.jpeg',thais:'assets/photos/thais.jpeg','tatiana-batista':'assets/photos/tatiana.png',
    'taina-batista':'assets/photos/taina.png','diego-batista':'assets/photos/diego.png','alessandro-cremon':'assets/photos/alessandro.png',
    'joao-cremon':'assets/photos/joao.png','alice-cremon':'assets/photos/alice.png','eduardo-santana':'assets/photos/eduardo-santana.png',
    'eduardo-filho':'assets/photos/eduardo-filho.png','maria-clara':'assets/photos/maria-clara.png','gabriel-santana':'assets/photos/gabriel.png',
    'davi-rodrigues':'assets/photos/davi.png','maria-luiza-rodrigues':'assets/photos/maria-luiza.png',everaldo:'assets/photos/everaldo.png','kelly-everaldo':'assets/photos/kelly.jpg'
  };
  const images=new Map();
  function showInFrame(frame,dataUrl){const image=frame.querySelector('img'),label=frame.querySelector('span');image.src=dataUrl;image.hidden=false;if(label)label.hidden=true}
  function attachTreePhotos(){
    for(const portrait of document.querySelectorAll('[data-photo-person]')){
      const personId=portrait.dataset.photoPerson,source=DEFAULT_PHOTOS[personId];if(!source)continue;
      let image=images.get(personId);if(!image){image=document.createElement('img');image.alt='';images.set(personId,image)}
      if(image.getAttribute('src')!==source)image.src=source;
      if(portrait.querySelector('img')!==image)portrait.replaceChildren(image);
    }
  }
  window.refreshGenealogyPhotos=attachTreePhotos;
  function whatsappUrl(person){
    const message=[
      'Olá, Tiago. Tenho uma correção ou nova informação para a árvore genealógica.',
      '',
      `Pessoa relacionada: ${person.name}`,
      'Correção ou informação:',
      'Fonte, documento ou foto disponível:',
      'Meu nome e parentesco:'
    ].join('\n');
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }
  function addPhotoArea(){
    const host=document.querySelector('#detail-content');if(!host||host.querySelector('.photo-area'))return;
    const personId=selected,person=byId[personId],source=DEFAULT_PHOTOS[personId];
    const area=document.createElement('section');area.className='photo-area';area.dataset.photoFor=personId;
    area.innerHTML=`<div class="photo-frame"><img alt="Foto de ${person.name}" hidden /><span>${person.name.trim().charAt(0)}</span></div><div><p class="photo-kicker">MEMÓRIA VISUAL</p><h3>Foto de ${person.name}</h3><p>${source?'Esta é a foto publicada no acervo da família.':'Ainda não há foto publicada para esta pessoa.'}</p><a class="photo-button correction-button" href="${whatsappUrl(person)}" target="_blank" rel="noopener">Informar correção ou nova informação</a><small class="photo-status">Somente o administrador atualiza fotos, dados e documentos após conferir a fonte.</small></div>`;
    host.prepend(area);if(source)showInFrame(area.querySelector('.photo-frame'),source);
  }
  addPhotoArea();
  new MutationObserver(addPhotoArea).observe(document.querySelector('#detail-content'),{childList:true});
  let refreshQueued=false;
  new MutationObserver(()=>{if(refreshQueued)return;refreshQueued=true;queueMicrotask(()=>{refreshQueued=false;attachTreePhotos()})}).observe(document.querySelector('#tree'),{childList:true,subtree:true});
  attachTreePhotos();
})();
