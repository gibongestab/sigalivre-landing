
/* For the sticky navigation */

Template.layout.onRendered(function() {

    $('.js-section-about').waypoint(function(direction) {
        if (direction == 'down') {
            $('nav').addClass('sticky animated slideInDown');
        } else {
            $('nav').removeClass('sticky animated slideInDown');
        }
    }, {
        offset: '90px;'
    });

});


Template.layout.events({
    'click .js-scroll-full': function() {
        $('.my-body').animate({
            scrollTop: $('.js-section-portfolio').offset().top}, 1000)
    },

    'click .js-scroll-ghost': function() {
        $('.my-body').animate({
            scrollTop: $('.js-section-testimonials').offset().top}, 1000)
    },


    'click a[href*=#]:not([href=#])':function(e) {
        var el = e.target;
        //this -> contexto de dados
        //el -> elemento clicado;
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
    },

});
