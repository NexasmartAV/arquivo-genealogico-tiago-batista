const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const filename=path.resolve(__dirname,'../outputs/Arquivo_Genealogico_Tiago_Batista/08_ARVORE_NAVEGAVEL_LOCAL/photo-preview.js');
const source=fs.readFileSync(filename,'utf8');

function fixture(selected='iraci'){
  const stats={opens:0,reads:0,writes:0,imageCreations:0,srcAssignments:0};
  class Element {
    constructor(tag='div'){this.tagName=tag;this.attrs={};this.dataset={};this.children=[];this.parentNode=null;this.events={};this.selectors=new Map();this.hidden=false;this.textContent='';this.className='';}
    set src(value){this.attrs.src=value;stats.srcAssignments++;}
    get src(){return this.attrs.src;}
    getAttribute(key){return this.attrs[key]??null;}
    set innerHTML(value){this.html=value;if(this.tagName==='section'){
      const frame=new Element();const img=new Element('img');img.hidden=true;const label=new Element('span');frame.replaceChildren(img,label);
      this.selectors.set('.photo-frame',frame);this.selectors.set('.photo-input',new Element('input'));this.selectors.set('.photo-button',new Element('button'));this.selectors.set('.photo-status',new Element('small'));
    }}
    get innerHTML(){return this.html||'';}
    querySelector(selector){if(this.selectors.has(selector))return this.selectors.get(selector);if(selector==='img'||selector==='span')return this.children.find(c=>c.tagName===selector)||null;if(selector==='.photo-area')return this.children.find(c=>c.className==='photo-area')||null;return null;}
    replaceChildren(...children){for(const old of this.children)old.parentNode=null;this.children=[];for(const child of children){if(child.parentNode)child.parentNode.children=child.parentNode.children.filter(c=>c!==child);child.parentNode=this;this.children.push(child)}}
    prepend(child){child.parentNode=this;this.children.unshift(child)}
    addEventListener(name,fn){this.events[name]=fn}
    click(){this.events.click?.()}
  }
  const detail=new Element(),tree=new Element();
  let portraits=[];
  const env={stats,openRequest:null,readRequest:null,writeRequest:null,lastWrite:null};
  env.rebuild=(ids=['iraci','tiago'])=>{portraits=ids.map(id=>{const el=new Element();el.dataset.photoPerson=id;return el});return portraits};
  env.rebuild();
  const db={transaction(store,mode){const transaction={objectStore(){return {getAll(){stats.reads++;return env.readRequest={}},put(record){stats.writes++;env.lastWrite=record;return env.writeRequest={}}}}};if(mode==='readwrite')env.writeTransaction=transaction;return transaction}};
  const document={querySelector(s){return s==='#detail-content'?detail:s==='#tree'?tree:null},querySelectorAll(s){return s==='[data-photo-person]'?portraits:[]},createElement(tag){if(tag==='img')stats.imageCreations++;return new Element(tag)}};
  class FileReader {readAsDataURL(file){this.result=file.payload;env.readerPromise=this.onload()}}
  const context={document,window:{},selected,byId:{[selected]:{name:selected==='iraci'?'Iraci Pereira da Silva':'Tiago Batista da Silva'}},indexedDB:{open(){stats.opens++;return env.openRequest={}}},MutationObserver:class{constructor(fn){this.fn=fn}observe(){}},FileReader,queueMicrotask,Date,console};
  vm.runInNewContext(source,context,{filename});
  Object.assign(env,{detail,tree,context,portraits:()=>portraits,db});
  return env;
}
async function flush(){for(let i=0;i<8;i++)await Promise.resolve()}
async function open(env){env.openRequest.result=env.db;env.openRequest.onsuccess();await flush();assert.ok(env.readRequest,'Read must be queued after open')}
async function load(env,records=[]){await open(env);env.readRequest.result=records;env.readRequest.onsuccess();await flush();await env.context.window.refreshGenealogyPhotos()}
const outcomes=[];
function pass(name){outcomes.push(name)}

