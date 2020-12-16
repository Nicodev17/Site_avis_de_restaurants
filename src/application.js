/*----------------------------------------------------------------------
--------------|| Récupération des données et affichage ||---------------
----------------------------------------------------------------------*/
class Application {
  constructor() {
    this.arrayRestaurants = [];
    this.mapClass = new GoogleMap();
  }

  testVar() {
    //console.log(this.arrayRestaurants);
  }

  /*----------------------------------------------------------------------
  ---------------|| Filtrage des restos selon leur note ||----------------
  ----------------------------------------------------------------------*/

  /* ----- Création du slider de filtrage des notes ---- */
  sliderInit() {
    $("#slider-range").slider({
      range: true,
      min: 1,
      max: 5,
      values: [1, 5],
      slide: function (event, ui) {
        $("#note").val("Note entre " + ui.values[0] + " et " + ui.values[1] + " ★");
      }
    });

    $("#note").val("Note entre " + $("#slider-range").slider("values", 0) +
      " et " + $("#slider-range").slider("values", 1) + " ★");
  }; // Fin fonction sliderInit

  /* ---- Récupération des valeur du slider et filtrage ---- */
  filter() {
    console.log(this.arrayRestaurants);
    // this.arrayRestaurants.forEach(element => {
    //   console.log('test');
    // });

    $("#slider-range").on("slide", function (event, ui) {
      let value1 = ui.values[0];
      let value2 = ui.values[1];

      console.log(value1);
      console.log(value2);

    });
  } // Fin fonction filter


  /*----------------------------------------------------------------------
  --------------|| Récupération et affichage des resto ||-----------------
  ----------------------------------------------------------------------*/

  async initResto() {
    let mapClass = this.mapClass;
    let arrayRestaurants = this.arrayRestaurants;
    await this.mapClass.load(zoneMap);
    await this.mapClass.geoloc();
    let isPopup = false;
    let restaurants;

    // Requête pour obtenir tous les resto du fichier JSON
    const request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        var response = JSON.parse(this.responseText);
        restaurants = response;

        // Pour chaque resto
        for (let i = 0; i < restaurants.length; i++) {
          let item = restaurants[i];
          let listItem = $('#zoneListe li:eq(' + i + ')');

          // Création d'un marqueur perso
          let marker = mapClass.addMarker(item.lat, item.lon, 'media/icon_marker.png');

          // Marqueurs de base en arrière plan
          // let markerBack = new google.maps.Marker({
          //   position: {lat: item.lat, lng: item.lon },
          //   map: this.mapClass.map,
          //   opacity: 1,
          // });

          // Evenement du comportement des marqueurs au survol d'un item de la liste
          let text = item.restaurantName;

          $(document).ready(function event() {
            listItem.hover(
              function () {
                marker.activated();
                $('.marker.is-active').append("<p id='infoBulle'>" + text + "</p>");
              },
              function () {
                $('#infoBulle').remove();
                marker.desactivated();
              }
            );
          });

          // Pop up fenetre info
          $('#zoneListe li:eq(' + i + ')').click(function () {
            // Modification de la variable
            isPopup = true;
            // Affichage
            $('#overlay').css('display', 'flex');
            // Injection des infos
            $('h3').html(restaurant.name);
            $('#photoResto').html('<img src="' + restaurant.photo + '"alt="photo du restaurant">');
            $('#adresseResto p').html('Adresse : ' + restaurant.address);
            $('#avisResto p:eq(' + i + ')').html(restaurant.getComments());

            // Fermeture fenetre info
            $('#buttonClose').click(function () {
              $('#overlay').css('display', 'none');
              isPopup = false;
            });

            // Fermeture de la fenetre lors du clic à l'extérieur (bug)
            // if(isPopup === true) {
            //   console.log('la fenetre pop up s\'ouvre');

            //   $(document).click(function(event) { 
            //     if(!$(event.target).closest('#infoResto').length) {
            //       //$('#overlay').css('display', 'none');
            //       console.log('clic en dehors de la fenetre');
            //     } 
            //   });
            // }
          });

          // Création d'un objet contenant les méthodes d'instance
          const restaurant = new Restaurant(item.restaurantName, item.photo, item.address, item.lat, item.lon, item.ratings);
          arrayRestaurants.push(restaurant);

          // InfoBulles sur les marqueurs
          // let marker1 = markerBack;
          // arrayRestaurants.forEach(function(){
          //   var infowindow = new google.maps.InfoWindow({maxWidth: 300, 
          //     //On définit la position d'origine de l'infoWindow (la position du marqueur) 
          //     position: new google.maps.LatLng(item.lat, item.lon), 
          //     //On définit le texte à afficher dans l'infoWindow 
          //     content: restaurant.name });
          //     //On ajoute un listener d'événement : on écoute le clic sur le marqueur
          //     google.maps.event.addListener(marker1, 'click', function() {
          //     // Ouverture de l'infobulle 
          //     infowindow.open(mapClass.map, marker1);
          //     });
          // });

          // Affichage dans la liste
          listItem.html('<h4>' + restaurant.name + '</h4>'
            + '<p class="restoAdress">' + restaurant.address + '</p>'
            + '<p class="restoNote">' + restaurant.calculAverage() + '/5 ★ </p>').css('display', 'block');

        }; // fin boucle for
        console.table(arrayRestaurants);
      }
    } // fin requete
    request.open("GET", "src/items.json");
    request.send();

  } // Fin fonction initResto

} // Fin class Application