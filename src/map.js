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
            $script('https://maps.googleapis.com/maps/api/js?key=AIzaSyAOC9ObG1y6HwJN-04mYSZy90W4nQOVs3k&libraries=places', () => {
                
                // Class et méthodes pour les marqueurs personnalisés
                this.restoMarker = class RestoMarker extends google.maps.OverlayView {
                    constructor (pos, map, id, iconSrc) {
                        super()
                        this.div = document.createElement('div')
                        this.pos = pos
                        this.id = id
                        this.iconSrc = iconSrc
                        this.setMap(map)
                    }
                
                    onAdd () {
                        this.div.classList.add('marker')
                        $(this.div).attr('id', `marker-${this.id}`)
                        this.div.style.position = 'absolute'
                        this.div.innerHTML = '<img src="' + this.iconSrc + '"alt="image marker" />'
                        this.getPanes().overlayImage.appendChild(this.div)
                    }
                
                    draw () {
                        let position = this.getProjection().fromLatLngToDivPixel(this.pos)
                        this.div.style.left = position.x + "px"
                        this.div.style.top = position.y + "px"
                    }
                
                    onRemove () {
                        this.div.parentNode.removeChild(this.div)
                    }

                    activated(text) {
                        this.div.classList.add('is-active');
                        $('.marker.is-active').append("<p id='infoBulle'>" + text + "</p>");
                    }

                    desactivated() {
                        this.div.classList.remove('is-active');
                        $('#infoBulle').remove();
                    }

                    onClick(cb) {
                        this.div.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            cb();
                        });
                    }

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

                        // this.div.classList.add('is-onSurvol');
                        // this.div.addEventListener('mouseover', (e)=> {
                        //     e.preventDefault();
                        //     e.stopPropagation();
                        //     cb();
                        //     console.log('Marker SURVOLÉ !');
                        // });
                    }

                } // Fin class RestoMarker
                
                // Création du nouvel objet de la map stocké dans this.map
                this.map = new google.maps.Map(element, {
                    zoom: 15,
                    center: {lat: 48.859626, lng: 2.350331},
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
                const markerUser = this.addMarker(200, this.userPosition.lat, this.userPosition.lng, 'media/person_icon.png');
                resolve();
            });
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
        return marker;
    }

} // Fin class GoogleMap