(async()=>{
  {
    const env=fixture();
    assert.equal(env.portraits()[0].querySelector('img').src,'assets/photos/iraci.jpeg');
    assert.equal(env.detail.querySelector('.photo-area').querySelector('.photo-frame').querySelector('img').src,'assets/photos/iraci.jpeg');
    assert.equal(env.stats.reads,0);assert.equal(env.stats.opens,1);
    pass('Default imediato na árvore e no perfil enquanto IndexedDB está pendente');
    env.openRequest.error=new Error('storage disabled');env.openRequest.onerror();await flush();await env.context.window.refreshGenealogyPhotos();
    assert.equal(env.portraits()[0].querySelector('img').src,'assets/photos/iraci.jpeg');
    pass('Falha ao abrir IndexedDB preserva default');
  }
  {
    const env=fixture();await open(env);env.readRequest.error=new Error('read failed');env.readRequest.onerror();await flush();await env.context.window.refreshGenealogyPhotos();
    assert.equal(env.portraits()[0].querySelector('img').src,'assets/photos/iraci.jpeg');assert.equal(env.stats.reads,1);
    pass('Falha de leitura IndexedDB preserva default');
  }
  {
    const env=fixture();const original=env.portraits()[0].querySelector('img');
    await load(env,[{personId:'iraci',dataUrl:'data:image/jpeg;base64,saved-iraci'},{personId:'tiago',dataUrl:'data:image/jpeg;base64,saved-tiago'}]);
    assert.equal(env.portraits()[0].querySelector('img'),original);
    assert.equal(original.src,'data:image/jpeg;base64,saved-iraci');
    assert.equal(env.portraits()[1].querySelector('img').src,'data:image/jpeg;base64,saved-tiago');
    pass('Foto salva substitui default e carrega pessoa sem default');
    const imageTiago=env.portraits()[1].querySelector('img'),srcAssignments=env.stats.srcAssignments;
    for(let round=0;round<5;round++){env.rebuild();await env.context.window.refreshGenealogyPhotos();assert.equal(env.portraits()[0].querySelector('img'),original);assert.equal(env.portraits()[1].querySelector('img'),imageTiago)}
    assert.equal(env.stats.opens,1);assert.equal(env.stats.reads,1);assert.equal(env.stats.imageCreations,2);assert.equal(env.stats.srcAssignments,srcAssignments);
    pass('Cinco reconstruções reutilizam os mesmos nós sem leitura nem src novos');
    const area=env.detail.querySelector('.photo-area'),input=area.querySelector('.photo-input'),status=area.querySelector('.photo-status');
    input.files=[{name:'nova.jpg',type:'image/jpeg',payload:'data:image/jpeg;base64,new-iraci'}];input.events.change();await flush();
    assert.equal(original.src,'data:image/jpeg;base64,new-iraci');assert.equal(env.lastWrite.personId,'iraci');
    let saveSettled=false;env.readerPromise.then(()=>{saveSettled=true});
    env.writeRequest.onsuccess?.();await flush();assert.equal(saveSettled,false);assert.equal(status.textContent,'Salvando a foto neste navegador…');
    pass('Sucesso do request não confirma gravação antes do commit da transação');
    env.writeTransaction.oncomplete();await env.readerPromise;
    assert.equal(status.textContent,'Foto salva e ligada a esta pessoa.');
    env.rebuild();await env.context.window.refreshGenealogyPhotos();assert.equal(env.portraits()[0].querySelector('img'),original);assert.equal(original.src,'data:image/jpeg;base64,new-iraci');assert.equal(env.stats.reads,1);
    pass('Troca atualiza o nó existente e sobrevive à próxima reconstrução');
    input.files=[{name:'outra.jpg',type:'image/jpeg',payload:'data:image/jpeg;base64,session-only'}];input.events.change();await flush();env.writeTransaction.error=new Error('quota');env.writeTransaction.onerror();await env.readerPromise;
    assert.equal(original.src,'data:image/jpeg;base64,session-only');assert.equal(status.textContent,'A foto apareceu, mas não pôde ser salva neste navegador.');
    env.rebuild();await env.context.window.refreshGenealogyPhotos();assert.equal(env.portraits()[0].querySelector('img').src,'data:image/jpeg;base64,session-only');
    pass('Falha ao salvar mantém foto nesta sessão e informa que não persistiu');
    input.files=[{name:'abort.jpg',type:'image/jpeg',payload:'data:image/jpeg;base64,aborted'}];input.events.change();await flush();env.writeTransaction.error=new Error('aborted');env.writeTransaction.onabort();await env.readerPromise;
    assert.equal(status.textContent,'A foto apareceu, mas não pôde ser salva neste navegador.');assert.equal(original.src,'data:image/jpeg;base64,aborted');
    pass('Abortar transação não informa foto salva');
  }
  console.log(JSON.stringify({passed:outcomes.length,outcomes},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
