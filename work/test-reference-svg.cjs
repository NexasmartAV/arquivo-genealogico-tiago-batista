const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../outputs/Arquivo_Genealogico_Tiago_Batista/08_ARVORE_NAVEGAVEL_LOCAL');
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
class Node {
  constructor(attributes={}){this.attributes=attributes;this.dataset={};for(const[k,v]of Object.entries(attributes))if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=v;this.style={};this.textContent='';this.innerHTML='';this.hidden=false;this.value='';this.scrollLeft=this.scrollTop=0;this.clientWidth=1200;this.clientHeight=800;this.events={};this.children=new Map();this.classList={add(){},remove(){}};}
  addEventListener(event,fn){this.events[event]=fn;}
  cloneNode(){return new Node(this.attributes);}
  replaceWith(){}
  insertAdjacentHTML(position,html){this.innerHTML+=html;}
  querySelector(selector){if(!this.children.has(selector))this.children.set(selector,new Node());return this.children.get(selector);}
  querySelectorAll(selector){const attr=selector.match(/^\[([^\]]+)\]$/)?.[1];if(!attr)return[];if(this.listSource!==this.innerHTML){this.listSource=this.innerHTML;this.listCache=new Map()}if(!this.listCache.has(selector))this.listCache.set(selector,[...this.innerHTML.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(m=>new Node(attrs(m[1]))).filter(n=>Object.hasOwn(n.attributes,attr)));return this.listCache.get(selector);}
  setPointerCapture(){}
}
const elements=new Map();const document={querySelector(s){if(!elements.has(s))elements.set(s,new Node());return elements.get(s)},querySelectorAll(){return[]}};
const sandbox={console,document,window:{},setTimeout(){},requestAnimationFrame(){}};
const context=vm.createContext(sandbox);
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
vm.runInContext(app.slice(0,app.indexOf('const groups='))+"\nconst byId=Object.fromEntries(people.map(p=>[p.id,p]));let selected='jose';let renderDetail=()=>{};",context);
vm.runInContext(fs.readFileSync(path.join(root,'family-navigator.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'family-reference-tree.js'),'utf8'),context);
const host=elements.get('#tree');const canvas=host.querySelector('.reference-canvas');
function parseSegments(d,pathId,attributes){
 const parts=[...d.matchAll(/([MmLlHhVv])\s*([-+\d.eE]+)(?:[ ,]+([-+\d.eE]+))?/g)];
 const out=[];let x=0,y=0;
 for(const [,c,a,b]of parts){const n=+a,m=+b;let nx=x,ny=y;if(c==='M'||c==='L'){nx=n;ny=m}else if(c==='m'||c==='l'){nx+=n;ny+=m}else if(c==='H')nx=n;else if(c==='h')nx+=n;else if(c==='V')ny=n;else if(c==='v')ny+=n;
  if(!/[mM]/.test(c)&&(nx!==x||ny!==y))out.push({x1:x,y1:y,x2:nx,y2:ny,pathId,attributes});x=nx;y=ny;
 }
 return out;
}
function inspect(mode){
 const siblingLinks=[...canvas.innerHTML.matchAll(/<g\b([^>]*)>([\s\S]*?)<\/g>/g)].map(m=>({...attrs(m[1]),body:m[2]})).filter(a=>a['data-sibling-people']).map(a=>({ids:a['data-sibling-people'].split(' '),dotted:a.body.includes('class="sibling-report"')}));
 const descents=[...canvas.innerHTML.matchAll(/<g\b([^>]*)>/g)].map(m=>attrs(m[1])).filter(a=>a['data-parent-family']).map(a=>({parent:a['data-parent-family'],children:a['data-children'].split(' ')}));
 const paths=[...canvas.innerHTML.matchAll(/<path\b([^>]*)\/?\s*>/g)].map(m=>attrs(m[1])).filter(a=>a.class!=='connection-clearance');
 const segments=paths.flatMap((a,i)=>parseSegments(a.d,i,a));
 const overlaps=[];
 const horizontals=segments.filter(s=>Math.abs(s.y1-s.y2)<.001);
 for(let i=0;i<horizontals.length;i++)for(let j=i+1;j<horizontals.length;j++){const a=horizontals[i],b=horizontals[j];if(a.pathId===b.pathId||Math.abs(a.y1-b.y1)>.001)continue;const length=Math.min(Math.max(a.x1,a.x2),Math.max(b.x1,b.x2))-Math.max(Math.min(a.x1,a.x2),Math.min(b.x1,b.x2));if(length>.1)overlaps.push({a:a.pathId,b:b.pathId,y:a.y1,length,aAttrs:a.attributes,bAttrs:b.attributes});}
 const persons=[...canvas.innerHTML.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(m=>({...attrs(m[1]),body:m[2]})).filter(a=>a['data-reference-person']);
 const counts={};persons.forEach(p=>counts[p['data-reference-person']]=(counts[p['data-reference-person']]||0)+1);
 const duplicates=Object.entries(counts).filter(([,n])=>n!==1);
 const pos=id=>{const a=persons.find(a=>a['data-reference-person']===id);if(!a)return null;const left=+a.style.match(/left:([\d.+-]+)/)?.[1],top=+a.style.match(/top:([\d.+-]+)/)?.[1];return {left,top,centerX:left+75}};
 const thais=pos('thais'),dirceu=pos('dirceu-vale'),jandira=pos('jandira-bispo');
 const positions=persons.map(a=>({id:a['data-reference-person'],...pos(a['data-reference-person'])}));
 const donzilia=persons.find(a=>a['data-reference-person']==='donzilia');
 return {mode,persons:persons.length,paths:paths.length,duplicatePeople:duplicates,horizontalOverlapCount:overlaps.length,overlaps,thais,dirceu,jandira,thaisParentCenterOffset:thais&&dirceu&&jandira?((dirceu.centerX+jandira.centerX)/2-thais.centerX):null,descents,siblingLinks,donziliaMemorial:!!donzilia&&donzilia.class.split(' ').includes('memorial')&&donzilia.body.includes('reference-crown')&&donzilia.body.includes('† 2013'),positions,coordinates: ['tiago','thais','ivanildo','maria-carmo','marina','tatiana-batista','eduardo-santana','maria-clara','eduardo-filho','robson-ivaneth','jefferson-ivaneth','everton-ivaneth','clayton-ivaneth'].map(id=>({id,...pos(id)}))};
}
const initial=inspect('initial');
host.querySelectorAll('[data-view]').find(b=>b.dataset.view==='all').events.click();
const all=inspect('all');
const rel=sandbox.window.familyRelations;
const routeErrors=[];
for(const route of all.descents){const allowed=new Set([route.parent,...(rel[route.parent]?.spouse||[])].flatMap(id=>rel[id]?.children||[]));if(route.children.some(id=>!allowed.has(id))||route.children.length!==allowed.size)routeErrors.push({route,allowed:[...allowed]})}
const checks=[['Tiago children',JSON.stringify(rel.tiago.children)==='["marina"]'],['Thais children',JSON.stringify(rel.thais.children)==='["marina"]'],['Thais parents',JSON.stringify(rel.thais.parents)==='["dirceu-vale","jandira-bispo"]'],['No duplicate people',!initial.duplicatePeople.length&&!all.duplicatePeople.length],['No merged horizontal family lines',all.horizontalOverlapCount===0],['Rendered child endpoints match parent data',all.descents.length>0&&routeErrors.length===0],['Tiago descent only Marina',JSON.stringify(all.descents.find(d=>d.parent==='tiago')?.children)==='["marina"]'],['Dirceu descent only Thais',JSON.stringify(all.descents.find(d=>d.parent==='dirceu-vale')?.children)==='["thais"]']];
const tiagoSiblings=['tiago','taina-batista','diego-batista','tatiana-batista'];
const familyIds=new Set(tiagoSiblings.flatMap(id=>[id,...rel[id].spouse]));
const familyPositions=all.positions.filter(p=>familyIds.has(p.id));
const sameGeneration=familyPositions.length===familyIds.size&&new Set(familyPositions.map(p=>p.top)).size===1;
const minimum=Math.min(...familyPositions.map(p=>p.centerX)),maximum=Math.max(...familyPositions.map(p=>p.centerX)),top=familyPositions[0]?.top;
const interposed=all.positions.filter(p=>p.top===top&&p.centerX>minimum&&p.centerX<maximum&&!familyIds.has(p.id));
checks.push(['Tiago e irmãos contíguos sem primos entre os casais',sameGeneration&&interposed.length===0]);
const ivanethOrder=['robson-ivaneth','jefferson-ivaneth','everton-ivaneth','clayton-ivaneth'];
const ivanethVisual=all.positions.filter(p=>ivanethOrder.includes(p.id)).sort((a,b)=>a.centerX-b.centerX).map(p=>p.id);
checks.push(['Ordem Robson Jefferson Everton Clayton',JSON.stringify(ivanethOrder)===JSON.stringify(ivanethVisual)]);
const css=fs.readFileSync(path.join(root,'family-reference-tree.css'),'utf8');
const dottedStyle=/\.sibling-report\s*\{[^}]*stroke-dasharray\s*:[^;}]+/.test(css);
for(const [label,expected]of [['Maria do Carmo',['maria-carmo','antonio-vitorino','abadia-vitorino','aparecida-max','cleusa-porcina']],['Iraci',['iraci','helena-irma-iraci','nana-irma-iraci']]])checks.push([`Irmãos de ${label} com linha pontilhada própria`,dottedStyle&&all.siblingLinks.some(link=>link.dotted&&expected.every(id=>link.ids.includes(id))&&link.ids.length===expected.length)]);
checks.push(['Donzilia com memorial coroa e óbito 2013',all.donziliaMemorial]);
const jpos=id=>all.positions.find(p=>p.id===id)?.centerX;
checks.push(['Irmãos de José continuam à esquerda',['donzilia','romeu-pereira','elisa-pereira'].every(id=>jpos(id)<jpos('jose'))]);
const expectedSiblingSets=new Set(Object.entries(rel).filter(([,r])=>r.siblings.length).map(([id,r])=>[id,...r.siblings].sort().join('|')));
checks.push(['Mesmo pontilhado para todos os conjuntos de irmãos',[...expectedSiblingSets].every(set=>all.siblingLinks.some(link=>link.dotted&&[...link.ids].sort().join('|')===set))]);
canvas.querySelectorAll('[data-reference-toggle]').find(b=>b.dataset.referenceToggle==='ivanildo').events.click();
const collapsed=inspect('father-closed');
checks.push(['Fechar Ivanildo não deixa Tiago solto via Thais',!collapsed.positions.some(p=>['tiago','thais','marina'].includes(p.id))]);
canvas.querySelectorAll('[data-reference-toggle]').find(b=>b.dataset.referenceToggle==='ivanildo').events.click();
const reopened=inspect('father-reopened');
checks.push(['Reabrir Ivanildo restaura os quatro irmãos',tiagoSiblings.every(id=>reopened.positions.some(p=>p.id===id))]);
host.querySelectorAll('[data-view]').find(b=>b.dataset.view==='reset').events.click();
const reset=inspect('reset');
checks.push(['Recolher ramos não deixa descendentes soltos',!reset.positions.some(p=>['tiago','thais','ivanildo','jose'].includes(p.id))]);
const compact=result=>{const {positions,...rest}=result;return rest};
console.log(JSON.stringify({checks,diagnostics:{interposed,ivanethVisual},initial:compact(initial),all:compact(all)},null,2));
if(checks.some(([,pass])=>!pass))process.exitCode=1;
