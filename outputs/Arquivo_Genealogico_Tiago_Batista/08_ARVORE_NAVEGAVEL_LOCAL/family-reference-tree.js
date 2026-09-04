/* Reference layout: one horizontal row per generation; no wrapping relatives. */
(function () {
  const rel=window.familyRelations||{};
  const groups=[],owner=new Map(),expanded=new Set(),siblingsOpen=new Set();
  const escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  for(const p of people){
    if(owner.has(p.id))continue;
    const ids=[p.id,...(rel[p.id]?.spouse||[])].filter((id,i,a)=>byId[id]&&a.indexOf(id)===i&&!owner.has(id));
    const group={id:p.id,ids,children:[],parents:[],siblings:[],rank:0,x:0,width:ids.length*150+Math.max(0,ids.length-1)*28};
    groups.push(group);ids.forEach(id=>owner.set(id,group));
  }
  for(const g of groups){
    for(const id of g.ids){
      for(const child of rel[id]?.children||[]){
        const target=owner.get(child);if(!target||target===g)continue;
        if(!g.children.some(e=>e.person===child))g.children.push({group:target,person:child});
        if(!target.parents.includes(g))target.parents.push(g);
      }
      for(const sibling of rel[id]?.siblings||[]){const target=owner.get(sibling);if(target&&target!==g&&!g.siblings.includes(target))g.siblings.push(target)}
    }
  }
  // A marriage keeps the sibling block of its first recorded member. The
  // spouse's parents align to that spouse, without pulling the couple away.
  const primaryParent=g=>(rel[g.ids[0]]?.parents||[]).map(id=>owner.get(id)).find(Boolean)||g.parents[0];
  const displayChildren=g=>g.ids.includes('joventino')?[...g.children.filter(e=>e.person!=='jose'),...g.children.filter(e=>e.person==='jose')]:g.children;
  // Determine the ancestral roots of the family, not unrelated singleton records.
  const ancestry=new Set();
  function ancestors(g){if(!g||ancestry.has(g))return;ancestry.add(g);g.parents.forEach(ancestors)}
  ancestors(owner.get('tiago'));
  const roots=[...ancestry].filter(g=>!g.parents.length);
  const generationHints={'eleuterio-batista':0,'joana-maria-lima':0,joventino:1,'joao-vitorino':2};
  roots.forEach(g=>g.rank=generationHints[g.id]??0);
  for(let pass=0;pass<groups.length;pass++){
    let changed=false;
    for(const g of groups){
      for(const edge of g.children){const rank=g.rank+1;if(edge.group.rank<rank){edge.group.rank=rank;changed=true}}
      for(const sibling of g.siblings){const rank=Math.max(g.rank,sibling.rank);if(g.rank!==rank||sibling.rank!==rank){g.rank=rank;sibling.rank=rank;changed=true}}
    }
    if(!changed)break;
  }
  ancestry.forEach(g=>{if(g!==owner.get('tiago'))expanded.add(g.id)});
  // Ancestors with no older recorded generation sit immediately above their children.
  roots.forEach(g=>{if(g.children.length)g.rank=Math.max(g.rank,Math.min(...g.children.map(e=>e.group.rank))-1)});
  if(owner.get('antonio'))expanded.add(owner.get('antonio').id);
  let zoom=1,focusId=null,restoredView=null;
  const viewKey='family-reference-view-v2';
  try{const saved=JSON.parse(sessionStorage.getItem(viewKey)||'null');if(saved){restoredView=saved;expanded.clear();siblingsOpen.clear();saved.expanded?.forEach(id=>expanded.add(id));saved.siblings?.forEach(id=>siblingsOpen.add(id));zoom=saved.zoom||1;focusId=saved.focusId||null}}catch{}
  function rememberView(){try{sessionStorage.setItem(viewKey,JSON.stringify({expanded:[...expanded],siblings:[...siblingsOpen],zoom,focusId,scrollLeft:viewport.scrollLeft,scrollTop:viewport.scrollTop}))}catch{}}
  function revealParents(g,seen=new Set()){if(!g||seen.has(g))return;seen.add(g);g.parents.forEach(p=>{expanded.add(p.id);revealParents(p,seen)})}
  function closeBranch(g){const descendants=new Set();function collect(p){p.children.forEach(e=>{if(descendants.has(e.group))return;descendants.add(e.group);collect(e.group)})}collect(g);expanded.delete(g.id);for(const child of descendants){expanded.delete(child.id);child.ids.forEach(id=>siblingsOpen.delete(id));child.parents.forEach(p=>expanded.delete(p.id))}}
  const host=document.querySelector('#tree');
  host.innerHTML='<div class="reference-toolbar"><div><strong>Árvore da família</strong><span>Abra os ramos pelo + · Clique no retrato para ver detalhes</span></div><div class="reference-actions"><button data-view="out" aria-label="Diminuir árvore">−</button><output>100%</output><button data-view="in" aria-label="Ampliar árvore">+</button><button data-view="fit">Ajustar à tela</button><button data-view="all">Abrir tudo</button><button data-view="reset">Recolher ramos</button></div></div><div class="reference-viewport" tabindex="0" aria-label="Árvore genealógica, use as barras para mover"><div class="reference-space"><div class="reference-canvas"></div></div></div>';
  host.querySelector('.reference-toolbar').insertAdjacentHTML('afterend','<div class="reference-line-legend" aria-label="Legenda das ligações"><span><i class="line-sample parents"></i>Pais e filhos</span><span><i class="line-sample siblings"></i>Irmãos</span><span><i class="union-sample">♥</i>Casal</span><small>Tipo de vínculo. Documentos e relatos ficam nos detalhes.</small></div>');
  const viewport=host.querySelector('.reference-viewport'),space=host.querySelector('.reference-space'),canvas=host.querySelector('.reference-canvas');
  let worldWidth=1200,worldHeight=700;
  function shown(){
    const visible=new Set();
    function visit(g){if(!g||visible.has(g))return;visible.add(g);if(expanded.has(g.id))g.children.forEach(e=>visit(e.group));g.ids.filter(id=>siblingsOpen.has(id)).forEach(id=>(rel[id]?.siblings||[]).forEach(sibling=>visit(owner.get(sibling))))}
    roots.forEach(visit);
    if(focusId){const g=owner.get(focusId);visit(g);g?.parents.forEach(visit)}
    return visible;
  }
  function setZoom(value,center=true){
    const old=zoom,cx=(viewport.scrollLeft+viewport.clientWidth/2)/old,cy=(viewport.scrollTop+viewport.clientHeight/2)/old;
    zoom=Math.min(1.6,Math.max(.25,value));canvas.style.transform=`scale(${zoom})`;
    space.style.width=worldWidth*zoom+'px';space.style.height=worldHeight*zoom+'px';host.querySelector('output').textContent=Math.round(zoom*100)+'%';
    if(center){viewport.scrollLeft=cx*zoom-viewport.clientWidth/2;viewport.scrollTop=cy*zoom-viewport.clientHeight/2}
    rememberView();
  }
  function layout(visible){
    const rows=new Map();for(const g of visible){if(!rows.has(g.rank))rows.set(g.rank,[]);rows.get(g.rank).push(g)}
    const rowWidth=row=>row.reduce((n,g)=>n+g.width,0)+Math.max(0,row.length-1)*54;
    worldWidth=Math.max(1000,...[...rows.values()].map(rowWidth))+120;
    for(const row of rows.values()){let x=(worldWidth-rowWidth(row))/2;for(const g of row){g.x=x+g.width/2;x+=g.width+54}}
    // Align to the actual child, not the centre of the child's marriage.
    // Pool adjacent targets to preserve minimum spacing without pushing an entire row sideways.
    const ordered=[...rows.entries()].sort((a,b)=>a[0]-b[0]);
    for(let pass=0;pass<10;pass++){
      for(const [rank,row] of (pass%2?[...ordered].reverse():ordered)){
        const target=g=>{
          const primary=primaryParent(g);
          const points=pass%2?g.children.filter(e=>visible.has(e.group)).map(e=>personPosition(e.group,e.person)):
            (primary&&visible.has(primary)?[primary]:[]).flatMap(p=>p.children.filter(e=>e.group===g).map(e=>p.x-(personPosition(g,e.person)-g.x)));
          return points.length?points.reduce((sum,x)=>sum+x,0)/points.length:g.x;
        };
        const desired=new Map(row.map(g=>[g,target(g)]));
        if(pass%2===0){
          const families=new Map();
          for(const g of row){const parent=primaryParent(g),key=parent&&visible.has(parent)?parent:g;const block=families.get(key)||[];block.push(g);families.set(key,block)}
          const blocks=[...families].sort((a,b)=>{
            const center=([key,items])=>visible.has(key)&&!items.includes(key)?key.x:items.reduce((sum,g)=>sum+desired.get(g),0)/items.length;
            return center(a)-center(b);
          });
          row.splice(0,row.length,...blocks.flatMap(([parent,items])=>{const order=displayChildren(parent);return items.sort((a,b)=>order.findIndex(e=>e.group===a)-order.findIndex(e=>e.group===b))}));
        }
        const blocks=[];let prefix=0;
        row.forEach((g,i)=>{
          if(i)prefix+=(row[i-1].width+g.width)/2+54;
          blocks.push({items:[{g,prefix}],weight:1,sum:desired.get(g)-prefix});
          while(blocks.length>1){const a=blocks[blocks.length-2],b=blocks[blocks.length-1];if(a.sum/a.weight<=b.sum/b.weight)break;blocks.splice(-2,2,{items:[...a.items,...b.items],weight:a.weight+b.weight,sum:a.sum+b.sum})}
        });
        blocks.forEach(b=>b.items.forEach(({g,prefix})=>{g.x=b.sum/b.weight+prefix}));
      }
    }
    const min=Math.min(...[...visible].map(g=>g.x-g.width/2));if(min<40){for(const g of visible)g.x+=40-min}
    worldWidth=Math.max(worldWidth,...[...visible].map(g=>g.x+g.width/2+60));
    worldHeight=(Math.max(...rows.keys())+1)*270+90;
  }
  function personPosition(g,id){const i=g.ids.indexOf(id);return g.x-g.width/2+i*178+75}
  function portrait(g,id){
    const p=byId[id],deceased=Boolean(p.death||p.deathPending),dates=[p.birth||'',p.death?`† ${p.death}`:p.deathPending?'† data pendente':''].filter(Boolean).join(' · ');
    return `<button class="reference-person${deceased?' memorial':''}${id===focusId?' selected':''}" data-reference-person="${escape(id)}" style="left:${personPosition(g,id)-75}px;top:${g.y+40}px;--branch-color:${['#369bb8','#4977b6','#46a8a1','#8b71b2'][g.rank%4]}" aria-label="Abrir detalhes de ${escape(p.name)}">${deceased?'<span class="reference-crown" aria-hidden="true">♛</span>':''}<span class="reference-portrait" data-photo-person="${escape(id)}"><span>${escape(p.name.charAt(0))}</span></span><strong>${escape(p.name)}</strong>${dates?`<small>${escape(dates)}</small>`:''}</button>`;
  }
  function render(){
    const visible=shown();layout(visible);const strokes=[],nodes=[],routes=[],lanesByRank=new Map(),siblingRoutes=[],siblingLanes=new Map(),seenSiblings=new Set();
    // Dashed always means siblings, independently of documentary certainty.
    // Only show this extra line when the sibling control is open.
    for(const p of people){if(seenSiblings.has(p.id)||!rel[p.id]?.siblings?.length)continue;
      const family=new Set();function collect(id){if(family.has(id))return;family.add(id);seenSiblings.add(id);(rel[id]?.siblings||[]).forEach(collect)}collect(p.id);
      const ids=[...family].filter(id=>visible.has(owner.get(id)));if(ids.length<2||!ids.some(id=>siblingsOpen.has(id)))continue;
      const rank=owner.get(ids[0]).rank,xs=ids.map(id=>personPosition(owner.get(id),id));
      const route={ids,rank,xs,left:Math.min(...xs),right:Math.max(...xs)};const lanes=siblingLanes.get(rank)||[];let lane=lanes.findIndex(list=>list.every(r=>route.right+18<r.left||route.left>r.right+18));if(lane<0){lane=lanes.length;lanes.push([])}lanes[lane].push(route);route.lane=lane;siblingLanes.set(rank,lanes);siblingRoutes.push(route);
    }
    // A separate horizontal lane for every overlapping family prevents false merged lines.
    for(const g of visible){if(!expanded.has(g.id))continue;const targets=new Map();
      g.children.filter(e=>visible.has(e.group)).forEach(e=>{if(!targets.has(e.group.rank))targets.set(e.group.rank,[]);targets.get(e.group.rank).push(e)});
      for(const [rank,edges] of targets){const xs=edges.map(e=>personPosition(e.group,e.person));const routeX=rank>g.rank+1?worldWidth-24-(groups.indexOf(g)%4)*7:g.x;
        routes.push({g,rank,edges,xs,routeX,left:Math.min(routeX,...xs),right:Math.max(routeX,...xs)});
      }
    }
    routes.sort((a,b)=>a.rank-b.rank||a.left-b.left);
    for(const route of routes){const lanes=lanesByRank.get(route.rank)||[];let lane=lanes.findIndex(ranges=>ranges.every(r=>route.right+18<r.left||route.left>r.right+18));if(lane<0){lane=lanes.length;lanes.push([])}lanes[lane].push(route);route.lane=lane;lanesByRank.set(route.rank,lanes)}
    const rowY=new Map([[0,0]]),lastRank=Math.max(...[...visible].map(g=>g.rank));
    for(let rank=1;rank<=lastRank;rank++)rowY.set(rank,rowY.get(rank-1)+280+(siblingLanes.get(rank-1)?.length||0)*12+Math.max(1,lanesByRank.get(rank)?.length||0)*12);
    for(const g of visible)g.y=rowY.get(g.rank);
    worldHeight=rowY.get(lastRank)+290;
    for(const g of visible){
      g.ids.forEach(id=>nodes.push(portrait(g,id)));
      const y=g.y+82,toggleY=g.ids.length>1?y+18:g.y+198;
      if(g.ids.length>1){const left=personPosition(g,g.ids[0])+42,right=personPosition(g,g.ids[g.ids.length-1])-42;strokes.push(`<path d="M${left} ${y}H${right}"/>`);nodes.push(`<span class="reference-union" style="left:${g.x-12}px;top:${y-12}px" aria-label="Casal">♥</span>`)}
      if(g.children.length){const count=new Set(g.children.map(e=>e.person)).size;nodes.push(`<button class="reference-toggle" data-reference-toggle="${escape(g.id)}" style="left:${g.x-15}px;top:${toggleY}px" aria-expanded="${expanded.has(g.id)}" aria-label="${expanded.has(g.id)?'Fechar':'Abrir'} filhos de ${escape(g.ids.map(id=>byId[id].name).join(' e '))}" title="${expanded.has(g.id)?'Fechar':'Abrir'} ${count} filhos">${expanded.has(g.id)?'−':'+'}</button>`)}
      for(const id of g.ids){if(!rel[id]?.siblings?.length)continue;const top=g.y+(g.ids.length===1&&g.children.length?232:202);nodes.push(`<button class="reference-siblings" data-reference-siblings="${escape(id)}" style="left:${personPosition(g,id)-75}px;top:${top}px;width:150px" aria-expanded="${siblingsOpen.has(id)}" aria-label="${siblingsOpen.has(id)?'Fechar':'Abrir'} irmãos de ${escape(byId[id].name)}">${siblingsOpen.has(id)?'−':'+'} Irmãos</button>`)}
    }
    for(const route of siblingRoutes){const bus=rowY.get(route.rank)+262+route.lane*12,d=`M${route.left} ${bus}H${route.right}`+route.ids.map(id=>{const g=owner.get(id),start=g.ids.length===1&&g.children.length?254:224;return `M${personPosition(g,id)} ${rowY.get(route.rank)+start}V${bus}`}).join('');strokes.push(`<g class="reference-sibling-link" data-sibling-people="${escape(route.ids.join(' '))}"><title>Ligação entre irmãos</title><path class="connection-clearance" d="${d}"/><path class="sibling-report" d="${d}"/></g>`);nodes.push(`<span class="reference-sibling-caption" style="left:${(route.left+route.right)/2-28}px;top:${bus-7}px">irmãos</span>`)}
    for(const route of routes){const {g,rank,edges,xs,routeX}=route,endY=rowY.get(rank)+26,bus=endY-22-route.lane*12;
      const outY=g.ids.length>1?g.y+130:g.y+(g.siblings.length?250:228),departureY=g.y+274;
      const stem=routeX===g.x?`M${g.x} ${outY}V${bus}`:`M${g.x} ${outY}V${departureY}H${routeX}V${bus}`;
      const d=stem+`M${route.left} ${bus}H${route.right}`+xs.map(x=>`M${x} ${bus}V${endY}`).join('');
      strokes.push(`<g class="reference-descent" data-parent-family="${escape(g.id)}" data-children="${escape(edges.map(e=>e.person).join(' '))}"><path class="connection-clearance" d="${d}"/><path d="${d}"/></g>`);
    }
    canvas.style.width=worldWidth+'px';canvas.style.height=worldHeight+'px';
    canvas.innerHTML=`<svg class="reference-lines" width="${worldWidth}" height="${worldHeight}" aria-hidden="true">${strokes.join('')}</svg>${nodes.join('')}`;
    canvas.querySelectorAll('[data-reference-toggle]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.referenceToggle,g=groups.find(g=>g.id===id);if(expanded.has(id))closeBranch(g);else{expanded.add(id);g.children.forEach(e=>revealParents(e.group))}render()}));
    canvas.querySelectorAll('[data-reference-siblings]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.referenceSiblings;siblingsOpen.has(id)?siblingsOpen.delete(id):siblingsOpen.add(id);render()}));
    canvas.querySelectorAll('[data-reference-person]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.referencePerson;renderDetail();window.openFamilyProfile?.()}));
    window.refreshGenealogyPhotos?.();setZoom(zoom,false);
  }
  host.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{
    const action=b.dataset.view;
    if(action==='in')setZoom(zoom+.15);if(action==='out')setZoom(zoom-.15);
    if(action==='fit'){setZoom((viewport.clientWidth-24)/worldWidth,false);viewport.scrollLeft=0;viewport.scrollTop=0}
    if(action==='all'){groups.forEach(g=>{expanded.add(g.id);g.ids.forEach(id=>siblingsOpen.add(id))});render()}
    if(action==='reset'){expanded.clear();siblingsOpen.clear();focusId=null;search.value='';back.hidden=true;render();viewport.scrollTop=0}
  }));
  let drag=null;
  viewport.addEventListener('pointerdown',e=>{if(e.target.closest('button')||e.button!==0)return;drag={x:e.clientX,y:e.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging')});
  viewport.addEventListener('pointermove',e=>{if(drag){viewport.scrollLeft=drag.left-(e.clientX-drag.x);viewport.scrollTop=drag.top-(e.clientY-drag.y)}});
  const endDrag=()=>{drag=null;viewport.classList.remove('dragging')};viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',endDrag);
  viewport.addEventListener('scroll',rememberView);
  function focus(id){focusId=id;const seen=new Set();function reveal(g){if(!g||seen.has(g))return;seen.add(g);g.parents.forEach(p=>{expanded.add(p.id);reveal(p)})}reveal(owner.get(id));render();const g=owner.get(id);if(g){viewport.scrollLeft=g.x*zoom-viewport.clientWidth/2;viewport.scrollTop=Math.max(0,g.y*zoom-80)}document.querySelector('#show-full-tree').hidden=false}
  window.renderFamilyBranch=render;window.focusFamilyBranch=focus;
  const oldSearch=document.querySelector('#search'),search=oldSearch.cloneNode(true);oldSearch.replaceWith(search);
  function lookup(){const term=search.value.trim().toLocaleLowerCase();const p=people.find(p=>p.name.toLocaleLowerCase()===term)||people.find(p=>term&&p.name.toLocaleLowerCase().includes(term));if(p)focus(p.id)}
  search.addEventListener('change',lookup);search.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();lookup()}});
  const oldEnter=document.querySelector('#enter-family'),enter=oldEnter.cloneNode(true);oldEnter.replaceWith(enter);enter.addEventListener('click',lookup);
  const oldBack=document.querySelector('#show-full-tree'),back=oldBack.cloneNode(true);oldBack.replaceWith(back);back.addEventListener('click',()=>{focusId=null;search.value='';render();back.hidden=true});
  document.querySelector('.hero').classList.add('reference-intro');
  render();
  if(restoredView){setZoom(zoom,false);viewport.scrollLeft=restoredView.scrollLeft||0;viewport.scrollTop=restoredView.scrollTop||0}else setZoom(Math.min(1,(viewport.clientWidth-24)/worldWidth),false);
})();
