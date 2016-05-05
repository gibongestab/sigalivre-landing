FlowRouter.route('/', {
  name: 'home',
  action() {
    BlazeLayout.render('layout', {
      templateAtual: 'home',
    });
  },
});

FlowRouter.route('/mapa', {
  name: 'mapa',
  action() {
    BlazeLayout.render('layout', {
      templateAtual: 'mapa',
    });
  },
});



