/* Navegação de parentesco — usa somente fatos já documentados no acervo. */
(function () {
  const extraPeople = [
    ['helena-irma-iraci','Helena','Irmã informada de Iraci','sobrenome e datas pendentes','report'],
    ['ze-carlos-helena','Zé Carlos','Cônjuge informado de Helena','nome civil completo e datas pendentes','report'],
    ['nana-irma-iraci','Nana','Irmã informada de Iraci','nome civil completo e datas pendentes','report'],
    ['everaldo','Everaldo Batista da Silva','Filho documentado; mais velho por relato','falecido em 2017; nascimento pendente'],
    ['ivan','Ivan Batista da Silva','Filho documentado','dados de nascimento pendentes'],
    ['ivaneth','Ivaneth Batista da Silva','Filha documentada','dados de nascimento pendentes'],
    ['ivanize','Ivanize Batista da Silva','Filha documentada','dados de nascimento pendentes'],
    ['edson','Edson Batista da Silva','Filho documentado','dados de nascimento pendentes'],
    ['joao-vitorino','João Vitorino / Victorino Pires','Relato familiar em validação','datas e grafia pendentes','report'],
    ['maria-bendita','Maria Bendita / Benedita de Jesus','Relato familiar em validação','relação exata pendente','report'],
    ['antonio-vitorino','Antônio Vitorino Pires','Irmão informado de Maria do Carmo','datas pendentes','report'],
    ['simone-filha-antonio','Simone','Possível filha de Antônio Vitorino Pires','sobrenome e datas pendentes','report'],
    ['abadia-vitorino','Abadia Auxiliadora Vitorino','Irmã informada de Maria do Carmo','datas pendentes','report'],
    ['aparecida-max','Aparecida Max','Irmã informada de Maria do Carmo','Max é sobrenome de casamento; demais dados pendentes','report'],
    ['cleusa-porcina','Cleusa Porcina','Irmã informada de Maria do Carmo','Porcina é sobrenome de casamento; datas pendentes','report'],
    ['jesse-porcina','Jessé Porcina','Cônjuge informado de Cleusa','datas pendentes','report']
    ,['gleiton-porcina','Gleiton Porcina','Filho informado de Cleusa e Jessé','dentista; vive em São Paulo por relato','report']
    ,['patricia-porcina','Patrícia','Filha informada de Cleusa e Jessé','sobrenome e datas pendentes','report']
    ,['beatriz-porcina','Beatriz','Filha informada de Cleusa e Jessé','sobrenome e datas pendentes','report']
    ,['taina-batista','Tainã Batista da Silva','Irmã informada de Tiago','n. 04/10/1984 • gêmea de Diego','report']
    ,['diego-batista','Diego Batista da Silva','Irmão informado de Tiago','n. 04/10/1984 • gêmeo de Tainã','report']
    ,['tatiana-batista','Tatiana Batista da Silva','Irmã informada de Tiago','n. 12/12/1980 • primogênita','report']
  ];
  extraPeople.forEach(([id,name,status,years,tone]) => {
    if (!byId[id]) { const maternal=id==='joao-vitorino'||id==='maria-bendita'; const p={id,name,status,years,tone:tone||'verified',deathPending:maternal,facts:[[maternal?'Vínculo familiar informado':'Vínculo documentado',maternal?'Indicado pela família como pai/mãe de Maria do Carmo; precisa de documento primário.':'Mencionado como filho de José e Iraci nas declarações funerárias dos pais']],links:maternal?['maria-carmo']:['jose','iraci'],note:maternal?'Nome e grafia ainda precisam de nascimento, casamento ou óbito para validação.':'Ainda faltam certidões próprias de nascimento, casamento ou óbito.'}; byId[id]=p; people.push(p); }
  });
  if(byId.ivanize){byId.ivanize.deathPending=true;byId.ivanize.years='falecida; datas pendentes';byId.ivanize.status='Filha documentada; falecimento informado';}
  const maternalReports={
    'helena-irma-iraci':['Tiago informou Helena como irmã de Iraci e casada com Zé Carlos.','Filiação completa, sobrenome, datas e documentos pendentes. Não confundir com Helena, esposa de Ivan.'],
    'ze-carlos-helena':['Informado por Tiago como marido de Helena, irmã de Iraci.','Nome civil completo e documentos pendentes. Não confundir com José Carlos, esposo de Ivaneth.'],
    'nana-irma-iraci':['Tiago informou tia Nana como irmã de Iraci.','Nana é a forma lembrada pela família; nome civil, filiação completa e datas pendentes.'],
    'antonio-vitorino':['Irmão de Maria do Carmo informado diretamente por ela. O sobrenome Vitorino Pires coincide com o nome familiar de João Vitorino Pires. Uma ocorrência pública homônima em Uberaba/MG, associada a Cristina Maria de Souza, permanece somente como pista externa e não comprova identidade, casamento ou descendência.','Certidões de nascimento, casamento ou óbito ainda pendentes; cônjuge e filhos não confirmados.'],
    'simone-filha-antonio':['Possível filha de Antônio Vitorino Pires, lembrança familiar transmitida por Tiago com incerteza.','Sobrenome, mãe, datas, local e documentos ainda pendentes.'],
    'abadia-vitorino':['Irmã de Maria do Carmo informada diretamente por ela.','Nome civil completo, datas e certidões ainda pendentes.'],
    'aparecida-max':['Irmã de Maria do Carmo; Max foi informado como sobrenome adquirido no casamento.','Faltam nome de nascimento, nome do cônjuge, datas e certidões.'],
    'cleusa-porcina':['Irmã de Maria do Carmo; Porcina foi informado como sobrenome adquirido no casamento com Jessé Porcina. Filhos informados: Gleiton, Patrícia e Beatriz.','Faltam nome de nascimento, datas e certidões.'],
    'jesse-porcina':['Cônjuge informado de Cleusa Porcina; pai informado de Gleiton, Patrícia e Beatriz.','Faltam nome civil completo, datas e certidões.'],
    'gleiton-porcina':['Filho informado de Cleusa e Jessé Porcina; dentista e residente em São Paulo segundo relato familiar.','Registro profissional, nome civil completo, datas e certidões ainda pendentes.'],
    'patricia-porcina':['Filha informada de Cleusa e Jessé Porcina.','Sobrenome, datas, local e certidões ainda pendentes.'],
    'beatriz-porcina':['Filha informada de Cleusa e Jessé Porcina.','Sobrenome, datas, local e certidões ainda pendentes.']
  };
  Object.entries(maternalReports).forEach(([id,[fact,note]])=>{byId[id].facts=[['Relato familiar',fact]];byId[id].links=id==='jesse-porcina'?['cleusa-porcina']:id==='simone-filha-antonio'?['antonio-vitorino']:['gleiton-porcina','patricia-porcina','beatriz-porcina'].includes(id)?['cleusa-porcina','jesse-porcina']:['maria-carmo'];byId[id].note=note});
  byId['helena-irma-iraci'].links=['iraci','ze-carlos-helena'];
  byId['nana-irma-iraci'].links=['iraci'];
  byId['ze-carlos-helena'].links=['helena-irma-iraci'];
  byId.everaldo.facts=[['Vínculo documentado','Filho mencionado de José Pereira da Silva e Iraci Pereira da Silva.'],['Relato familiar','Filho mais velho do casal; falecido em 2017.']];
  byId.everaldo.death='2017';
  byId.everaldo.note='O ano de falecimento e a ordem de nascimento ainda precisam de certidão própria.';
  byId['jorge-everaldo'].facts=[['Pais','Everaldo Batista da Silva e Mikita'],['Filhos','Não teve filhos, segundo relato familiar']];
  byId['kleber-everaldo'].facts=[['Pais','Everaldo Batista da Silva e Mikita'],['Filho informado','Pedro']];
  byId['leila-everaldo'].facts=[['Pais','Everaldo Batista da Silva e Mikita'],['Cônjuge','Gustavo'],['Filho informado','Um filho; nome ainda pendente']];
  byId['kelly-everaldo'].facts=[['Pais','Everaldo Batista da Silva e Mikita'],['Filho informado','Um filho; nome ainda pendente']];
  const tiagoSiblings={
    'taina-batista':'Irmã informada de Tiago; nasceu em 04/10/1984 e é gêmea de Diego.',
    'diego-batista':'Irmão informado de Tiago; nasceu em 04/10/1984 e é gêmeo de Tainã.',
    'tatiana-batista':'Irmã informada de Tiago; nasceu em 12/12/1980 e é a filha primogênita. O dia e o mês coincidem com o aniversário de José Pereira da Silva.'
  };
  Object.entries(tiagoSiblings).forEach(([id,fact])=>{byId[id].facts=[['Relato familiar',fact],['Pais informados','Ivanildo Batista da Silva e Maria do Carmo Lemos da Silva']];byId[id].links=['ivanildo','maria-carmo','tiago'];byId[id].note='Nascimento, demais dados civis e certidões ainda pendentes.'});
  byId['taina-batista'].name='Tainã Batista Cremon da Silva';
  byId['taina-batista'].facts=[['Nome de nascimento','Tainã Batista da Silva'],['Nome após o casamento','Tainã Batista Cremon da Silva'],['Cônjuge','Alessandro Cremon'],['Filhos informados','João e Alice'],['Nascimento','04/10/1984; gêmea de Diego']];
  byId['taina-batista'].note='Casamento, nomes completos dos filhos e certidões ainda pendentes.';
  document.querySelector('#statPeople').textContent=people.length;
  const relations = {
    tiago:{parents:['ivanildo','maria-carmo'],children:['marina'],siblings:['taina-batista','diego-batista','tatiana-batista'],spouse:['thais']},
    thais:{parents:['dirceu-vale','jandira-bispo'],children:['marina'],siblings:[],spouse:['tiago']},
    marina:{parents:['tiago','thais'],children:[],siblings:[],spouse:[]},
    'dirceu-vale':{parents:[],children:['thais'],siblings:[],spouse:['jandira-bispo']},
    'jandira-bispo':{parents:[],children:['thais'],siblings:[],spouse:['dirceu-vale']},
    ivanildo:{parents:['jose','iraci'],children:['tiago','taina-batista','diego-batista','tatiana-batista'],siblings:['everaldo','ivan','ivaneth','ivanize','edson'],spouse:['maria-carmo']},
    'maria-carmo':{parents:['joao-vitorino','maria-bendita'],children:['tiago','taina-batista','diego-batista','tatiana-batista'],siblings:['antonio-vitorino','abadia-vitorino','aparecida-max','cleusa-porcina'],spouse:['ivanildo']},
    jose:{parents:['joventino','maria-joaquina'],children:['everaldo','ivan','ivanildo','ivaneth','ivanize','edson'],siblings:['donzilia','romeu-pereira','elisa-pereira'],spouse:['iraci']},
    iraci:{parents:['antonio','maria-joana'],children:['everaldo','ivan','ivanildo','ivaneth','ivanize','edson'],siblings:['helena-irma-iraci','nana-irma-iraci'],spouse:['jose']},
    'helena-irma-iraci':{parents:[],children:[],siblings:['iraci','nana-irma-iraci'],spouse:['ze-carlos-helena']},
    'ze-carlos-helena':{parents:[],children:[],siblings:[],spouse:['helena-irma-iraci']},
    'nana-irma-iraci':{parents:[],children:[],siblings:['iraci','helena-irma-iraci'],spouse:[]},
    everaldo:{parents:['jose','iraci'],children:['jorge-everaldo','kleber-everaldo','leila-everaldo','kelly-everaldo'],siblings:['ivan','ivanildo','ivaneth','ivanize','edson'],spouse:['mikita-everaldo']},
    ivan:{parents:['jose','iraci'],children:['fernando-angelo'],siblings:['everaldo','ivanildo','ivaneth','ivanize','edson'],spouse:['helena-ivan']},
    ivaneth:{parents:['jose','iraci'],children:['robson-ivaneth','jefferson-ivaneth','everton-ivaneth','clayton-ivaneth'],siblings:['everaldo','ivan','ivanildo','ivanize','edson'],spouse:['jose-carlos-ivaneth']},
    'jose-carlos-ivaneth':{parents:[],children:['robson-ivaneth','jefferson-ivaneth','everton-ivaneth','clayton-ivaneth'],siblings:[],spouse:['ivaneth']},
    'robson-ivaneth':{parents:['ivaneth','jose-carlos-ivaneth'],children:[],siblings:['clayton-ivaneth','everton-ivaneth','jefferson-ivaneth'],spouse:[]},
    'clayton-ivaneth':{parents:['ivaneth','jose-carlos-ivaneth'],children:[],siblings:['robson-ivaneth','everton-ivaneth','jefferson-ivaneth'],spouse:[]},
    'everton-ivaneth':{parents:['ivaneth','jose-carlos-ivaneth'],children:[],siblings:['robson-ivaneth','clayton-ivaneth','jefferson-ivaneth'],spouse:[]},
    'jefferson-ivaneth':{parents:['ivaneth','jose-carlos-ivaneth'],children:[],siblings:['robson-ivaneth','clayton-ivaneth','everton-ivaneth'],spouse:[]},
    ivanize:{parents:['jose','iraci'],children:['fabiana-ivanize','luciana-ivanize','anderson-ivanize','dayana-ivanize'],siblings:['everaldo','ivan','ivanildo','ivaneth','edson'],spouse:['severino-ivanize']},
    'severino-ivanize':{parents:[],children:['fabiana-ivanize','luciana-ivanize','anderson-ivanize','dayana-ivanize'],siblings:[],spouse:['ivanize']},
    'fabiana-ivanize':{parents:['ivanize','severino-ivanize'],children:[],siblings:['luciana-ivanize','anderson-ivanize','dayana-ivanize'],spouse:[]},
    'luciana-ivanize':{parents:['ivanize','severino-ivanize'],children:[],siblings:['fabiana-ivanize','anderson-ivanize','dayana-ivanize'],spouse:[]},
    'anderson-ivanize':{parents:['ivanize','severino-ivanize'],children:[],siblings:['fabiana-ivanize','luciana-ivanize','dayana-ivanize'],spouse:[]},
    'dayana-ivanize':{parents:['ivanize','severino-ivanize'],children:[],siblings:['fabiana-ivanize','luciana-ivanize','anderson-ivanize'],spouse:[]},
    edson:{parents:['jose','iraci'],children:['sara-paiva'],siblings:['everaldo','ivan','ivanildo','ivaneth','ivanize'],spouse:['rosana-paiva']},
    'rosana-paiva':{parents:[],children:['sara-paiva'],siblings:[],spouse:['edson']},
    'sara-paiva':{parents:['edson','rosana-paiva'],children:[],siblings:[],spouse:[]},
    'helena-ivan':{parents:[],children:['fernando-angelo'],siblings:[],spouse:['ivan']},
    'fernando-angelo':{parents:['ivan','helena-ivan'],children:[],siblings:[],spouse:[]},
    'mikita-everaldo':{parents:[],children:['jorge-everaldo','kleber-everaldo','leila-everaldo','kelly-everaldo'],siblings:[],spouse:['everaldo']},
    'jorge-everaldo':{parents:['everaldo','mikita-everaldo'],children:[],siblings:['kleber-everaldo','leila-everaldo','kelly-everaldo'],spouse:[]},
    'kleber-everaldo':{parents:['everaldo','mikita-everaldo'],children:['pedro-kleber'],siblings:['jorge-everaldo','leila-everaldo','kelly-everaldo'],spouse:[]},
    'pedro-kleber':{parents:['kleber-everaldo'],children:[],siblings:[],spouse:[]},
    'leila-everaldo':{parents:['everaldo','mikita-everaldo'],children:[],siblings:['jorge-everaldo','kleber-everaldo','kelly-everaldo'],spouse:['gustavo-leila']},
    'gustavo-leila':{parents:[],children:[],siblings:[],spouse:['leila-everaldo']},
    'kelly-everaldo':{parents:['everaldo','mikita-everaldo'],children:[],siblings:['jorge-everaldo','kleber-everaldo','leila-everaldo'],spouse:[]},
    donzilia:{parents:['joventino','maria-joaquina'],children:[],siblings:['jose','romeu-pereira','elisa-pereira'],spouse:[]},
    'romeu-pereira':{parents:['joventino','maria-joaquina'],children:[],siblings:['jose','donzilia','elisa-pereira'],spouse:[]},
    'elisa-pereira':{parents:['joventino','maria-joaquina'],children:[],siblings:['jose','donzilia','romeu-pereira'],spouse:[]},
    joventino:{parents:[],children:['jose','donzilia','romeu-pereira','elisa-pereira'],siblings:[],spouse:['maria-joaquina']},
    'maria-joaquina':{parents:[],children:['jose','donzilia','romeu-pereira','elisa-pereira'],siblings:[],spouse:['joventino']},
    antonio:{parents:['eleuterio-batista','vicentina-maria'],children:['iraci'],siblings:[],spouse:['maria-joana']},
    'maria-joana':{parents:['joana-maria-lima'],children:['iraci'],siblings:[],spouse:['antonio']},
    'eleuterio-batista':{parents:[],children:['antonio'],siblings:[],spouse:['vicentina-maria']},
    'vicentina-maria':{parents:[],children:['antonio'],siblings:[],spouse:['eleuterio-batista']},
    'joana-maria-lima':{parents:[],children:['maria-joana'],siblings:[],spouse:[]},
    'joao-vitorino':{parents:[],children:['maria-carmo'],siblings:[],spouse:['maria-bendita']},
    'maria-bendita':{parents:[],children:['maria-carmo'],siblings:[],spouse:['joao-vitorino']},
    'antonio-vitorino':{parents:[],children:['simone-filha-antonio'],siblings:['maria-carmo','abadia-vitorino','aparecida-max','cleusa-porcina'],spouse:[]},
    'simone-filha-antonio':{parents:['antonio-vitorino'],children:[],siblings:[],spouse:[]},
    'abadia-vitorino':{parents:[],children:[],siblings:['maria-carmo','antonio-vitorino','aparecida-max','cleusa-porcina'],spouse:[]},
    'aparecida-max':{parents:[],children:[],siblings:['maria-carmo','antonio-vitorino','abadia-vitorino','cleusa-porcina'],spouse:[]},
    'cleusa-porcina':{parents:[],children:['gleiton-porcina','patricia-porcina','beatriz-porcina'],siblings:['maria-carmo','antonio-vitorino','abadia-vitorino','aparecida-max'],spouse:['jesse-porcina']},
    'jesse-porcina':{parents:[],children:['gleiton-porcina','patricia-porcina','beatriz-porcina'],siblings:[],spouse:['cleusa-porcina']},
    'gleiton-porcina':{parents:['cleusa-porcina','jesse-porcina'],children:[],siblings:['patricia-porcina','beatriz-porcina'],spouse:[]},
    'patricia-porcina':{parents:['cleusa-porcina','jesse-porcina'],children:[],siblings:['gleiton-porcina','beatriz-porcina'],spouse:[]},
    'beatriz-porcina':{parents:['cleusa-porcina','jesse-porcina'],children:[],siblings:['gleiton-porcina','patricia-porcina'],spouse:[]},
    'taina-batista':{parents:['ivanildo','maria-carmo'],children:['joao-cremon','alice-cremon'],siblings:['tiago','diego-batista','tatiana-batista'],spouse:['alessandro-cremon']},
    'alessandro-cremon':{parents:[],children:['joao-cremon','alice-cremon'],siblings:[],spouse:['taina-batista']},
    'joao-cremon':{parents:['taina-batista','alessandro-cremon'],children:[],siblings:['alice-cremon'],spouse:[]},
    'alice-cremon':{parents:['taina-batista','alessandro-cremon'],children:[],siblings:['joao-cremon'],spouse:[]},
    'diego-batista':{parents:['ivanildo','maria-carmo'],children:['davi-rodrigues','maria-luiza-rodrigues'],siblings:['tiago','taina-batista','tatiana-batista'],spouse:['priscila-maciel']},
    'priscila-maciel':{parents:[],children:['davi-rodrigues','maria-luiza-rodrigues'],siblings:[],spouse:['diego-batista']},
    'davi-rodrigues':{parents:['diego-batista','priscila-maciel'],children:[],siblings:['maria-luiza-rodrigues'],spouse:[]},
    'maria-luiza-rodrigues':{parents:['diego-batista','priscila-maciel'],children:[],siblings:['davi-rodrigues'],spouse:[]},
    'tatiana-batista':{parents:['ivanildo','maria-carmo'],children:['gabriel-santana','eduardo-filho','maria-clara'],siblings:['tiago','taina-batista','diego-batista'],spouse:['eduardo-santana']},
    'eduardo-santana':{parents:[],children:['gabriel-santana','eduardo-filho','maria-clara'],siblings:[],spouse:['tatiana-batista']},
    'eduardo-filho':{parents:['tatiana-batista','eduardo-santana'],children:[],siblings:['maria-clara','gabriel-santana'],spouse:[]},
    'maria-clara':{parents:['tatiana-batista','eduardo-santana'],children:[],siblings:['eduardo-filho','gabriel-santana'],spouse:[]},
    'gabriel-santana':{parents:['tatiana-batista','eduardo-santana'],children:[],siblings:['eduardo-filho','maria-clara'],spouse:['gabriela-companheira']},
    'gabriela-companheira':{parents:[],children:[],siblings:[],spouse:['gabriel-santana']}
  };
  window.familyRelations=relations;
  function relationBlock(label, ids) {
    if (!ids || !ids.length) return '';
    return `<section class="relation-block"><h3>${label}</h3><div>${ids.map(id => `<button class="relative" data-relative="${id}"><b>${byId[id].name}</b><small>${byId[id].years}</small></button>`).join('')}</div></section>`;
  }
  renderDetail = function () {
    const p = byId[selected], rel = relations[selected] || {parents:[],children:[],siblings:[],spouse:[]};
    document.querySelector('#detail-name').textContent=p.name;
    document.querySelector('#detail-subtitle').textContent=`${p.status} • ${p.years}`;
    document.querySelector('#detail-content').innerHTML=`<div class="fact-list">${p.facts.map(([k,v])=>`<div class="fact"><span>${k}</span><b>${v}</b></div>`).join('')}</div><div class="family-map"><h3>Família próxima</h3>${relationBlock('Pais',rel.parents)}${relationBlock('Cônjuge',rel.spouse)}${relationBlock('Filhos',rel.children)}${relationBlock('Irmãos',rel.siblings)}</div><p class="notice">${p.note}</p>`;
    document.querySelectorAll('[data-relative]').forEach(el => el.addEventListener('click', () => { document.querySelector('#search').value=''; if(window.focusFamilyBranch){window.focusFamilyBranch(el.dataset.relative)}else{selected=el.dataset.relative;drawPremiumTree();renderDetail()} }));
  };
  renderDetail();
})();
