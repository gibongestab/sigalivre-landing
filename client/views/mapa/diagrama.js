GHOST_CHAR = '#';

mapaAreas = [];
mapaCargos = [];
mapaCoordenadores = [];
let matrizAreas = new ReactiveVar();
let matrizCargos = new ReactiveVar();
let matrizCoordenadores = new ReactiveVar();

let coordCarreira;
let coordSenioridadeId;
let coordSenioridade;

_.extend(Array.prototype, {
  clean(deleteValue) {
    for (let i = 0; i < this.length; i++) {
      if (this[i] === deleteValue) {
        this.splice(i, 1);
        i--;
      }
    }
    return this;
  }
});

Template.registerHelper('$concat', function(a = '', b = '') {
  return a + b;
});

tipoToImg = function(tipo) {
  if (!tipo) return 'aes.ico';
  switch (tipo) {
  case 1:
    return 'vp.png';
  case 2:
    return 'dir.png';
  case 3:
    return 'ger.png';
  case 4:
    return 'coord.png';
  default:
    return 'vp.png';
  }
};

constroiHierarquia = function(raiz) {
  //
  // if raiz === null, estou vendo todas as VP's
  //
  let area = Areas.findOne({
    _id: raiz
  }) || {
    nome: 'AES Brasil',
    tipo: 0,
    _id: GHOST_CHAR
  };
  if (area._id === GHOST_CHAR) raiz = null;

  //
  //  Encontrar áreas fihlas
  //
  let filhos = Areas.find({
    paiId: raiz
  }, {
    sort: {
      nome: 1
    }
  }).fetch();

  //
  // Encontra cargos que não coordenador
  //
  let cargos = Cargos.find({
    areaId: raiz,
    coordenador: {
      $ne: true
    }
  }).fetch();

  //
  //  Ordenar pela grade horizontal da carreira
  //
  if (cargos) {
    cargos = _.sortBy(cargos, function(cargo) {
      let carreira = cargo.carreira();
      return carreira && carreira.gradeHorizontal || 0;
    });
  }

  let csCargos = cargos.length;
  let csFilhos = 0;

  //
  //  Recursividade...
  //
  _.each(filhos, function(filho) {
    csFilhos = csFilhos + constroiHierarquia(filho._id);
  });

  //
  //  O colspan eh a somatória dos cargos dessa área + o colspan que os filhos devem ter
  //  deve ser no mínimo 1
  let cs = csCargos + csFilhos || 1;
  //
  //  Colocar uma área imaginária na matriz
  //
  pushNull = function(nivel, colspan, por) {
    if (!mapaAreas[nivel]) mapaAreas[nivel] = [];
    mapaAreas[nivel].push({
      areaId: null,
      colspan: colspan,
      por: por
    });
  };

  let tipoToNome = ['aes', 'vp', 'dir', 'ger', 'coord'];

  //  cargos da área
  _.each(cargos, function(cargo) {
    let carreira = cargo.carreira();
    let arrayVazio = [];
    //
    //  Preencher espaços na matriz de cargos até chegar na grade
    //
    for (let i = 0; i < carreira.grade; i++) {
      arrayVazio.push({
        cargoId: false,
        motivo: 'grade'
      });
    }
    //
    //  Construir array final, com o array vazio + array com uma bolinha para cada senioridade da estrutura
    //  da carreira, Pintar os que encontrar classificação correspondente
    let arrayCargos = _.union(arrayVazio, _.map(carreira.estrutura, function(senioridadeId, j) {
      let senioridade = Senioridades.findOne({
        _id: senioridadeId
      });
      let classificacao = Classificacoes.findOne({
        cargoId: cargo._id,
        senioridadeId: senioridadeId
      });
      return {
        cargoId: cargo._id,
        senioridadeId: senioridadeId,
        label: senioridade.abreviacao,
        texto: j === 0 ? carreira.nome : '',
        cor: carreira.cor,
        temPai: j > 0 ? true : false,
        classificacao: classificacao
      };
    }));

    mapaCargos.push(arrayCargos);
  });

  //
  //  Esta área é a ultima da coluna dela?
  //  Se existe não existe nenhum filho e não estou falando da área raiz imaginária, ela é a última
  let ultimoNaColuna = !Areas.findOne({
    caminho: area._id,
    tipo: {
      $gt: area.tipo
    }
  }) && area._id !== GHOST_CHAR;

  //
  //  Coordenadores
  //
  let cargosCoord = [];
  //
  //  Encontrar todos os coordenadores da área
  //
  let coordenadores = Cargos.find({
    areaId: area._id,
    coordenador: true
  }).fetch();
  //
  //  Preencher vetor de cargos, pintar os que tem classificação
  //
  cargosCoord = _.map(coordenadores, function(coordenador) {
    let classificacao = Classificacoes.findOne({
      cargoId: coordenador._id,
      senioridadeId: coordSenioridadeId
    });
    return {
      cargoId: coordenador._id,
      // senioridadeId: coordSenioridadeId,
      label: '',
      texto: 'Coordenador',
      temPai: false,
      classificacao: classificacao
    };
  });


  if (ultimoNaColuna) {
    mapaCoordenadores.push({
      colspan: cs,
      cargos: cargosCoord,
    });
  } else {
    if (cargos.length) {
      mapaCoordenadores.push({
        colspan: cargos.length,
        cargos: cargosCoord,
      });
    }
  }

  //
  //  Areas sem cargos
  //  coloca um cargo imaginário
  if (!cargos.length && ultimoNaColuna) {
    mapaCargos.push([{
      cargoId: null,
      colocadoPor: area.nome
    }]);
  }


  //  buracos nas areas que estão abaixo do atual
  if (cargos.length || cs > csCargos + csFilhos) {
    if (area.tipo < 4) {
      for (i = area.tipo + 1; i <= 4; i++) {
        pushNull(i, csCargos || 1, area.nome + ' olhando pra baixo');
      }
    }
  }

  //  buracos nas areas que estão acima do atual
  let pai = Areas.findOne({
    _id: area.paiId
  }) || {
    tipo: 0
  };
  if (pai) {
    if (area.tipo - pai.tipo > 1) {
      for (i = pai.tipo + 1; i < area.tipo; i++) {
        pushNull(i, cs, area.nome + ' olhando pra cima');
      }
    }
  }

  //
  // Insere area no vetor
  //
  if (!mapaAreas[area.tipo]) mapaAreas[area.tipo] = [];
  mapaAreas[area.tipo].push({
    nome: area.nome,
    colspan: cs,
    classe: tipoToNome[area.tipo],
    areaId: area._id,
    areaImg: tipoToImg(area.tipo)
  });

  return cs;
};

