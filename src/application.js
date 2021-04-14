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
  getResto(mapCenter) {
    let mapClass = this.mapClass;
    let center = mapCenter;

    // Switch centre de la map si drag ou non
    if (center == undefined) {
      center = mapClass.userPosition;
    } else {
      center = mapCenter;
    }

    // ----- API Google Places -----
    let request = {
      location: center,
      radius: 1000,
      type: ['restaurant'],
    };
  
    let service = new google.maps.places.PlacesService(mapClass.map);

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        // Lancement fonction création des objets
        this.initResto(results);
      }
    });
  } // Fin fonction getResto

  /*----------------------------------------------------------------------
  -----------|| Fonction initialisant les objets Restaurant ||------------
  ----------------------------------------------------------------------*/
  initResto(places) {
    let mapClass = this.mapClass;
    this.arrayRestaurants = [];
    
    // Création d'un objet restaurant pour chaque item reçu de la requete
    places.forEach((element, index) => {

      // Récupération de la photo
      let urlPhoto;
      let apiKey = 'AIzaSyAhbKHFVYqCju57U2B3xIeiSnDoc05n7A4';
      let urlStreetView = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${element.geometry.location.lat()},${element.geometry.location.lng()}&fov=80&heading=70&pitch=0&key=${apiKey}`;
      
      // Si aucune photo = utilisation de la photo streetview
      if (element.photos == undefined) {
        urlPhoto = urlStreetView;
      } else {
        urlPhoto = element.photos[0].getUrl();
      }
      
      // ** Constructor : id, name, urlPhoto, address, lat, lon, placeId, ratings, ratingsTotal, average **
      const restaurant = new Restaurant(index, element.name, urlPhoto, element.vicinity, element.geometry.location.lat(), element.geometry.location.lng(), element.place_id, element.ratings, element.user_ratings_total, element.rating);
      this.arrayRestaurants.push(restaurant);
    });

    // Tableau de base des objets Restaurant
    // console.log(this.arrayRestaurants);

    // Récupération des avis pour chaque objet resto
    for (let i = 0; i < this.arrayRestaurants.length; i++) {
      let item = this.arrayRestaurants[i];
      item.getDetails(mapClass);
    }

    this.initDisplayResto(this.arrayRestaurants);
  
  } // Fin fonction getResto

  /*----------------------------------------------------------------------
  ----|| Filtrage des restos selon leur moyenne et leur emplacement ||----
  ----------------------------------------------------------------------*/

  /* ----- Création du slider de filtrage ---- */
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

  /* ---- Déplacement du centre de la map au drag ---- */ 
  async moveMap() {
    let mapClass = this.mapClass;

   // Event drag
    mapClass.map.addListener("dragend", async () => {

      let newCenterMap = {
        lat: mapClass.map.getCenter().lat(),
        lng: mapClass.map.getCenter().lng()
      }

      // Relancement de getResto() avec le nouveau centre
      await this.getResto(newCenterMap);
    });
  } // Fin fonction moveMap

  /* ---- Filtrage selon les notes ---- */ 
  filter() {
    $("#slider-range").on("slide", (event, ui) => {
      let value1 = ui.values[0];
      let value2 = ui.values[1];
      const filtreNote = this.arrayRestaurants.filter(element => element.average >= value1 && element.average <= value2);
      this.filteredArray = filtreNote;
      console.log(this.filteredArray);

      // maj de la liste
      $('#zoneListe ul').empty();

      this.initDisplayResto(this.filteredArray);
    });
  } // Fin fonction filter

  /*----------------------------------------------------------------------
  ---------------|| Affichage des restos (map et liste) ||----------------
  ----------------------------------------------------------------------*/
  initDisplayResto(arrayResto) {
    let mapClass = this.mapClass;
    $('#zoneListe ul li').remove();
    
    // ---- Pour chaque objet restaurant ----
    for (let i = 0; i < arrayResto.length; i++) {
      let item = arrayResto[i];
      
      // Efface les marqueurs précèdents sauf celui de l'user
      $('.marker').filter(":not(#marker-200)").remove();
      
      // ---- Création des nouveaux marqueurs ----
      let idMarker = i;
      let marker = mapClass.addMarker(idMarker, item.position.lat, item.position.lon, 'media/icon_marker.png');
      this.arrayMarkers.push(marker);

      // Adaptation de la map
      // mapClass.centerMap();

      // -- Affichage dans la liste de droite
      item.displayRestoList();

      // Catch individuel de chaque item de liste
      let listItem = $('#zoneListe li:eq(' + i + ')');

      // -- Marqueur au survol d'un item de liste
      item.markerEventHover(item, marker, listItem);

      // -- Marqueur à son survol direct sur la map
      marker.onOffSurvol(item.name);

      // -- Apparition POP UP au clic sur un marqueur
      marker.onClick(() => {
        this.displayInfoPop(item);
        this.addingRate(item, i);
      });

      // -- Apparition POP UP au clic sur un item de liste
      listItem.click(() => {
        this.displayInfoPop(item);
        this.addingRate(item, i);
      })
    }
  } // Fin fonction initDisplayResto

  /*----------------------------------------------------------------------
  -------------------|| Fonction de gestion du pop up ||------------------
  ----------------------------------------------------------------------*/
  async displayInfoPop(item) {     
    // Apparition du popup
    $('#overlay').css('display', 'flex');
    $('#overlayBack').css('display', 'flex');
    
    // Affichage des infos dans le popup
    $('h3').html(item.name);
    $('#photoResto').html('<img src="' + item.urlPhoto + '"alt="photo du restaurant">');
    $('#adresseResto p').html(item.address);
    $('#noteMoyenne p').html('Note moyenne :  ' + item.average + ' / 5 <strong> ★</strong>');
    $('#titleAvis').html('Derniers avis sur ce restaurant (' + item.ratingsTotal + ' au total) :');

    // Affichage des avis
    if(item.ratings === undefined) {
      // cas du bug details
      await item.getDetails(this.mapClass);
      this.displayRatings(item);
    } else {
      this.displayRatings(item);
    }

    // Ligne de contact
    if(item.website == null) {
      $('#infoContact p').html(item.phone);
    } else if (item.website == null && item.phone == null) {
      $('#infoContact').remove();
    } else {
      $('#infoContact p').html('<a href="'+ item.website +'"> Voir le site web </a> <strong> ~ </strong>' + item.phone);
    }

    // Fermeture du popup
    $('#buttonClose , #overlayBack').click(() => {

      // Réinitialisation du scroll
      $('#infoResto').scrollTop(0);
      $('#overlay').css('display', 'none');
      $('#overlayBack').css('display', 'none');
      $('.ratingItem').remove();
      $('#infoContact p').html("");
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

  // ---- Fonction affichage des avis (annexe de DisplayInfoPop) ----
  displayRatings(item) {
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
  }

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

        // Envoi des infos dans la fonction d'ajout d'avis
        item.addRating(noteEnter, commentEnter);

        // Rafraichissement de l'affichage
        let totalReviews = item.ratingsTotal += 1;
        $('.ratingItem').remove();
        // $('#dots').addClass('fa fa-ellipsis-v');
        // Maj du nb d'avis et de la note dans la liste
        $('.restoNote:eq(' + incrementNumber + ')').html(item.recalculAverage(noteEnter) + '/5 <strong> ★</strong>' + ' (' + totalReviews + ' avis)');
        this.displayInfoPop(item);

        // Disparition du formulaire
        $('#formAvis').slideUp(600);
        // Réaffichage du bouton d'ajout
        $('#buttonAddAvis').css('display', 'block');
        // Réinitialisation du formulaire
        $('#formulaire').get(0).reset();
        $('#formAvis').off();
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
      let apiKey = 'AIzaSyAhbKHFVYqCju57U2B3xIeiSnDoc05n7A4';

      // id du new resto suivant ceux existants
      let growId = this.arrayRestaurants.length;

      // Obtention de l'adresse à partir de la position du clic
      const adressRequest = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latClick},${longClick}&key=${apiKey}`)
        .then(resultat => resultat.json())
        .then(json => json)
      const newRestoAdress = adressRequest.results[0].formatted_address;

      // -- Formulaire d'ajout de resto
      const newRestoName = prompt('Entrez le nom du restaurant que vous souhaitez ajouter', "Nom du restaurant");
      let newRestoNote = Number(prompt('Entrez la note que vous souhaitez attribuer (0 à 5)', "Votre note"));
      while (newRestoNote < 0 || newRestoNote > 5 || isNaN(newRestoNote) === true) {
        alert('Note invalide ! Votre note doit se situer entre 0 et 5.');
        newRestoNote = Number(prompt('Entrez la note que vous souhaitez attribuer (0 à 5)', "Votre note"));
      };
      const newRestoComment = prompt('Entrez le commentaire que vous souhaitez laisser sur ce restaurant', "Votre commentaire");
      // -- Fin formulaire

      let urlStreetView = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${latClick},${longClick}&fov=80&heading=70&pitch=0&key=${apiKey}`;

      // Création du nouvel objet restaurant
      const restoAdded = new Restaurant(growId, newRestoName, urlStreetView, newRestoAdress, latClick, longClick, null, [{ rating: newRestoNote, text: String(newRestoComment) }], 1, newRestoNote);
      
      // Ajout au tableau des restaurants
      this.arrayRestaurants.push(restoAdded);

      // Création du nouveau marqueur
      let marker = mapClass.addMarker(growId, latClick, longClick, 'media/icon_marker_added.png');
      this.arrayMarkers.push(marker);

      // Ajout dans la liste
      restoAdded.displayRestoList();

      // Scroll auto en bas de la liste
      $('#zoneListe ul')[0].scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

      // Comportement des marqueurs au survol et au clic
      let listItem = $('#zoneListe li:last-child');
      marker.onOffSurvol(restoAdded.name);
      marker.onClick(() => {
        this.displayInfoPop(restoAdded);
        this.addingRate(restoAdded, growId);
      });

      // Au survol du nouvel item de liste
      restoAdded.markerEventHover(restoAdded, marker, listItem);

      // Au clic sur le nouvel item de liste
      listItem.click(() => {
        this.displayInfoPop(restoAdded);
        this.addingRate(restoAdded, growId);
      });

    });

  } // Fin fonction addResto

} // Fin classe Application