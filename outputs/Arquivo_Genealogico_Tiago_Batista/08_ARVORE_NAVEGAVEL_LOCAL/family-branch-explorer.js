/* Árvore clássica de descendência: casais acima, filhos abaixo e novas uniões na sequência. */
(function () {
  let showPaternalSiblings=false;
  let showMaternalSiblings=false;
  let showEveraldoChildren=false;
  let showIvanChildren=false;
  let showIvanethChildren=false;
  let showIvanizeChildren=false;
  let showEdsonChildren=false;
  let showJoseSiblings=false;
  let showBatistaParentsChildren=true;
  let focusMode=false;
  let showIvanildoChildren=false;
  const visibleDescendants={'tatiana-eduardo':false,'tiago-thais':false,'taina-alessandro':false,'diego-priscila':false};
  const openFamilyBranches=new Set();
  const familyUnits={
    'antonio-simone':{parents:['antonio-vitorino'],children:['simone-filha-antonio'],label:'Antônio — descendência possível'},
    'cleusa-jesse':{parents:['cleusa-porcina','jesse-porcina'],children:['gleiton-porcina','patricia-porcina','beatriz-porcina'],label:'Cleusa e Jessé'},
    'jose-iraci':{parents:['jose','iraci'],children:['everaldo','ivan','ivanildo','ivaneth','ivanize','edson'],label:'José e Iraci'},
    'everaldo-mikita':{parents:['everaldo','mikita-everaldo'],children:['jorge-everaldo','kleber-everaldo','leila-everaldo','kelly-everaldo'],label:'Everaldo e Mikita'},
    'kleber-pedro':{parents:['kleber-everaldo'],children:['pedro-kleber'],label:'Kleber'},
    'leila-gustavo':{parents:['leila-everaldo','gustavo-leila'],children:[],pendingChildren:1,label:'Leila e Gustavo'},
    'ivanildo-maria':{parents:['ivanildo','maria-carmo'],children:['tatiana-batista','tiago','taina-batista','diego-batista'],label:'Ivanildo e Maria do Carmo'},
    'tatiana-eduardo':{parents:['tatiana-batista','eduardo-santana'],children:['eduardo-filho','maria-clara','gabriel-santana'],label:'Tatiana e Eduardo'},
    'gabriel-gabriela':{parents:['gabriel-santana','gabriela-companheira'],children:[],label:'Gabriel e Gabriela'},
    'tiago-thais':{parents:['tiago','thais'],children:['marina'],label:'Tiago e Thais'},
    'taina-alessandro':{parents:['taina-batista','alessandro-cremon'],children:['joao-cremon','alice-cremon'],label:'Tainã e Alessandro'},
    'diego-priscila':{parents:['diego-batista','priscila-maciel'],children:['davi-rodrigues','maria-luiza-rodrigues'],label:'Diego e Priscila'}
  };
  const childFamily={'everaldo':'everaldo-mikita','kleber-everaldo':'kleber-pedro','leila-everaldo':'leila-gustavo','ivanildo':'ivanildo-maria','tatiana-batista':'tatiana-eduardo','gabriel-santana':'gabriel-gabriela','tiago':'tiago-thais','taina-batista':'taina-alessandro','diego-batista':'diego-priscila'};
  function personCard(id){const p=byId[id];if(!p)return '';const isMemorial=p.death||p.deathPending;const dates=isMemorial?`<small class="memorial-date">${p.birth?`${p.birth} <span aria-hidden="true">•</span> `:''}<span aria-hidden="true">†</span> ${p.death||'data pendente'}</small>`:'';return `<button class="branch-person ${p.tone||'verified'} ${isMemorial?'deceased':''} ${id===selected?'active':''}" data-tree-person="${id}" type="button" aria-label="Abrir perfil de ${p.name}"><span class="portrait" data-photo-person="${id}" aria-hidden="true"><span>${p.name.trim().charAt(0)}</span></span><span class="tree-card-copy"><strong>${p.name}</strong>${dates}</span></button>`}
  function couple(ids,label){return `<article class="desc-couple"><span class="couple-label">${label}</span><div>${ids.map(personCard).join('')}</div></article>`}
  function parentsOpeningChildren(ids,label,count){return `<article class="grandparent-branch family-with-toggle">${couple(ids,label)}<button class="family-expand inline-family-expand" type="button" data-toggle-batista-children aria-expanded="${showBatistaParentsChildren}">${showBatistaParentsChildren?'− Fechar filhos':`+ Abrir filhos (${count})`}</button></article>`}
  function siblingGroup(ids,label){return `<article class="desc-couple desc-sibling-group"><span class="couple-label">${label}</span><div>${ids.map(personCard).join('')}</div></article>`}
  function coupleWithChildren(ids,label,key,count,isOpen){return `<article class="desc-couple family-with-toggle"><span class="couple-label">${label}</span><div>${ids.map(personCard).join('')}</div><button class="family-expand" type="button" data-toggle-descendants="${key}" aria-expanded="${isOpen}">${isOpen?'− Fechar filhos':`+ Abrir filhos (${count})`}</button></article>`}
  function joseIraciCouple(){return `<article class="desc-couple family-with-toggle"><span class="couple-label">José e Iraci</span><div>${['jose','iraci'].map(personCard).join('')}</div><button class="family-expand" type="button" data-toggle-paternal-siblings aria-expanded="${showPaternalSiblings}">${showPaternalSiblings?'− Fechar filhos':'+ Abrir filhos (6)'}</button></article>`}
  function generation(label,period,content,extra=''){return `<section class="desc-generation ${extra}"><header><b>${period}</b><span>${label}</span></header><div class="desc-level">${content}</div></section>`}
  function bindTreeCards(){document.querySelectorAll('[data-tree-person]').forEach(button=>button.addEventListener('click',()=>{selected=button.dataset.treePerson;if(focusMode){renderFocusedTree(selected)}else{document.querySelectorAll('[data-tree-person]').forEach(card=>card.classList.toggle('active',card.dataset.treePerson===selected))}renderDetail();if(window.openFamilyProfile)window.openFamilyProfile()}));if(window.refreshGenealogyPhotos)window.refreshGenealogyPhotos();requestAnimationFrame(()=>requestAnimationFrame(drawKinshipLines))}
  function renderFamilyUnit(id,isNested=false){const unit=familyUnits[id];if(!unit)return '';const hasChildren=unit.children.length||unit.pendingChildren;const isOpen=openFamilyBranches.has(id);const children=isOpen&&unit.children.length?`<div class="unit-children">${unit.children.map(child=>`<div class="unit-child">${childFamily[child]?renderFamilyUnit(childFamily[child],true):personCard(child)}</div>`).join('')}</div>`:'';const pending=isOpen&&unit.pendingChildren?`<div class="pending-child-note">1 filho informado — nome pendente</div>`:'';return `<article class="family-unit ${isNested?'nested-unit':'root-unit'}" data-family-unit="${id}"><span class="couple-label">${unit.label}</span><div class="unit-couple">${unit.parents.map(personCard).join('')}</div>${hasChildren?`<button class="unit-toggle" type="button" data-family-toggle="${id}" aria-expanded="${isOpen}">${isOpen?'− Fechar filhos':`+ Abrir filhos${unit.children.length?` (${unit.children.length})`:''}`}</button>`:''}${children}${pending}</article>`}
  function renderDescendantTree(){
    focusMode=false;
    const joseSiblings=showJoseSiblings?`<div class="grandparent-siblings">${personCard('donzilia')}${personCard('romeu-pereira')}${personCard('elisa-pereira')}</div>`:'';
    const pereiraOrigin=`<article class="grandparent-branch">${couple(['joventino','maria-joaquina'],'Origem Pereira')}<button class="family-expand inline-family-expand" type="button" data-toggle-jose-siblings aria-expanded="${showJoseSiblings}">${showJoseSiblings?'− Fechar outros filhos':'+ Abrir filhos (4)'}</button>${joseSiblings}</article>`;
    const batistaOrigin=showBatistaParentsChildren?couple(['antonio','maria-joana'],'Antonio e Maria Joana'):'';
    const origins=[pereiraOrigin,batistaOrigin].join('');
    const batistaAncestors=[parentsOpeningChildren(['eleuterio-batista','vicentina-maria'],'Eleutério e Vicentina',1),parentsOpeningChildren(['joana-maria-lima'],'Joana Maria de Lima',1)].join('');
    const earlierAncestors=generation('Antecessores informados','Antes de 1905',batistaAncestors,'earlier-ancestors');
    const grandparents=[joseIraciCouple(),`<div>${couple(['joao-vitorino','maria-bendita'],'João Vitorino e Maria Bendita')}<button class="family-expand inline-family-expand" type="button" data-toggle-maternal-siblings aria-expanded="${showMaternalSiblings}">${showMaternalSiblings?'− Fechar irmãos de Maria do Carmo':'+ Abrir irmãos de Maria do Carmo (4)'}</button></div>`].join('');
    const maternalBranch=showMaternalSiblings?`<section class="maternal-sibling-drawer" aria-label="Irmãos informados de Maria do Carmo"><span class="branch-anchor">Irmãos de Maria do Carmo — relato familiar</span><div class="maternal-siblings-row">${renderFamilyUnit('antonio-simone')}${couple(['abadia-vitorino'],'Abadia')}${couple(['aparecida-max'],'Aparecida')}${renderFamilyUnit('cleusa-jesse')}</div></section>`:'';
    const parents=coupleWithChildren(['ivanildo','maria-carmo'],'Ivanildo e Maria do Carmo','ivanildo-maria',4,showIvanildoChildren);
    const everaldoChildren=showEveraldoChildren?`<span class="branch-subtitle">Filhos</span><div class="everaldo-children">${['jorge-everaldo','kleber-everaldo','leila-everaldo','kelly-everaldo'].map(personCard).join('')}</div>`:'';
    const everaldoBranch=`<article class="desc-couple everaldo-branch"><span class="couple-label">Everaldo e Mikita</span><div class="everaldo-couple">${personCard('everaldo')}${personCard('mikita-everaldo')}</div><button class="family-expand inline-family-expand" type="button" data-toggle-everaldo-children aria-expanded="${showEveraldoChildren}">${showEveraldoChildren?'− Fechar filhos':'+ Abrir filhos'}</button>${everaldoChildren}</article>`;
    const ivanChildren=showIvanChildren?`<span class="branch-subtitle">Filho</span><div class="ivan-children">${personCard('fernando-angelo')}</div>`:'';
    const ivanBranch=`<article class="desc-couple ivan-branch"><span class="couple-label">Ivan e Helena</span><div class="ivan-couple">${personCard('ivan')}${personCard('helena-ivan')}</div><button class="family-expand inline-family-expand" type="button" data-toggle-ivan-children aria-expanded="${showIvanChildren}">${showIvanChildren?'− Fechar filhos':'+ Abrir filhos'}</button>${ivanChildren}</article>`;
    const ivanethChildren=showIvanethChildren?`<span class="branch-subtitle">Filhos</span><div class="ivaneth-children">${['robson-ivaneth','jefferson-ivaneth','everton-ivaneth','clayton-ivaneth'].map(personCard).join('')}</div>`:'';
    const ivanethBranch=`<article class="desc-couple ivaneth-branch"><span class="couple-label">Ivaneth e José Carlos</span><div class="ivaneth-couple">${personCard('ivaneth')}${personCard('jose-carlos-ivaneth')}</div><button class="family-expand inline-family-expand" type="button" data-toggle-ivaneth-children aria-expanded="${showIvanethChildren}">${showIvanethChildren?'− Fechar filhos':'+ Abrir filhos'}</button>${ivanethChildren}</article>`;
    const ivanizeChildren=showIvanizeChildren?`<span class="branch-subtitle">Filhos</span><div class="ivanize-children">${['fabiana-ivanize','luciana-ivanize','anderson-ivanize','dayana-ivanize'].map(personCard).join('')}</div>`:'';
    const ivanizeBranch=`<article class="desc-couple ivanize-branch"><span class="couple-label">Ivanize e Severino</span><div class="ivanize-couple">${personCard('ivanize')}${personCard('severino-ivanize')}</div><button class="family-expand inline-family-expand" type="button" data-toggle-ivanize-children aria-expanded="${showIvanizeChildren}">${showIvanizeChildren?'− Fechar filhos':'+ Abrir filhos'}</button>${ivanizeChildren}</article>`;
    const edsonChildren=showEdsonChildren?`<span class="branch-subtitle">Filha</span><div class="edson-children">${personCard('sara-paiva')}</div>`:'';
    const edsonBranch=`<article class="desc-couple edson-branch"><span class="couple-label">Edson e Rosana</span><div class="edson-couple">${personCard('edson')}${personCard('rosana-paiva')}</div><button class="family-expand inline-family-expand" type="button" data-toggle-edson-children aria-expanded="${showEdsonChildren}">${showEdsonChildren?'− Fechar filha':'+ Abrir filha'}</button>${edsonChildren}</article>`;
    const siblingDrawer=showPaternalSiblings?`<div class="paternal-siblings-row">${everaldoBranch}${ivanBranch}<article class="desc-couple ivanildo-branch family-with-toggle"><span class="couple-label">Ivanildo e Maria do Carmo</span><div>${personCard('ivanildo')}${personCard('maria-carmo')}</div><button class="family-expand inline-family-expand" type="button" data-toggle-descendants="ivanildo-maria" aria-expanded="${showIvanildoChildren}">${showIvanildoChildren?'− Fechar filhos':'+ Abrir filhos (4)'}</button></article>${ivanethBranch}${ivanizeBranch}${edsonBranch}</div>`:'';
    const directPath=(showPaternalSiblings?`<div class="parents-expanded"><aside class="paternal-sibling-drawer"><span class="branch-anchor" data-tree-anchor="paternal-siblings">Filhos de José e Iraci</span>${siblingDrawer}</aside></div>`:`<div class="branch-collapsed-note">Filhos de José e Iraci recolhidos — use o botão acima</div>`)+maternalBranch;
    const current=showPaternalSiblings&&showIvanildoChildren?`<div class="current-siblings">${coupleWithChildren(['tatiana-batista','eduardo-santana'],'Tatiana e Eduardo','tatiana-eduardo',3,visibleDescendants['tatiana-eduardo'])}${coupleWithChildren(['tiago','thais'],'Tiago e Thais','tiago-thais',1,visibleDescendants['tiago-thais'])}${coupleWithChildren(['taina-batista','alessandro-cremon'],'Tainã e Alessandro','taina-alessandro',2,visibleDescendants['taina-alessandro'])}${coupleWithChildren(['diego-batista','priscila-maciel'],'Diego e Priscila','diego-priscila',2,visibleDescendants['diego-priscila'])}</div>`:`<div class="branch-collapsed-note">Geração recolhida</div>`;
    const tatianaFamily=`<article class="desc-couple desc-sibling-group tatiana-family"><span class="couple-label">Núcleo familiar de Tatiana e Eduardo</span><div>${personCard('eduardo-filho')}${personCard('maria-clara')}<span class="young-couple">${personCard('gabriel-santana')}${personCard('gabriela-companheira')}</span></div></article>`;
    const hiddenGroup=label=>`<article class="desc-couple branch-placeholder"><span class="couple-label">${label}</span><div>Ramo recolhido</div></article>`;
    const newest=`<div class="newest-families">${visibleDescendants['tatiana-eduardo']?tatianaFamily:hiddenGroup('Filhos de Tatiana e Eduardo')}${visibleDescendants['tiago-thais']?siblingGroup(['marina'],'Filha de Tiago e Thais'):hiddenGroup('Filha de Tiago e Thais')}${visibleDescendants['taina-alessandro']?siblingGroup(['joao-cremon','alice-cremon'],'Filhos de Tainã e Alessandro'):hiddenGroup('Filhos de Tainã e Alessandro')}${visibleDescendants['diego-priscila']?siblingGroup(['davi-rodrigues','maria-luiza-rodrigues'],'Filhos de Diego e Priscila'):hiddenGroup('Filhos de Diego e Priscila')}</div>`;
    document.querySelector('#tree').innerHTML=`<div class="descendant-tree" role="region" aria-label="Árvore genealógica de descendência em ordem cronológica"><svg class="kinship-lines" aria-hidden="true"></svg>${earlierAncestors}${generation('Origens familiares','c. 1877',origins,'origins')}${generation('Avós maternos e paternos','1920',grandparents,'grandparents')}${generation('Geração dos pais','c. 1940',directPath,'parents')}${generation('Geração seguinte','1980',current,'current')}${generation('Nova geração','2021',newest,'newest')}</div>`;
    bindTreeCards();
    document.querySelector('[data-toggle-maternal-siblings]')?.addEventListener('click',()=>{showMaternalSiblings=!showMaternalSiblings;renderDescendantTree()});
    document.querySelectorAll('[data-family-toggle]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.familyToggle;if(openFamilyBranches.has(key))openFamilyBranches.delete(key);else openFamilyBranches.add(key);renderDescendantTree()}));
    document.querySelector('[data-toggle-paternal-siblings]')?.addEventListener('click',()=>{showPaternalSiblings=!showPaternalSiblings;renderDescendantTree()});
    document.querySelector('[data-toggle-everaldo-children]')?.addEventListener('click',()=>{showEveraldoChildren=!showEveraldoChildren;renderDescendantTree()});
    document.querySelector('[data-toggle-ivan-children]')?.addEventListener('click',()=>{showIvanChildren=!showIvanChildren;renderDescendantTree()});
    document.querySelector('[data-toggle-ivaneth-children]')?.addEventListener('click',()=>{showIvanethChildren=!showIvanethChildren;renderDescendantTree()});
    document.querySelector('[data-toggle-ivanize-children]')?.addEventListener('click',()=>{showIvanizeChildren=!showIvanizeChildren;renderDescendantTree()});
    document.querySelector('[data-toggle-edson-children]')?.addEventListener('click',()=>{showEdsonChildren=!showEdsonChildren;renderDescendantTree()});
    document.querySelector('[data-toggle-jose-siblings]')?.addEventListener('click',()=>{showJoseSiblings=!showJoseSiblings;renderDescendantTree()});
    document.querySelectorAll('[data-toggle-batista-children]').forEach(button=>button.addEventListener('click',()=>{showBatistaParentsChildren=!showBatistaParentsChildren;renderDescendantTree()}));
    document.querySelectorAll('[data-toggle-descendants]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.toggleDescendants;if(key==='ivanildo-maria')showIvanildoChildren=!showIvanildoChildren;else visibleDescendants[key]=!visibleDescendants[key];renderDescendantTree()}));
  }
  function renderFocusedTree(id){const rel=(window.familyRelations&&window.familyRelations[id])||{parents:[],children:[],siblings:[],spouse:[]};selected=id;focusMode=true;const parentIds=rel.parents.filter(pid=>byId[pid]);const grandIds=[...new Set(parentIds.flatMap(pid=>((window.familyRelations&&window.familyRelations[pid])||{parents:[]}).parents||[]))].filter(pid=>byId[pid]);const centerIds=[id,...rel.spouse].filter((pid,index,array)=>byId[pid]&&array.indexOf(pid)===index);const rows=[];if(grandIds.length)rows.push(generation('Avós e antepassados','Acima',siblingGroup(grandIds,'Avós'),'focus-ancestors'));if(parentIds.length)rows.push(generation('Pais','Pais',couple(parentIds,'Pais'),'focus-parents'));rows.push(generation('Pessoa escolhida','Você',couple(centerIds,centerIds.length>1?'Casal / companheiros':'Pessoa central'),'focus-center'));if(rel.siblings.length)rows.push(`<details class="focus-siblings"><summary>+ Ver irmãos (${rel.siblings.length})</summary>${siblingGroup(rel.siblings,'Irmãos')}</details>`);if(rel.children.length)rows.push(generation('Filhos','Abaixo',siblingGroup(rel.children,'Filhos'),'focus-children'));document.querySelector('#tree').innerHTML=`<div class="descendant-tree focus-tree" role="region" aria-label="Árvore familiar centrada em ${byId[id].name}"><svg class="kinship-lines" aria-hidden="true"></svg><div class="focus-heading"><span>Árvore a partir de</span><strong>${byId[id].name}</strong></div>${rows.join('')}</div>`;document.querySelector('#show-full-tree').hidden=false;bindTreeCards()}
  const familyLinks=[
    {parents:['antonio-vitorino'],children:['simone-filha-antonio']},
    {parents:['cleusa-porcina','jesse-porcina'],children:['gleiton-porcina','patricia-porcina','beatriz-porcina']},
    {parents:['eleuterio-batista','vicentina-maria'],children:['antonio']},
    {parents:['joana-maria-lima'],children:['maria-joana']},
    {parents:['joventino','maria-joaquina'],children:['jose']},
    {parents:['joventino','maria-joaquina'],children:['donzilia','romeu-pereira','elisa-pereira']},
    {parents:['antonio','maria-joana'],children:['iraci']},
    {parents:['jose','iraci'],children:['paternal-siblings']},
    {parents:['paternal-siblings'],children:['everaldo','ivan','ivanildo','ivaneth','ivanize','edson']},
    {parents:['joao-vitorino','maria-bendita'],children:['maria-carmo']},
    {parents:['ivanildo','maria-carmo'],children:['tatiana-batista','tiago','taina-batista','diego-batista']},
    {parents:['tatiana-batista','eduardo-santana'],children:['gabriel-santana','eduardo-filho','maria-clara']},
    {parents:['tiago','thais'],children:['marina']},
    {parents:['taina-batista','alessandro-cremon'],children:['joao-cremon','alice-cremon']},
    {parents:['diego-batista','priscila-maciel'],children:['davi-rodrigues','maria-luiza-rodrigues']}
    ,{parents:['everaldo','mikita-everaldo'],children:['jorge-everaldo','kleber-everaldo','leila-everaldo','kelly-everaldo']}
    ,{parents:['ivan','helena-ivan'],children:['fernando-angelo']}
    ,{parents:['ivaneth','jose-carlos-ivaneth'],children:['robson-ivaneth','jefferson-ivaneth','everton-ivaneth','clayton-ivaneth']}
    ,{parents:['ivanize','severino-ivanize'],children:['fabiana-ivanize','luciana-ivanize','anderson-ivanize','dayana-ivanize']}
    ,{parents:['edson','rosana-paiva'],children:['sara-paiva']}
  ];
  function drawKinshipLines(){
    const tree=document.querySelector('.descendant-tree'),svg=tree&&tree.querySelector('.kinship-lines');if(!tree||!svg)return;
    const treeRect=tree.getBoundingClientRect(),scrollTop=tree.scrollTop,scrollLeft=tree.scrollLeft,width=tree.scrollWidth,height=tree.scrollHeight;
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.setAttribute('width',width);svg.setAttribute('height',height);
    const point=(id,edge)=>{const el=tree.querySelector(`[data-tree-person="${id}"]`)||tree.querySelector(`[data-tree-anchor="${id}"]`);if(!el)return null;const r=el.getBoundingClientRect();return{x:r.left-treeRect.left+scrollLeft+r.width/2,y:(edge==='bottom'?r.bottom:r.top)-treeRect.top+scrollTop}};
    const paths=[];
    familyLinks.forEach(family=>{const parents=family.parents.map(id=>point(id,'bottom')).filter(Boolean),children=family.children.map(id=>point(id,'top')).filter(Boolean);if(!parents.length||!children.length)return;const parentY=Math.max(...parents.map(p=>p.y))+13,parentLeft=Math.min(...parents.map(p=>p.x)),parentRight=Math.max(...parents.map(p=>p.x)),unionX=(parentLeft+parentRight)/2,childTop=Math.min(...children.map(c=>c.y)),gap=childTop-parentY,branchY=gap>260?childTop-20:parentY+gap*.48;parents.forEach(p=>paths.push(`M${p.x} ${p.y}V${parentY}`));if(parents.length>1)paths.push(`M${parentLeft} ${parentY}H${parentRight}`);paths.push(`M${unionX} ${parentY}V${branchY}`);children.forEach(c=>paths.push(`M${unionX} ${branchY}H${c.x}V${c.y}`))});
    svg.innerHTML=`<path d="${paths.join('')}"/>`;
  }
  window.addEventListener('resize',()=>requestAnimationFrame(drawKinshipLines));
  window.renderFamilyBranch=renderDescendantTree;
  window.focusFamilyBranch=function(id){if(!byId[id])return;renderFocusedTree(id);renderDetail();if(window.openFamilyProfile)window.openFamilyProfile()};
  const oldSearch=document.querySelector('#search'),treeSearch=oldSearch.cloneNode(true);oldSearch.replaceWith(treeSearch);
  const list=document.createElement('datalist');list.id='family-people';list.innerHTML=people.map(p=>`<option value="${p.name}"></option>`).join('');treeSearch.setAttribute('list','family-people');treeSearch.after(list);
  function openSearch(){const term=treeSearch.value.trim().toLocaleLowerCase();if(!term)return;const match=people.find(p=>p.name.toLocaleLowerCase()===term)||people.find(p=>p.name.toLocaleLowerCase().includes(term));if(match){treeSearch.value=match.name;window.focusFamilyBranch(match.id)}}
  treeSearch.addEventListener('change',openSearch);treeSearch.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();openSearch()}});
  document.querySelector('#enter-family')?.addEventListener('click',openSearch);document.querySelector('#show-full-tree')?.addEventListener('click',()=>{focusMode=false;treeSearch.value='';document.querySelector('#show-full-tree').hidden=true;renderDescendantTree()});
  renderDescendantTree();
})();
