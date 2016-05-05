/* For the sticky navigation */

Template.layout.onRendered(function() {
  $('.js-section-about').waypoint(function(direction) {
    if (direction === 'down') {
      $('nav').addClass('sticky animated slideInDown');
    } else {
      $('nav').removeClass('sticky animated slideInDown');
    }
  }, {
    offset: '90px;'
  });
});

Template.home.onRendered(function() {
  this.autorun(function() {
    let t = FlowRouter.getQueryParam('section');
    if (t) {
      let target = $('#' + t);
      $('body').animate({
        scrollTop: target.offset().top
      }, 1000);
    }
  });
});


Template.header.events({
/*  'click .menu-link': function(e) {
    e.preventDefault();
    let t = $(e.target);
    let name = t.data('name');
    let hash = t.data('hash');
    let target = $('#' + hash);

    if (FlowRouter.getRouteName() !== 'home') {
      FlowRouter.go('home', {}, {
        section: hash
      });
    } else {
      $('body').animate({
        scrollTop: target.offset().top
      }, 1000);
    }
    //FlowRouter.redirect(name, {}, {section: hash});
  }*/
/*  'click .js-scroll-full': function() {
    $('.my-body').animate({
      scrollTop: $('.js-section-portfolio').offset().top
    }, 1000);
  },

  'click .js-scroll-ghost': function() {
    $('.my-body').animate({
      scrollTop: $('.js-section-testimonials').offset().top
    }, 1000);
  },
*/

/*  'click a[href*=#]:not([href=#])': function(e) {
    var el = e.target;
    e.preventDefault();

    if (location.pathname.replace(/^\//, '') == el.pathname.replace(/^\//, '') && location.hostname == el.hostname) {
      var target = $(el.hash);
      target = target.length ? target : $('[name=' + el.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000);
      };
    }
  },*/

});