transpose = function(a) {
  let w = a.length ? a.length : 0;

  let comprimentos = _.map(a, function(arr) {
    return arr.length;
  });

  h = _.max(comprimentos);

  if (h === 0 || w === 0) {
    return [];
  }

  let i = [];
  let j = [];
  let t = [];

  for (i = 0; i < h; i++) {
    t[i] = [];
    for (j = 0; j < w; j++) {
      t[i][j] = a[j][i];
    }
  }

  return t;
};

constroiDiagrama = function() {
  Session.set('noRender', true);
  mapaAreas = [];
  mapaCargos = [];
  mapaCoordenadores = [];

  let raiz = FlowRouter.getQueryParam('raiz') || null;


  constroiHierarquia(raiz);
  matrizCoordenadores.set(mapaCoordenadores);
  matrizAreas.set(mapaAreas.clean());
  matrizCargos.set(transpose(mapaCargos));

  Meteor.setTimeout(function() {
    $('.scroll-diagrama').mCustomScrollbar('update');
  }, 100);
};

Template.diagramaArvore.onRendered(function() {
  coordCarreira = Carreiras.findOne({
    coordenador: true
  });
  coordSenioridadeId = coordCarreira && coordCarreira.estrutura[0];
  coordSenioridade = Senioridades.findOne({
    _id: coordSenioridadeId
  });

  $('.scroll-diagrama').mCustomScrollbar({
    axis: 'x'
  });

  this.autorun(constroiDiagrama);
});


Template.diagramaArvore.events({
  'click .mudar-raiz': function(e) {
    e.preventDefault();
    if (this.areaId === GHOST_CHAR) return;
    FlowRouter.setQueryParams({
      raiz: this.areaId
    });
  },
  'click .subir-nivel': function(e) {
    e.stopPropagation();
    e.preventDefault();
    let area = Areas.findOne({
      _id: this.areaId
    });
    FlowRouter.setQueryParams({
      raiz: area.paiId || null
    });
  },
  'click .bloco-cargo': function() {
    if (this.classificacao) {
      Modal.show('_mostrarClassificacao', {
        classificacaoId: this.classificacao._id
      });
    }
  },
});

Template.diagramaArvore.helpers({
  matrizAreas: function() {
    return matrizAreas.get();
  },
  matrizCargos: function() {
    return matrizCargos.get();
  },
  matrizCoordenadores: function() {
    return matrizCoordenadores.get();
  },
  botaoSubir: function() {
    return this.areaId !== GHOST_CHAR && FlowRouter.getQueryParam('raiz') === this.areaId;
  },
});


Template.buscaAreas.onRendered(function() {
  Meteor.typeahead.inject();
});
Template.buscaAreas.helpers({
  areas: function() {
    return Areas.find().fetch();
  }
});

Template.diagrama.onRendered(function() {
  // Meteor.typeahead.inject();
});

Template.diagrama.events({
  'click .conhecer': function(e) {
    e.preventDefault();
    FlowRouter.setQueryParams({
      raiz: this._id
    });
  },
  'click .btn-voltar': function(e) {
    e.stopPropagation();
    e.preventDefault();
    let area = Areas.findOne({
      _id: this._id
    });
    FlowRouter.setQueryParams({
      raiz: area.paiId || null
    });
  },
});

Template.diagrama.helpers({
  areaRaiz() {
    let raiz = FlowRouter.getQueryParam('raiz');
    if (!raiz) {
      return {
        nome: 'AES Brasil'
      };
    }
    let area = Areas.findOne({
      _id: raiz
    });
    return area;
  },
  filhosDiretos() {
    let raiz = FlowRouter.getQueryParam('raiz') || null;
    let filhos = Areas.find({
      paiId: raiz
    });
    return filhos;
  },
  areas() {
    return Areas.find().fetch();
  },
  selected(e, suggestion) {
    FlowRouter.setQueryParams({
      raiz: suggestion._id
    });
  },
  listaHorizontal() {
    let raiz = FlowRouter.getQueryParam('raiz') || null;
    if (!raiz) return true;
    let area = Areas.findOne({
      _id: raiz
    });
    if (area.tipo === 1) return true;
    return false;
  },
  areaImg: function() {
    return tipoToImg(this.tipo);
  },
  area: function(id) {
    return Areas.findOne({
      _id: id
    });
  }
});
