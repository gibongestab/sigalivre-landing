FlowRouter.route('/', {
  action() {
    BlazeLayout.render('layout', {
      templateAtual: 'home',
      template: 'teste'
    });
  },
});
