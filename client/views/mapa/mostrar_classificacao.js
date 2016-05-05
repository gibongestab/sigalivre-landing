Template._mostrarClassificacao.helpers({
  classificacao() {
    return Classificacoes.findOne({
      _id: this.classificacaoId
    });
  },
  titulo() {
    if (this.cargo().coordenador) {
      return this.cargo().nome;
    }

    return this.cargo().nome + ' - ' + '<b>' + this.senioridade().abreviacao + '</b>';
  },
  subtitulo() {
    return this.cargo().carreira().nome;
  },
  avatar() {
    return '/img/carreiras/64/' + this.cargo().carreira().avatar;
  }
});

