const timelineEvents = [
  {year:'1877', kind:'Pista familiar', title:'Nascimento informado de Joventino/Jovintino', text:'Ano associado a Joventino/Jovintino Pereira da Silva. Ainda precisa de certidão ou outra fonte primária.'},
  {year:'1889', kind:'Pista familiar', title:'Nascimento informado de Maria Joaquina', text:'Ano associado a Maria Joaquina da Conceição. Ainda precisa de certidão ou outra fonte primária.'},
  {year:'1920', kind:'Documento', title:'Nascimento de José Pereira da Silva', text:'12 de dezembro, em Palmares/PE — registrado na declaração funerária de José.'},
  {year:'1928', kind:'Documento', title:'Nascimento de Iraci Pereira da Silva', text:'12 de agosto, em São José da Laje/AL — registrado na declaração funerária de Iraci.'},
  {year:'1928', kind:'Documento', title:'Nascimento de Donzilia Pereira Mendes', text:'20 de junho, em Palmares/PE — confirmado no termo civil de óbito.'},
  {year:'1950', kind:'Documento', title:'Casamento de Donzilia e Eloi', text:'30 de outubro, em São José da Laje/AL. Essa referência documentada ajuda a mapear o contexto familiar.'},
  {year:'1980', kind:'Relato familiar', title:'Nascimento de Tatiana Batista da Silva', text:'12 de dezembro. Informada como filha primogênita de Ivanildo e Maria do Carmo; o dia e o mês coincidem com o nascimento de José Pereira da Silva.'},
  {year:'1982', kind:'Documento', title:'Nascimento de Tiago Batista da Silva', text:'22 de julho, em São Paulo/SP.'},
  {year:'1984', kind:'Relato familiar', title:'Nascimento dos gêmeos Tainã e Diego', text:'4 de outubro. Tainã Batista da Silva e Diego Batista da Silva são irmãos gêmeos.'},
  {year:'2009', kind:'Documento', title:'Falecimento de Iraci', text:'5 de junho. A declaração funerária também registra seus pais, cônjuge e filhos mencionados.'},
  {year:'2010', kind:'Documento', title:'Falecimento de José', text:'15 de junho. A declaração funerária e o registro de cemitério confirmam sua filiação e os filhos mencionados.'},
  {year:'2013', kind:'Documento', title:'Falecimento de Donzilia', text:'2 de abril, em Caruaru/PE. O termo civil reforça a ligação documental com José pelos mesmos pais.'},
  {year:'2018', kind:'Documento', title:'Casamento de Tiago e Thais', text:'15 de dezembro, em Carapicuíba/SP. A certidão confirma o casamento, o nascimento e a filiação dos dois cônjuges.'},
  {year:'2021', kind:'Relato familiar', title:'Nascimento de Marina Vale Silva', text:'6 de dezembro, em São Paulo/SP. Filha informada de Tiago e Thais.'}
];
document.querySelector('#timeline').innerHTML = timelineEvents.map(e => `<article class="time-event ${e.kind === 'Documento' ? 'documented' : 'reported'}"><div class="time-year">${e.year}</div><div class="time-copy"><span>${e.kind}</span><h3>${e.title}</h3><p>${e.text}</p></div></article>`).join('');
