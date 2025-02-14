/*----------------------------------------------------------------------
-----------------|| Initialisation map et positions  ||-----------------
----------------------------------------------------------------------*/

class GoogleMap {
    constructor() {
        this.zoneMap = document.querySelector('#zoneMap');
        this.map = null;
        this.userPosition = null;
        this.restoMarker = null;
    }

    /**
     * Charge la carte sur un element
     * @param {HTMLElement} element 
     */
    async load(element) {
        return new Promise((resolve, reject) => {
            // Récupération de la map via l'api google maps
            $script('https://maps.googleapis.com/maps/api/js?key=AIzaSyAhbKHFVYqCju57U2B3xIeiSnDoc05n7A4&map_ids=a21c47956ac95939&libraries=places', () => {
                
                // Class et méthodes pour les marqueurs personnalisés
                this.restoMarker = class RestoMarker extends google.maps.OverlayView {
                    constructor (pos, map, id, iconSrc) {
                        super();
                        this.div = document.createElement('div');
                        this.pos = pos;
                        this.id = id;
                        this.iconSrc = iconSrc;
                        this.setMap(map);
                        this.bounds = null;
                    };
                
                    onAdd () {
                        this.div.classList.add('marker');
                        $(this.div).attr('id', `marker-${this.id}`);
                        this.div.style.position = 'absolute';
                        this.div.innerHTML = '<img class="imgMarker" src="' + this.iconSrc + '"alt="image marker" />';
                        this.getPanes().overlayImage.appendChild(this.div);
                        // Animation de l'apparition des marqueurs 
                        $(this.div).css('opacity', '0').css('margin-top', '-100px');
                        $(this.div).animate({opacity:'1', marginTop:'-60px'}, 700);                   
                    };
                
                    draw () {
                        let position = this.getProjection().fromLatLngToDivPixel(this.pos);
                        this.div.style.left = position.x + "px";
                        this.div.style.top = position.y + "px";
                    };
                
                    onRemove () {
                        this.div.parentNode.removeChild(this.div);
                    };

                    activated(text) {
                        this.div.classList.add('is-active');
                        $('.marker.is-active').append("<p id='infoBulle'>" + text + "</p>");
                    };

                    desactivated() {
                        this.div.classList.remove('is-active');
                        $('#infoBulle').remove();
                    };

                    onClick(cb) {
                        this.div.addEventListener('click', (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            cb();
                        });
                    };

                    onOffSurvol(text, cb) {
                        $(this.div).hover(
                            // Survol
                            () => {
                            this.activated(text);
                            },
                            // Départ
                            () => {
                                this.desactivated();
                            }
                        );
                    }

                } // Fin class RestoMarker
                
                // Création du nouvel objet de la map stocké dans this.map
                this.map = new google.maps.Map(element, {
                    zoom: 15,
                    mapId: 'a21c47956ac95939',
                    center: {lat: 48.859626, lng: 2.350331},
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    mapTypeControl: true,
                    scrollwheel: true,
                    mapTypeControlOptions: {
                        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
                        },
                    navigationControl: true,
                    navigationControlOptions: {
                        style: google.maps.NavigationControlStyle.ZOOM_PAN
                    }
                });
                this.bounds = new google.maps.LatLngBounds();
                resolve();
            });
        });
    } // fin fonction load

/*----------------------------------------------------------------------
-------------|| Fonction de geolocalisation de l'user ||----------------
----------------------------------------------------------------------*/
    async geoloc() {
        return new Promise((resolve, reject) => {
            if(navigator.geolocation) {
                // Si la geoloc est possible sur le navigateur
                navigator.geolocation.getCurrentPosition((pos) => {
                    this.userPosition = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    }
                    //Centrage de la map sur l'user
                    this.map.setCenter(this.userPosition);
                    // Ajout du marker de l'user
                    const markerUser = this.addMarker(200, this.userPosition.lat, this.userPosition.lng, 'media/person_icon.png');
                    markerUser.onOffSurvol('Vous');
                    resolve();
                }, () => {
                    // Geoloc refusée
                    handleError(true);
                });
                
            } else {
                // Geoloc impossible sur le navigateur
                handleError(false);
            }

            // Affichage de l'erreur
            function handleError(status) {
                let errorStatus = status ?
                "Erreur : la géolocalisation est impossible. Service indisponible." :
                "Le navigateur ne prend pas en charge la géolocalisation. Service indisponible."

                alert(errorStatus);
                $('#zoneListe').html('<p id="error"> Veuillez autoriser la géolocalisation dans votre navigateur et actualiser la page pour accéder aux données. </p>');
            }
        });
    } // fin fonction geoloc
    
    /**
     * Ajoute un marqueur sur la carte
     * @param {number} id
     * @param {string} lat 
     * @param {string} lng
     * @param {string} iconSrc
     * @return {restoMarker} 
     */
    addMarker(id, lat, lng, iconSrc) {
        let coord = new google.maps.LatLng(lat, lng);
        let marker = new this.restoMarker(coord, this.map, id, iconSrc);
        //$(this.map).gmap('set', 'bounds', null)
        //this.bounds.extend(coord);
        return marker;
    }

    // Centre la map pour englober les marqueurs
    centerMap() {
        // this.map.panTo(this.userPosition);
        this.map.panToBounds(this.bounds);
        // this.map.fitBounds(this.bounds);
    }

} // Fin class GoogleMap

