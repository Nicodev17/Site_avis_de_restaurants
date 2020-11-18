$(function() {
document.querySelector('.zoneMap').innerHTML = 'Affichage de la map google ici';
});

// On initialise la latitude et la longitude de Paris (centre de la carte)
let lat = 48.852969;
let lon = 2.349903;
let map = null;

// Fonction d'initialisation de la carte
function initMap() {
    // Créer l'objet "map" et l'insere dans l'html'
    map = new google.maps.Map(document.querySelector('.zoneMap'), {
        // Nous plaçons le centre de la carte avec les coordonnées ci-dessus
        center: new google.maps.LatLng(lat, lon), 
        // Nous définissons le zoom par défaut
        zoom: 11, 
        // Nous définissons le type de carte (ici carte routière)
        mapTypeId: google.maps.MapTypeId.ROADMAP, 
        // Nous activons les options de contrôle de la carte (plan, satellite...)
        mapTypeControl: true, 
        mapTypeControlOptions: {
            // Cette option sert à définir comment les options se placent
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR 
        },
        // Activation des options de navigation dans la carte (zoom...)
        navigationControl: true, 
        navigationControlOptions: {
            // Comment ces options doivent-elles s'afficher
            style: google.maps.NavigationControlStyle.ZOOM_PAN 
        }
    });
}
window.onload = function(){
    // Fonction d'initialisation qui s'exécute lorsque le DOM est chargé
    initMap(); 
};