$(function () {
    $('.zoneMap').html('Affichage de la map google ici');

    // Initialisation lat/long
    let lat;
    let lon;
    let map = null;

    /*----------------------------------------------------------------------
    --------------|| Fonction d'initialisation de la carte ||---------------
    ----------------------------------------------------------------------*/
    function initMap() {
        // ---- Création de l'objet map et insertion dans le html ----
        map = new google.maps.Map(document.querySelector('.zoneMap'), {
            // Centrage sur les coordonnées ci-dessus
            center: new google.maps.LatLng(lat, lon),
            // Définition du zoom par défaut
            zoom: 14,
            // Type de carte (ici routière)
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            // Activation des options de contrôle (plan, satellite..)
            mapTypeControl: true,
            mapTypeControlOptions: {
                // type de placement des options
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
            },
            // Activation des options de navigation (zoom...)
            navigationControl: true,
            navigationControlOptions: {
                // Type d'affichage des options
                style: google.maps.NavigationControlStyle.ZOOM_PAN
            }
        });

        // ---- Ajout du marqueur ----
        var marker = new google.maps.Marker({
            // Position en syntaxe json
            position: { lat: lat, lng: lon },
            // Carte de destination
            map: map
        });
    }

    window.onload = function () {
        // La fonction s'exécute lorsque le DOM est chargé
        initMap();
    };

    /*----------------------------------------------------------------------
    -------------------------|| GEOLOCALISATION ||--------------------------
    ----------------------------------------------------------------------*/

    navigator.geolocation.getCurrentPosition(success, error);

    function success(position) {
        //console.log(position.coords.latitude, position.coords.longitude);
        lat = position.coords.latitude;
        lon = position.coords.longitude;
    }

    function error() {
        console.log('Utilisateur non localisé');
    }
    

});