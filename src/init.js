/*----------------------------------------------------------------------
-------|| Initialisation des objets et appel des fonctions  ||----------
----------------------------------------------------------------------*/

window.addEventListener("load", function() {
    $('h1').animate({opacity:'1'}, 1000);  
    $('#logo').css('margin-top', '-200px');
    $('#logo').animate({marginTop:'0px', opacity:'1'}, 800);
});

// Application
const newApplication = new Application();
newApplication.sliderInit();
newApplication.filter();