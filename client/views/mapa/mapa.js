Template.mapa.onCreated(function() {
  this.subscribe('areas', {
    connection: Backend
  });
  this.subscribe('cargos', {
    connection: Backend
  });
});
