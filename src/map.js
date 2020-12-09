/*----------------------------------------------------------------------
-------|| Initialisation map, position et restaurants JSON ||-----------
----------------------------------------------------------------------*/

// zone d'affichage de la map
let zoneMap = document.querySelector('#zoneMap');

class GoogleMap {
    constructor() {
        this.map = null;
        this.userPosition = null;
    }

    /**
     * Charge la carte sur un element
     * @param {HTMLElement} element 
     */
    async load(element) {
        return new Promise((resolve, reject) => {
            // Récupération de la map via l'api google maps
            $script('https://maps.googleapis.com/maps/api/js?key=AIzaSyAOC9ObG1y6HwJN-04mYSZy90W4nQOVs3k', () => {
                let center = {lat: 48.859626, lng: 2.350331};   
                this.map = new google.maps.Map(element, {
                    zoom: 14,
                    center: center,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    mapTypeControl: true,
                    mapTypeControlOptions: {
                        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
                        },
                    navigationControl: true,
                    navigationControlOptions: {
                        style: google.maps.NavigationControlStyle.ZOOM_PAN
                    }
                });
                resolve();
            });
        });
    } // fin fonction load

/*----------------------------------------------------------------------
-------------------|| Fonction de geolocalisation ||--------------------
----------------------------------------------------------------------*/
    async geoloc() {
        return new Promise((resolve, reject) => {
            //Géolocalisation de l'utilisateur via l'api JS
            navigator.geolocation.getCurrentPosition((pos)=> {
                this.userPosition = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                }
                //Centrage de la map sur l'user
                this.map.panTo(this.userPosition);
                // Ajout du marker de l'user
                    //this.addMarker(this.userPosition.lat, this.userPosition.lng);
                let userMarker = new google.maps.Marker ({
                    position: new google.maps.LatLng(this.userPosition.lat, this.userPosition.lng),
                    map: this.map,
                    icon: 'media/person_icon.png'
                });
                resolve();
            });
        });
    } // fin fonction geoloc
    
    /**
     * Ajoute un marqueur sur la carte
     * @param {string} lat 
     * @param {string} lng 
     */
    addMarker(lat, lng) {
        let marker = new google.maps.Marker ({
            position: new google.maps.LatLng(lat, lng),
            map: this.map,
            icon: 'media/icon_marker.png'
        });
    }
} // fin class GoogleMap

/*----------------------------------------------------------------------
--------------------|| Fonction d'initialisation ||---------------------
----------------------------------------------------------------------*/
const initMap = async function() {
    let mapClass = new GoogleMap();
    await mapClass.load(zoneMap);
    await mapClass.geoloc();
    
    // Requête pour obtenir tous les resto du fichier JSON
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            var response = JSON.parse(this.responseText);
            let restaurants = response;
            console.table(restaurants);

            // Pour chaque resto
            for(let i = 0 ; i < restaurants.length ; i++) {
                let item = restaurants[i];

                // Création d'un marqueur
                mapClass.addMarker(item.lat, item.lon);

                // Création d'un objet contenant les méthodes d'instance
                const restaurant = new Restaurant(i, item.restaurantName, "media/favicon_burger.png", item.address, item.lat, item.lon, item.ratings);
                console.log(restaurant);
                
                // Affichage dans la liste
                $('.zoneListe li:eq(' + i + ')').html('<h4>' + item.restaurantName + '</h4>' 
                + '<p class="restoAdress"> Adresse : ' + item.address + '</p>'
                + '<p class="restoNote"> Note : '  + item.ratings[0].stars + '/5 </p>'
                + '<p class="restoComment"> Commentaire : '  + item.ratings[0].comment + '</p>');
            }
        }
    }
    request.open("GET","src/items.json");
    request.send();
}

if (zoneMap !== null) {
    initMap();
}