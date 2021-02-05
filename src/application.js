/*----------------------------------------------------------------------
--------------|| Récupération des données et affichage ||---------------
----------------------------------------------------------------------*/
class Application {
  constructor(mapClass) {
    this.mapClass = mapClass;
    this.arrayRestaurants = [];
    this.filteredArray;
    this.arrayMarkers = [];
  }
  
  /*----------------------------------------------------------------------
  ---------|| Requête pour récupérer les restos (API Places) ||-----------
  ----------------------------------------------------------------------*/
  async getResto(mapCenter) {
    let mapClass = this.mapClass;
    // await mapClass.load(zoneMap);
    // await mapClass.geoloc();
    this.arrayRestaurants = [];

    let center = mapCenter;

    if (center == undefined) {
      center = mapClass.userPosition;
    } else {
      center = mapCenter;
    }
    // console.log(center);

    // ----- API Google Places -----
    let request = {
      location: center,
      radius: 1000,
      type: ['restaurant'],
    };
  
    let service = new google.maps.places.PlacesService(mapClass.map);
  
    function getPlaces(service) {
      return new Promise((res, rej) => {
        service.nearbySearch(request, (results, status) => {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            let place = results;
            // console.log(place);
            // console.log(place[0]);
            res(place);
          }
        });
      });
    }
  
    let places = await getPlaces(service);
  
