/* Fotos associadas à pessoa e preservadas localmente neste navegador. */
(function () {
  const DB_NAME='memoria-familiar-local',STORE='person-photos';
  const DEFAULT_PHOTOS={
    iraci:'assets/photos/iraci.jpeg',jose:'assets/photos/jose.jpeg',ivanildo:'assets/photos/ivanildo.png',
    marina:'assets/photos/marina.jpeg',thais:'assets/photos/thais.jpeg','tatiana-batista':'assets/photos/tatiana.png',
    'taina-batista':'assets/photos/taina.png','diego-batista':'assets/photos/diego.png','alessandro-cremon':'assets/photos/alessandro.png',
    'joao-cremon':'assets/photos/joao.png','alice-cremon':'assets/photos/alice.png','eduardo-santana':'assets/photos/eduardo-santana.png',
    'eduardo-filho':'assets/photos/eduardo-filho.png','maria-clara':'assets/photos/maria-clara.png','gabriel-santana':'assets/photos/gabriel.png',
    'davi-rodrigues':'assets/photos/davi.png','maria-luiza-rodrigues':'assets/photos/maria-luiza.png',everaldo:'assets/photos/everaldo.png','kelly-everaldo':'assets/photos/kelly.jpg'
  };
  // Keep both the source and the decoded portrait while the tree is rebuilt.
  // IndexedDB is read once, not once per person on every mutation of the tree.
  const sources=new Map(Object.entries(DEFAULT_PHOTOS)),images=new Map();
  let databasePromise;
  function database(){
    if(databasePromise)return databasePromise;
    databasePromise=new Promise((resolve,reject)=>{const request=indexedDB.open(DB_NAME,1);request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'personId'})};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
    return databasePromise;
  }
  async function savePhoto(personId,dataUrl,file){const db=await database();return new Promise((resolve,reject)=>{const transaction=db.transaction(STORE,'readwrite');transaction.objectStore(STORE).put({personId,dataUrl,fileName:file.name,updatedAt:Date.now()});transaction.oncomplete=()=>resolve();transaction.onerror=()=>reject(transaction.error);transaction.onabort=()=>reject(transaction.error)})}
  const savedPhotosReady=database().then(db=>new Promise((resolve,reject)=>{const request=db.transaction(STORE,'readonly').objectStore(STORE).getAll();request.onsuccess=()=>resolve(request.result||[]);request.onerror=()=>reject(request.error)})).then(records=>{records.forEach(record=>{if(record.personId&&record.dataUrl)sources.set(record.personId,record.dataUrl)})}).catch(()=>{/* File-backed portraits remain available even when browser storage is unavailable. */});
  function showInFrame(frame,dataUrl){const image=frame.querySelector('img'),label=frame.querySelector('span');image.src=dataUrl;image.hidden=false;if(label)label.hidden=true}
  function attachTreePhotos(){
    for(const portrait of document.querySelectorAll('[data-photo-person]')){
      const personId=portrait.dataset.photoPerson,source=sources.get(personId);if(!source)continue;
      let image=images.get(personId);
      if(!image){image=document.createElement('img');image.alt='';images.set(personId,image)}
      if(image.getAttribute('src')!==source)image.src=source;
      if(portrait.querySelector('img')!==image)portrait.replaceChildren(image);
    }
  }
  function refreshTreePhotos(){attachTreePhotos();return savedPhotosReady.then(attachTreePhotos)}
  window.refreshGenealogyPhotos=refreshTreePhotos;
  async function addPhotoArea(){
    const host=document.querySelector('#detail-content');if(!host||host.querySelector('.photo-area'))return;
    const personId=selected,person=byId[personId];
    const area=document.createElement('section');area.className='photo-area';area.dataset.photoFor=personId;
    area.innerHTML=`<div class="photo-frame"><img alt="Foto de ${person.name}" hidden /><span>${person.name.trim().charAt(0)}</span></div><div><p class="photo-kicker">MEMÓRIA VISUAL</p><h3>Foto de ${person.name}</h3><p>A imagem fica associada a esta pessoa neste navegador e também aparece no cartão da árvore.</p><input class="photo-input" type="file" accept="image/*" hidden /><button class="photo-button" type="button">Escolher ou trocar foto</button><small class="photo-status">A foto não é enviada para a internet.</small></div>`;
    host.prepend(area);
    const input=area.querySelector('.photo-input'),button=area.querySelector('.photo-button'),frame=area.querySelector('.photo-frame'),status=area.querySelector('.photo-status');
    const initialSource=sources.get(personId);if(initialSource)showInFrame(frame,initialSource);
    await savedPhotosReady;
    const savedSource=sources.get(personId);if(savedSource)showInFrame(frame,savedSource);
    button.addEventListener('click',()=>input.click());
    input.addEventListener('change',()=>{const file=input.files&&input.files[0];if(!file)return;if(!file.type.startsWith('image/')){status.textContent='Escolha um arquivo de imagem.';return}const reader=new FileReader();reader.onload=async()=>{showInFrame(frame,reader.result);sources.set(personId,reader.result);attachTreePhotos();status.textContent='Salvando a foto neste navegador…';try{await savePhoto(personId,reader.result,file);status.textContent='Foto salva e ligada a esta pessoa.'}catch(error){status.textContent='A foto apareceu, mas não pôde ser salva neste navegador.'}};reader.readAsDataURL(file)});
  }
  addPhotoArea();
  new MutationObserver(addPhotoArea).observe(document.querySelector('#detail-content'),{childList:true});
  let refreshQueued=false;
  new MutationObserver(()=>{if(refreshQueued)return;refreshQueued=true;queueMicrotask(()=>{refreshQueued=false;attachTreePhotos()})}).observe(document.querySelector('#tree'),{childList:true,subtree:true});
  refreshTreePhotos();
})();
