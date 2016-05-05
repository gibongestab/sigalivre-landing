Backend = DDP.connect('http://localhost:5000');

Areas = new Mongo.Collection('Areas', Backend);
Cargos = new Mongo.Collection('Cargos', Backend);
Senioridades = new Mongo.Collection('Senioridades', Backend);
Carreiras = new Mongo.Collection('Carreiras', Backend);
Classificacoes = new Mongo.Collection('Classificacoes', Backend);


Cargos.helpers({
  link: function() {
    return FlowRouter.path('cargos.view', {
      id: this._id
    });
  },
  carreira: function() {
    if (this.coordenador) {
      return {
        nome: 'Coordenador',
        avatar: 'coordenador.png'
      };
    }
    return Carreiras.findOne({
      _id: this.carreiraId
    });
  },
  area: function() {
    return Areas.findOne({
      _id: this.areaId
    });
  },
  classificacoes: function() {
    let classificacoes = Classificacoes.find({
      cargoId: this._id
    }).fetch();
    return _.sortBy(classificacoes, function(classificacao) {
      return classificacao.senioridade().ordem;
    });
  },
  senioridadesPossiveis: function() {
    if (this.coordenador === true) {
      return [{
        nome: 'Coordenador',
        ordem: 0,
        avatar: 'coordenador.png',
        abreviacao: 'Coordenador'
      }];
    }

    let carreira = Carreiras.findOne({
      _id: this.carreiraId
    });

    if (!carreira) return false;

    let estrutura = carreira && carreira.estrutura || [];
    return Senioridades.find({
      _id: {
        $in: estrutura
      }
    }, {
      sort: {
        ordem: 1
      }
    }).fetch();
  }
});


Classificacoes.helpers({
  link: function() {
    return FlowRouter.path('Classificacoes.view', {
      id: this._id
    });
  },
  senioridade: function() {
    let cargo = Cargos.findOne({_id: this.cargoId});

    if (cargo.coordenador) {
      return {
        nome: 'Coordenador',
        abreviacao: 'Coordenador'
      };
    }
    return Senioridades.findOne({
      _id: this.senioridadeId
    });
  },
  cargo: function() {
    return Cargos.findOne({
      _id: this.cargoId
    });
  },
  backups: function() {
    return Backups.find({
      docId: this._id
    }, {
      sort: {
        criadoEm: -1
      }
    });
  }
});