    // Pour chaque item reçu => Création d'un objet restaurant contenant ses propres méthodes d'instance
    places.forEach((element, index) => {
      // Récupération de la photo du lieu
      let urlPhoto;
      let apiKey = 'AIzaSyAOC9ObG1y6HwJN-04mYSZy90W4nQOVs3k';
      let urlStreetView = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${element.geometry.location.lat()},${element.geometry.location.lng()}&fov=80&heading=70&pitch=0&key=${apiKey}`;
  
      if (element.photos == undefined) {
        urlPhoto = urlStreetView;
      } else {
        urlPhoto = element.photos[0].getUrl();
      }
  
      // ** Constructor : id, name, urlPhoto, address, lat, lon, placeId, ratings, ratingsTotal, average **
      const restaurant = new Restaurant(index, element.name, urlPhoto, element.vicinity, element.geometry.location.lat(), element.geometry.location.lng(), element.place_id, element.rating, element.user_ratings_total, element.rating);
      this.arrayRestaurants.push(restaurant);
    });
  
    // Tableau de base des restaurants (sortie de requete)
    console.log(this.arrayRestaurants);

    this.getingRatings();

    await this.initDisplayResto(this.arrayRestaurants);
  
  } // Fin fonction getResto

  /* ---- Lancement de la fonction de récupération d'avis de Places Details ---- */
  async getingRatings() {
    for (let i = 0; i < this.arrayRestaurants.length; i++) {
      let item = this.arrayRestaurants[i];
      await item.getRatings();
    }
  }

  /*----------------------------------------------------------------------
  ----|| Filtrage des restos selon leur moyenne et leur emplacement ||----
  ----------------------------------------------------------------------*/

  /* ----- Création du slider de filtrage des notes ---- */
  sliderInit() {
    $("#slider-range").slider({
      range: true,
      min: 0,
      max: 5,
      values: [0, 5],
      slide: function (event, ui) {
        $("#note").val("Note entre " + ui.values[0] + " & " + ui.values[1]);
      }
    });
    $("#note").val("Note entre " + $("#slider-range").slider("values", 0) +
      " & " + $("#slider-range").slider("values", 1));
  }; // Fin fonction sliderInit

  async moveMap() {
    let mapClass = this.mapClass;

   // Event du drag de la map
    mapClass.map.addListener("dragend", async () => {
      console.log('la map bouge !');

      let newCenterMap = {
        lat: mapClass.map.getCenter().lat(),
        lng: mapClass.map.getCenter().lng()
      }
      // console.log(newCenterMap);

      // Relancement de la fonction getResto avec le nouveau centre
      await this.getResto(newCenterMap);
    });
  }

  /* ---- Filtrage selon les notes et le déplacement de la map ---- */ 
 filter() {
    // Event du filtrage selon les notes
    $("#slider-range").on("slide", (event, ui) => {
      let value1 = ui.values[0];
      let value2 = ui.values[1];
      const filtreNote = this.arrayRestaurants.filter(element => element.average >= value1 && element.average <= value2);
      this.filteredArray = filtreNote;
      console.log(this.filteredArray);

      // maj de la liste
      $('#zoneListe ul').empty();

      // On relance la fonction initDisplayResto avec les resto filtrés
      this.initDisplayResto(this.filteredArray);
    });

  } // Fin fonction filter

  /*----------------------------------------------------------------------
  ---------------|| Affichage des restos (map et liste) ||----------------
  ----------------------------------------------------------------------*/
  async initDisplayResto(arrayResto) {
    let mapClass = this.mapClass;
    $('#zoneListe ul li').remove();
    
    // ---- Pour chaque objet restaurant ----
    for (let i = 0; i < arrayResto.length; i++) {
      let item = arrayResto[i];
      
      // Efface les marqueurs précèdents sauf celui de l'user
      $('.marker').filter(":not(#marker-200)").remove();
      
      // ---- Création des marqueurs ----
      let idMarker = i;
      let marker = mapClass.addMarker(idMarker, item.position.lat, item.position.lon, 'media/icon_marker.png');
      this.arrayMarkers.push(marker);

      // Adaptation de la map
      // mapClass.centerMap();

      // ---- Affichage dans la liste de droite ----
      item.displayRestoList();

      // Catch de chaque item de liste présents
      let listItem = $('#zoneListe li:eq(' + i + ')');

      // Appel de la fonction du comportement des marqueurs au survol d'un item de la liste
      item.markerEventHover(item, marker, listItem);

      // ---- Comportement d'un marqueur au clic direct ----
      marker.onClick(() => {
        // On relance les fonctions du pop up
        this.displayInfoPop(item);
        this.addingRate(item, i);
      });

      // ---- Comportement d'un marqueur à son survol direct sur la map ----
      marker.onOffSurvol(item.name);

      // ---- POP UP FENETRE INFOS ----
      listItem.click(() => {
        // Appel de la fonction de gestion du popup
        this.displayInfoPop(item);

        // Appel de la fonction d'ajout d'avis
        this.addingRate(item, i);
      });

    } // Fin boucle for

  } // Fin fonction initDisplayResto

  /*----------------------------------------------------------------------
  -------------------|| Fonction de gestion du pop up ||------------------
  ----------------------------------------------------------------------*/
  displayInfoPop(item) {
    // Apparition du popup
    $('#overlay').css('display', 'flex');
    $('#overlayBack').css('display', 'flex');

    // Affichage des infos dans le popup
    $('h3').html(item.name);
    $('#photoResto').html('<img src="' + item.urlPhoto + '"alt="photo du restaurant">');
    $('#adresseResto p').html(item.address);
    $('#noteMoyenne p').html('Note moyenne :  ' + item.average + ' / 5 <strong> ★</strong>');
    $('#titleAvis').html('Derniers avis sur ce restaurant (' + item.ratingsTotal + ' au total) :');

    // Récupération des avis
    item.ratings.forEach(element => {
      let comment = element.text

      if (element.text === "") {
        comment = " Aucun";
      } else {
        comment = element.text;
      }

      $('#titleAvis').after('<div class="ratingItem"> <p> Note : ' + element.rating + '/5' + '<i id="dots"> </i> </p>'
        + '<p>' + 'Commentaire : ' + comment + '</p> <hr id="separateCom"> </div>');
    });

    // Fermeture du popup
    $('#buttonClose , #overlayBack').click(() => {

      $('#overlay').css('display', 'none');
      $('#overlayBack').css('display', 'none');
      $('.ratingItem').remove();
      $('#formAvis').css('display', 'none');

      // Réinitialisation du bouton d'ajout de com
      $('#buttonAddAvis').css('display', 'block');
      // Réinitialisation du formulaire
      $('#formulaire').get(0).reset();
      $('#overlayBack').off();
      $('#buttonClose').off();
      $('#buttonAddAvis').off();
      $('#formAvis').off();
    });

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
        let noteEnter = Number(document.forms["formAvis"]["note"].value);
        let commentEnter = document.forms["formAvis"]["commentaire"].value;

        alert('Votre commentaire a été envoyé !');

        // Envoi des infos dans la fonction d'ajout d'avis (méthode de la classe restaurant)
        item.addRating(noteEnter, commentEnter);

        //console.table(this.arrayRestaurants);

        // Rafraichissement de l'affichage
        let totalReviews = item.ratingsTotal += 1;
        $('.ratingItem').remove();
        $('#dots').addClass('fa fa-ellipsis-v');
        // Maj du nb d'avis et de la note dans la liste de droite
        $('.restoNote:eq(' + incrementNumber + ')').html(item.recalculAverage(noteEnter) + '/5 <strong> ★</strong>' + ' (' + totalReviews + ' avis)');
        this.displayInfoPop(item);

        // Disparition du formulaire
        $('#formAvis').slideUp(600);
        // Réaffichage du bouton d'ajout
        $('#buttonAddAvis').css('display', 'block');
        // Réinitialisation du formulaire
        $('#formulaire').get(0).reset();
        $('#formAvis').off();

        // Suppression de com (NON FONCTIONNELLE)
        // $('#dots').click(function () {
        //   let dotsClicked = true;
        //   $('#bulleSuppr').css('display', 'flex');

        //   $('#dots').append('<div id="bulleSuppr"> <button id="buttonSuppr"> Supprimer ce commentaire </button> </div>');
        //   $('#buttonSuppr').click(function () {
        //     console.log('suppression du com');
        //   })

        //   if (dotsClicked == true) {
        //     $('#dots').click(function () {
        //       console.log('TEST');
        //       $('#bulleSuppr').css('display', 'none');
        //     });
        //     $('#dots').off();
        //     dotsClicked = false;
        //   }
        // });
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

    mapClass.map.addListener("rightclick", async (e) => {
      let latClick = e.latLng.lat();
      let longClick = e.latLng.lng();

      // Prend le nombre de restos existants pour faire suivre l'id du new resto
      let growId = this.arrayRestaurants.length;

      // Requete pour obtenir l'adresse à partir de la position
      const adressRequest = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latClick},${longClick}&key=AIzaSyAOC9ObG1y6HwJN-04mYSZy90W4nQOVs3k`)
        .then(resultat => resultat.json())
        .then(json => json)
      const newRestoAdress = adressRequest.results[0].formatted_address;

      // -- Formulaire (à améliorer)
      const newRestoName = prompt('Entrez le nom du restaurant que vous souhaitez ajouter', "Nom du restaurant");
      let newRestoNote = Number(prompt('Entrez la note que vous souhaitez attribuer (0 à 5)', "Votre note"));
      while (newRestoNote < 0 || newRestoNote > 5 || isNaN(newRestoNote) === true) {
        alert('Note invalide ! Votre note doit se situer entre 0 et 5.');
        newRestoNote = Number(prompt('Entrez la note que vous souhaitez attribuer (0 à 5)', "Votre note"));
      };
      const newRestoComment = prompt('Entrez le commentaire que vous souhaitez laisser sur ce restaurant', "Votre commentaire");
      // -- fin formulaire

      let apiKey = 'AIzaSyAOC9ObG1y6HwJN-04mYSZy90W4nQOVs3k';
      let urlStreetView = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${latClick},${longClick}&fov=80&heading=70&pitch=0&key=${apiKey}`;

      // Création du nouvel objet restaurant
      const restoAdded = new Restaurant(growId, newRestoName, urlStreetView, newRestoAdress, latClick, longClick, null, [{ rating: newRestoNote, text: String(newRestoComment) }], 1, newRestoNote);
      console.log(restoAdded);

      // Ajout au tableau des restaurants
      this.arrayRestaurants.push(restoAdded);
      // console.log(this.arrayRestaurants);

      // Création du marqueur
      let marker = mapClass.addMarker(growId, latClick, longClick, 'media/icon_marker_added.png');
      this.arrayMarkers.push(marker);
      // console.log(this.arrayMarkers);

      // Ajout dans la liste
      restoAdded.displayRestoList();

      // Scroll auto en bas de la liste
      $('#zoneListe ul')[0].scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

      // On relance les fonctions du comportement des marqueurs au survol et au clic
      let listItem = $('#zoneListe li:last-child');
      restoAdded.markerEventHover(restoAdded, marker, listItem);
      marker.onOffSurvol(restoAdded.name);
      marker.onClick(() => {
        console.log(restoAdded.name);
        // On relance les fonctions du pop up
        this.displayInfoPop(restoAdded);
        this.addingRate(restoAdded, growId);
      });

      // Au clic sur le nouvel item de liste
      listItem.click(() => {
        // Lancement fonction du pop up
        this.displayInfoPop(restoAdded);
        // Fonction d'ajout d'avis
        this.addingRate(restoAdded, growId);
      });

    });

  } // Fin fonction addResto

} // Fin classe Application