FlowRouter.route('/', {
  action() {
    BlazeLayout.render('layout', {
      templateAtual: 'home',
    });
  },
});

FlowRouter.route('/other', {
  action() {
    BlazeLayout.render('layout', {
      templateAtual: 'other',
    });
  },
});



