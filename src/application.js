/*----------------------------------------------------------------------
--------------|| Récupération des données et affichage ||---------------
----------------------------------------------------------------------*/
class Application {
  constructor() {
    this.mapClass = new GoogleMap();
    this.arrayRestaurants;
    this.filteredArray;
    this.arrayMarkers = [];
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

    // Tableau contenant tous les objets restaurant
    console.table(arrayResto);

    // ---- Pour chaque objet restaurant ----
    for (let i = 0; i < arrayResto.length; i++) {
      let item = arrayResto[i];

      // ---- Création d'un marqueur perso ----
      let idMarker = i;
      let marker = mapClass.addMarker(idMarker, item.position.lat, item.position.lon, 'media/icon_marker.png');
      this.arrayMarkers.push(marker);

      // Marqueurs de base (en arrière plan)
      // let markerBack = new google.maps.Marker({
      //   position: {lat: item.position.lat, lng: item.position.lon },
      //   map: this.mapClass.map,
      //   opacity: 0,
      // });

      // ---- Affichage dans la liste de droite ----
      item.displayRestoList(item);

      // Catch de chaque item de liste présents
      let listItem = $('#zoneListe li:eq(' + i + ')');

      // Appel de la fonction du comportement des marqueurs au survol d'un item de la liste
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

      // ******************************** REFACTORING : CHECK ********************************

      // ---- POP UP FENETRE INFOS ----
      listItem.click(() => {
        // Appel de la fonction de gestion du popup
        this.displayInfoPop(item);

        // Appel de la fonction d'ajout d'avis
        let incrementNumber = i;
        this.addingRate(item, incrementNumber);
      });

    } // Fin boucle for

  } // Fin fonction initResto

/*----------------------------------------------------------------------
-------------------|| Fonction de gestion du pop up ||------------------
----------------------------------------------------------------------*/
displayInfoPop(item) {
  // Apparition du popup
  $('#overlay').css('display', 'flex');
  let isPopup = true;

  // Affichage des infos dans le popup
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

  // Fermeture du popup
  $('#buttonClose').click(() => {
    isPopup = false;

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

  // Fermeture de la fenetre lors du clic à l'extérieur (bug)
  // if(isPopup === true) {
  //   console.log('la fenetre pop up s\'ouvre');

  //   $(document).click((event) => { 
  //     if(!$(event.target).closest('#infoResto').length) {
  //       //$('#overlay').css('display', 'none');
  //       console.log('clic en dehors de la fenetre');
  //     } 
  //   });
  // }

} // Fin fonction DisplayInfoPop

/*----------------------------------------------------------------------
----------------------|| Fonction d'ajout d'avis ||---------------------
----------------------------------------------------------------------*/
addingRate(item, incrementNumber) {

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
      this.displayInfoPop(item);
      $('#dots').addClass('fa fa-ellipsis-v');
      // Maj du nb d'avis et de la note dans la liste de droite
      $('.restoNote:eq(' + incrementNumber + ')').html(item.calculAverage() + '/5' + '<strong> ★</strong>' + ' (' + item.getRatings().length + ' avis)');
      

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

} // Fin fonction addingRate

/*----------------------------------------------------------------------
-------------------|| Fonction d'ajout de restaurants ||----------------
----------------------------------------------------------------------*/
async addResto() {
  let mapClass = this.mapClass;

  // Prend le nombre de restos existants pour faire suivre l'id du new resto
  let growId = this.arrayRestaurants.length;

  //console.log(this.arrayMarkers);
  
  mapClass.map.addListener("rightclick", async (e) => {
    let latClick = e.latLng.lat();
    let longClick = e.latLng.lng();
    growId++;

    // Requete pour obtenir l'adresse à partir de la position
    const adressRequest = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latClick},${longClick}&key=AIzaSyAOC9ObG1y6HwJN-04mYSZy90W4nQOVs3k`)
        .then(resultat => resultat.json())
        .then(json => json)
    const newRestoAdress = adressRequest.results[0].formatted_address;

    // Formulaire
    const newRestoName = prompt('Entrez le nom du restaurant que vous souhaitez ajouter', "Nom du restaurant");

    let newRestoNote = Number(prompt('Entrez la note que vous souhaitez attribuer (0 à 5)', "Votre note"));
    while (newRestoNote < 0 || newRestoNote > 5 || isNaN(newRestoNote) === true ) {
      alert('Note invalide ! Votre note doit se situer entre 0 et 5.');
      newRestoNote = Number(prompt('Entrez la note que vous souhaitez attribuer (0 à 5)', "Votre note"));
    };

    const newRestoComment = prompt('Entrez le commentaire que vous souhaitez laisser sur ce restaurant', "Votre commentaire");

    // Création du nouvel objet restaurant
    const restoAdded = new Restaurant(growId, newRestoName, newRestoAdress, latClick, longClick, [{stars: newRestoNote, comment: String(newRestoComment)}] );
    console.log(restoAdded);

    // Ajout au tableau des restaurants
    this.arrayRestaurants.push(restoAdded);
    console.log(this.arrayRestaurants);

    // Création du marqueur
    let marker = mapClass.addMarker(500, latClick, longClick, 'media/icon_marker_added.png');

    // Ajout dans la liste
    restoAdded.displayRestoList(restoAdded);

    // Scroll auto en bas de la liste
    $('#zoneListe ul')[0].scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});

    // On relance la fonction du comportement des marqueurs au survol
    let listItem = $('#zoneListe li:last-child');
    restoAdded.markerEvent(restoAdded, marker, listItem);

    // Centrage de la map sur le nouveau marqueur (?)
    // this.map.panTo(e.latLng);

    // Au clic sur le nouvel item de liste
    listItem.click(() => {
      //isPopup = true;

      // Fonction du pop up
      this.displayInfoPop(restoAdded);
      // Fonction d'ajout d'avis
      this.addingRate(restoAdded, growId);
      // Maj du nb d'avis et de la note dans la liste de droite
      $('#zoneListe li:nth-child(' + growId + ') .restoNote').html(restoAdded.calculAverage() + '/5' + '<strong> ★</strong>' + ' (' + restoAdded.getRatings().length + ' avis)');
    });
    
  });

} // Fin fonction addResto

} // Fin classe Application