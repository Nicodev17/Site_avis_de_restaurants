/*----------------------------------------------------------------------
--------------|| Récupération des données et affichage ||---------------
----------------------------------------------------------------------*/
class Application {
  constructor() {
    this.mapClass = new GoogleMap();
    this.arrayRestaurants;
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
    //console.log(this.arrayRestaurants);
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
  -------------|| Récupération des restos (requete JSON) ||---------------
  ----------------------------------------------------------------------*/
  async getResto() {
    // Promesse synchrone sur le fichier json 
    const restaurants = await fetch('src/items.json')
      .then(resultat => resultat.json())
      .then(json => json)

    // Resultat de la requete
    let result = restaurants;

    let arrayRestoLoc = [];
    // Pour chaque item reçu dans la réponse => Création d'un objet restaurant contenant ses propres méthodes d'instance
    result.forEach(element => {
      const restaurant = new Restaurant(element.restaurantName, element.photo, element.address, element.lat, element.lon, element.ratings);
      arrayRestoLoc.push(restaurant)
    });
    this.arrayRestaurants = arrayRestoLoc;
  } // Fin fonction getResto

  /*----------------------------------------------------------------------
  ---------------|| Affichage des restos (map et liste) ||----------------
  ----------------------------------------------------------------------*/
  async initResto() {
    let mapClass = this.mapClass;
    await this.mapClass.load(zoneMap);
    await this.mapClass.geoloc();
    await this.getResto();
    let arrayRestaurants = this.arrayRestaurants;
    let isPopup = false;

    // Tableau contenant tous les objets restaurant
    console.table(arrayRestaurants);

    // ---- Pour chaque objet restaurant ----
    for (let i = 0; i < arrayRestaurants.length; i++) {
      let listItem = $('#zoneListe li:eq(' + i + ')');
      let item = this.arrayRestaurants[i];

      // ---- Création d'un marqueur perso ----
      let marker = mapClass.addMarker(item.position.lat, item.position.lon, 'media/icon_marker.png');

      // // Marqueurs de base (en arrière plan)
      // let markerBack = new google.maps.Marker({
      //   position: {lat: item.lat, lng: item.lon },
      //   map: this.mapClass.map,
      //   opacity: 1,
      // });

      // ---- Affichage dans la liste de droite ----
      listItem.html('<h4>' + item.name + '</h4>'
        + '<p class="restoAdress">' + item.address + '</p>'
        + '<p class="restoNote">' + item.calculAverage() + '/5 ★ </p>').css('display', 'block');

      // ---- Comportement des marqueurs au survol d'un item de la liste ----
      let text = item.name;
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

      // ---- Pop up fenêtre info lors du clic sur un item de la liste ----
      $('#zoneListe li:eq(' + i + ')').click(function () {
        // Modification de la variable
        isPopup = true;
        // Affichage
        $('#overlay').css('display', 'flex');
        // Injection des infos
        $('h3').html(item.name);
        $('#photoResto').html('<img src="' + item.photo + '"alt="photo du restaurant">');
        $('#adresseResto p').html('Adresse : ' + item.address);
        $('#avisResto p:eq(' + i + ')').html(item.getComments());

        // Fermeture fenetre info
        $('#buttonClose').click(function () {
          $('#overlay').css('display', 'none');
          isPopup = false;
        });
      });

      // // Fermeture de la fenetre lors du clic à l'extérieur (bug)
      // if(isPopup === true) {
      //   console.log('la fenetre pop up s\'ouvre');

      //   $(document).click(function(event) { 
      //     if(!$(event.target).closest('#infoResto').length) {
      //       //$('#overlay').css('display', 'none');
      //       console.log('clic en dehors de la fenetre');
      //     } 
      //   });
      // }
    } // Fin boucle for

  } // Fin fonction initResto

} // Fin classe Application