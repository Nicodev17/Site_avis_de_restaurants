/*----------------------------------------------------------------------
--------------|| Récupération des données et affichage ||---------------
----------------------------------------------------------------------*/
class Application {
  constructor() {
    this.mapClass = new GoogleMap();
    this.arrayRestaurants;
    this.filteredArray;
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

  /* ---- Récupération des valeurs du slider et filtrage ---- */
  async filter() {
    await this.getResto();
    await this.initResto(this.arrayRestaurants);

    $("#slider-range").on("slide", (event, ui) => {
      let value1 = ui.values[0];
      let value2 = ui.values[1];

      const filtreNote = this.arrayRestaurants.filter(element => element.calculAverage() >= value1 && element.calculAverage() <= value2);
      this.filteredArray = filtreNote;
      console.log(this.filteredArray);

      // maj de la liste
      $('#zoneListe ul').empty();

      // On relance la fonction initResto avec les resto filtrés
      this.initResto(this.filteredArray);
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

    let arrayRestoLocal = [];
    // Pour chaque item reçu dans la réponse => Création d'un objet restaurant contenant ses propres méthodes d'instance
    result.forEach((element, index) => {
      const restaurant = new Restaurant(index, element.restaurantName, element.address, element.lat, element.lon, element.ratings);
      arrayRestoLocal.push(restaurant)
    });
    this.arrayRestaurants = arrayRestoLocal;
  } // Fin fonction getResto

  /*----------------------------------------------------------------------
  ---------------|| Affichage des restos (map et liste) ||----------------
  ----------------------------------------------------------------------*/
  async initResto(arrayResto) {
    let mapClass = this.mapClass;
    await this.mapClass.load(zoneMap);
    await this.mapClass.geoloc();
    await this.getResto();
    // Fonction d'ajout de resto
    await this.addResto();
    // let isPopup = false;

    // Tableau contenant tous les objets restaurant
    console.table(arrayResto);

    // ---- Pour chaque objet restaurant ----
    for (let i = 0; i < arrayResto.length; i++) {
      let item = arrayResto[i];

      // ---- Création d'un marqueur perso ----
      let idMarker = i;
      let marker = mapClass.addMarker(idMarker, item.position.lat, item.position.lon, 'media/icon_marker.png');

      // Marqueurs de base (en arrière plan)
      // let markerBack = new google.maps.Marker({
      //   position: {lat: item.position.lat, lng: item.position.lon },
      //   map: this.mapClass.map,
      //   opacity: 0,
      // });

      // ---- Affichage dans la liste de droite ----
      item.displayRestoList(item);

      // Catch de chaque item de liste
      let listItem = $('#zoneListe li:eq(' + i + ')');

      // Appel de la fonction du comportement des marqueurs au survol d'un item de liste
      item.markerEvent(item, marker, listItem);

      //---- Comportement d'un marqueur à son survol direct ----
      // $(document).ready(function event() {
      //   $('.marker').hover(function() {
      //     marker.onSurvol();
      //     },
      //     function() {
      //       marker.offSurvol();
      //     });
      // });

      // ---- Pop up fenêtre info lors du clic sur un item de la liste ----
      $('#zoneListe li:eq(' + i + ')').click(() => {

        // ***** APPEL ICI DE LA FONCTION EXTERNE (comme markerEvent) ! *****

        // Modification de la variable
        //isPopup = true;

        // Affichage du contenu
        $('#overlay').css('display', 'flex');
        // Injection des infos
        function displayInfo() {
          $('h3').html(item.name);
          $('#photoResto').html('<img src="' + item.getPhoto() + '"alt="photo du restaurant">');
          $('#adresseResto p').html(item.address);
          $('#noteMoyenne p').html('Note moyenne :  ' + item.calculAverage() + ' / 5' + '<strong> ★</strong>');
          $('#titleAvis').html(item.getRatings().length + ' avis sur ce restaurant :');
          // Récupération des avis
          item.getRatings().forEach(element => {
            $('#titleAvis').after('<div class="ratingItem"> <p> Note : ' + element.stars + '/5' + '<i id="dots"> </i> </p>' 
            + '<p>' + 'Commentaire : ' + element.comment + '</p> <hr> </div>');
          });
        }
        displayInfo();

        // Fermeture fenetre info
        $('#buttonClose').click(() => {
          //isPopup = false;
          $('#overlay').css('display', 'none');
          $('.ratingItem').remove();
          $('#formAvis').css('display', 'none');

          // Réinitialisation du bouton d'ajout de com
          $('#buttonAddAvis').css('display', 'block');
          // Réinitialisation du formulaire
          $('#formulaire').get(0).reset();
          $('#buttonClose').off();
          $('#buttonAddAvis').off();
        });

        /* ---- AJOUT D'AVIS ---- */
        $('#buttonAddAvis').click(() => {

          // -- Affichage du formulaire --
          $('#formAvis').slideDown(800);
          // Scroll auto en bas de la fenetre
          $('#infoResto').stop().animate({
            scrollTop: $('#infoResto')[0].scrollHeight
          }, 800);
          $('#formAvis').css('display', 'block');
          $('#buttonAddAvis').css('display', 'none');

          // Soumission du formulaire
          $('#formAvis').submit((e) => {
            e.preventDefault();
            let noteEnter = document.forms["formAvis"]["note"].value;
            let commentEnter = document.forms["formAvis"]["commentaire"].value;
            
            alert('Votre commentaire a été envoyé !');
          
            // Envoi des infos dans la fonction d'ajout d'avis (méthode de la classe restaurant)
            item.addRating(Number(noteEnter), commentEnter);

            let restaurant = this.arrayRestaurants.find(elt => elt.id === item.id);

            restaurant.addRating(Number(noteEnter), commentEnter);
            console.table(this.arrayRestaurants);

            // Rafraichissement de l'affichage
            $('.ratingItem').remove();
            displayInfo();
            $('#dots').addClass('fa fa-ellipsis-v');
            // Maj du nb d'avis et de la note dans la liste de droite
            $('.restoNote:eq(' + i + ')').html(item.calculAverage() + '/5' + '<strong> ★</strong>' + ' (' + item.getRatings().length + ' avis)');

            // Disparition du formulaire
            $('#formAvis').slideUp(600);
            // Réaffichage du bouton d'ajout
            $('#buttonAddAvis').css('display', 'block');
            // Réinitialisation du formulaire
            $('#formulaire').get(0).reset();
            $('#formAvis').off();

            // Suppression de com 
            $('#dots').click(function () {
              let dotsClicked = true;
              $('#bulleSuppr').css('display', 'flex');
              
              $('#dots').append('<div id="bulleSuppr"> <button id="buttonSuppr"> Supprimer ce commentaire </button> </div>');
              $('#buttonSuppr').click(function () {
                console.log('suppression du com');
              })

              if (dotsClicked == true) {
                $('#dots').click(function () {
                  console.log('TEST');
                  $('#bulleSuppr').css('display', 'none');
                });
                $('#dots').off();
                dotsClicked = false;
              }
            });
          });

          // Annulation de l'envoi de com
          $('#buttonCancel').click(function () {
            $('#formAvis').slideUp(600);
            $('#buttonAddAvis').css('display', 'block');
            $('#formulaire').get(0).reset();
            $('#formAvis').off();
          });
        }); // Fin de l'ajout d'avis
        
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

    } // Fin boucle for

  } // Fin fonction initResto

/*----------------------------------------------------------------------
-------------------|| Fonction d'ajout de restaurants ||----------------
----------------------------------------------------------------------*/
async addResto() {
  let mapClass = this.mapClass;
  
  mapClass.map.addListener("rightclick", async (e) => {

    let latClick = e.latLng.lat();
    let longClick = e.latLng.lng();

    // Requete pour obtenir l'adresse à partir de la position
    const adressRequest = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latClick},${longClick}&key=AIzaSyAOC9ObG1y6HwJN-04mYSZy90W4nQOVs3k`)
        .then(resultat => resultat.json())
        .then(json => json)
    const newRestoAdress = adressRequest.results[0].formatted_address;

    // Formulaire
    const newRestoName = prompt('Entrez le nom du restaurant que vous souhaitez ajouter', "Nom du restaurant");

    // Création du nouvel objet restaurant
    const restoAdded = new Restaurant(40, newRestoName, newRestoAdress, latClick, longClick, []);
    console.log(restoAdded);

    // Ajout au tableau des restaurants
    this.arrayRestaurants.push(restoAdded);
    console.log(this.arrayRestaurants);

    // Création du marqueur
    let marker = mapClass.addMarker(500, latClick, longClick, 'media/icon_marker_added.png');

    // Ajout dans la liste
    restoAdded.displayRestoList(restoAdded);

    // On relance la fonction du comportement des marqueurs au survol
    let listItem = $('#zoneListe li:last-child');
    restoAdded.markerEvent(restoAdded, marker, listItem);

    // Centrage de la map sur le nouveau marqueur (?)
    // this.map.panTo(e.latLng);
    
  });

} // Fin fonction addResto

} // Fin classe Application