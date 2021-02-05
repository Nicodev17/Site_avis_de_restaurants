/*----------------------------------------------------------------------
-------|| Initialisation des objets et appel des fonctions  ||----------
----------------------------------------------------------------------*/

window.addEventListener("load", function() {
    $('h1').animate({opacity:'1'}, 1000);  
    $('#logo').css('margin-top', '-200px');
    $('#logo').animate({marginTop:'0px', opacity:'1'}, 800);
});


async function init() {
    let mapClass = new GoogleMap();
    await mapClass.load(zoneMap);
    await mapClass.geoloc();
    
    // Application
    const newApplication = new Application(mapClass);
    newApplication.getResto();
    newApplication.sliderInit();
    newApplication.moveMap();
    newApplication.filter();
    newApplication.addResto();
}

init();




