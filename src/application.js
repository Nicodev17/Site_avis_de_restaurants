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

      // Vidage de la liste précédente
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

    let arrayRestoLoc = [];
    // Pour chaque item reçu dans la réponse => Création d'un objet restaurant contenant ses propres méthodes d'instance
    result.forEach(element => {
      const restaurant = new Restaurant(element.restaurantName, element.address, element.lat, element.lon, element.ratings);
      arrayRestoLoc.push(restaurant)
    });
    this.arrayRestaurants = arrayRestoLoc;
  } // Fin fonction getResto

  /*----------------------------------------------------------------------
  ---------------|| Affichage des restos (map et liste) ||----------------
  ----------------------------------------------------------------------*/
  async initResto(arrayResto) {
    let mapClass = this.mapClass;
    await this.mapClass.load(zoneMap);
    await this.mapClass.geoloc();
    await this.getResto();
    let arrayRestaurants = arrayResto;
    let isPopup = false;

    // Tableau contenant tous les objets restaurant
    console.table(arrayRestaurants);

    // ---- Pour chaque objet restaurant ----
    for (let i = 0; i < arrayRestaurants.length; i++) {
      let item = arrayRestaurants[i];

      // ---- Création d'un marqueur perso ----
      let idMarker = i;
      let marker = mapClass.addMarker(idMarker, item.position.lat, item.position.lon, 'media/icon_marker.png');
      //console.log(marker.id);

      // // Marqueurs de base (en arrière plan)
      // let markerBack = new google.maps.Marker({
      //   position: {lat: item.lat, lng: item.lon },
      //   map: this.mapClass.map,
      //   opacity: 1,
      // });

      // ---- Affichage dans la liste de droite ----
      $('#zoneListe ul').append('<li class="listItem">' + '<h4>' + item.name + '</h4>'
      + '<p class="restoAdress">' + item.address + '</p>'
      + '<p class="restoNote">' + item.calculAverage() + '/5' + '<strong> ★</strong>' + ' (' + item.getRatings().length + ' avis)' + '</p>' + '</li>');
      
      //console.log(item.getRatings().length);

      // Catch de chaque item de liste
      let listItem = $('#zoneListe li:eq(' + i + ')');

      // ---- Comportement des marqueurs au survol d'un item de la liste ----
      let text = item.name;
      $(document).ready(function () {
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

      //---- Comportement d'un marqueur à son survol ----
      // $(document).ready(function event() {
      //   $('.marker').hover(function() {
      //     marker.onSurvol();
      //     },
      //     function() {
      //       marker.offSurvol();
      //     });
      // });

      // ---- Pop up fenêtre info lors du clic sur un item de la liste ----
      $('#zoneListe li:eq(' + i + ')').click(function () {
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
        $('#buttonClose').click(function () {
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
        $('#buttonAddAvis').click(function () {

          // -- Affichage du formulaire --
          $('#formAvis').slideDown(800);
          // Scroll auto en bas de la fenetre
          $('#infoResto').stop().animate({
            scrollTop: $('#infoResto')[0].scrollHeight
          }, 800);
          $('#formAvis').css('display', 'block');
          $('#buttonAddAvis').css('display', 'none');

          // Soumission du formulaire
          $('#formAvis').submit(function (e) {
            e.preventDefault();
            let noteEnter = document.forms["formAvis"]["note"].value;
            let commentEnter = document.forms["formAvis"]["commentaire"].value;
            
            alert('Votre commentaire a été envoyé !');
          
            // Envoi des infos dans la fonction d'ajout d'avis (méthode de la classe restaurant)
            item.addRating(Number(noteEnter), commentEnter);
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

            console.table(arrayRestaurants);

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