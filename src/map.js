$(function () {
    $('.zoneMap').html('Affichage de la map google ici');

    // ---- Appel des fonctions ----
    window.onload = function () {
        initMap();
        getResto();
    };

    /*----------------------------------------------------------------------
    --------------|| Fonction d'initialisation de la carte ||---------------
    ----------------------------------------------------------------------*/

    // Init latitude/longitude
    let lat;
    let lon;
    let map = null;

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
            map: map,
            icon: 'media/icon_marker.png'
        });
    }

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
        console.log('Utilisateur non localisé, service indisponible.');
    }

    /*----------------------------------------------------------------------
    ------------------|| Récupération des resto JSON ||---------------------
    ----------------------------------------------------------------------*/

    function getResto(){
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                var response = JSON.parse(this.responseText);
                let restaurants = response.restaurants;
                console.table(restaurants);

                // ---- Récupération de la position de chaque resto
                for(let i = 0 ; i < restaurants.length ; i++){

                    // ---- Ajout des marqueurs sur la map ----
                    new google.maps.Marker({
                        position: { lat: restaurants[i].lat, lng: restaurants[i].lon },
                        map: map
                    });
                    
                    // ---- Calcul de la moyenne des note de chaque resto ----
                    let moyenneNote;
                    function calculNote() {
                        let somme = restaurants[i].ratings[0].stars + restaurants[i].ratings[1].stars ;
                        moyenneNote = somme/restaurants[i].ratings.length;
                        //console.log(moyenneNote);
                    }
                    calculNote();

                    // ---- Ajout dans la liste ----
                    $('.zoneListe li:eq(' + i + ')').html('<h4>' + restaurants[i].restaurantName + '</h4>' 
                    + '<p class="restoAdress"> Adresse : ' + restaurants[i].address + '</p>'
                    + '<p class="restoNote"> Note : '  + moyenneNote + '/5 </p>'
                    + '<p class="restoComment"> Commentaire : '  + restaurants[i].ratings[0].comment + '</p>');
                }                
            }
        };
        request.open("GET","src/items.json");
        request.send();
    }

});

