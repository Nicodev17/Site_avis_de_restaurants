// Filtrer les restaurants à afficher en fonction de leur note
// Ajouter des restaurants en cliquant sur la carte
// Mettre à jour les restaurants à afficher sur la carte et la liste quand on se déplace dessus


/* ----- Sélection de la note pour l'affichage ---- */ 
$(function() {
    $("#slider-range").slider({
      range: true,
      min: 1,
      max: 5,
      values: [ 1, 5 ],
      slide: function( event, ui ) {
        $( "#note" ).val( "Note entre " + ui.values[0] + " et " + ui.values[1] + " ★" );
      }
    });
    $( "#note" ).val( "Note entre " + $( "#slider-range" ).slider( "values", 0 ) +
      " et " + $( "#slider-range" ).slider( "values", 1 ) + " ★" );
 
  } );

/*----------------------------------------------------------------------
--------------|| Récupération et affichage des resto ||-----------------
----------------------------------------------------------------------*/

async function initResto() {
  let mapClass = new GoogleMap();
  await mapClass.load(zoneMap);
  await mapClass.geoloc();
  let currentPopup = null;


  // Requête pour obtenir tous les resto du fichier JSON
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        var response = JSON.parse(this.responseText);
        let restaurants = response;
        console.table(restaurants);    
    
      // Pour chaque resto
      for(let i=0 ; i < restaurants.length ; i++) {
        let item = restaurants[i];
        let listItem = $('#zoneListe li:eq(' + i + ')');

        // Création d'un marqueur
        let marker = mapClass.addMarker(item.lat, item.lon, 'media/icon_marker.png');

        // Evenement du comportement des marqueurs au survol d'un item
        $(document).ready(function event() {
          listItem.hover(
              function() {
                marker.activated();
              },
              function(){
                marker.desactivated();
              }
          );
        });

        $(document).ready(function event() {
          listItem.click(
              function() {
                listItem.css('display', 'block');
              },
          );
        });

        // Création de la bulle infoWindow pour le marqueur
        // const popup = new google.maps.InfoWindow({
        //   content: item.restaurantName,
        //   maxWidth:300,
        //   maxHeight:100
        // });

        // marker.addListener("click", () => {
        //   console.log('test');
        //   //popup.open(mapClass.map, marker);
        // });

        // google.maps.event.addListener(marker, "click", function() {
        //   console.log('test');
        //   // On ouvre la bulle correspondant à notre marqueur
        //   popup.open(mapClass.map, marker);
        //   // On enregistre cette bulle dans la variable currentPopup
        //   currentPopup = popup;
        //   // Si une bulle est déjà ouverte
        //   if (currentPopup != null) {
        //     // On la ferme
        //     currentPopup.close();
        //     // On vide la variable
        //     currentPopup = null;
        //   }
        // });
        // Nous activons l'écouteur d'évènement "closeclick" sur notre bulle
        // pour surveiller le clic sur le bouton de fermeture
        // google.maps.event.addListener(popup, "closeclick", function() {
        //   // On vide la variable
        //   currentPopup = null;
        // });

        // Création d'un objet contenant les méthodes d'instance
        const restaurant = new Restaurant(item.restaurantName, "media/favicon_burger.png", item.address, item.lat, item.lon, item.ratings);
        console.log(restaurant);
        
        // Affichage dans la liste
        listItem.html('<h4>' + item.restaurantName + '</h4>' 
        + '<p class="restoAdress">' + item.address + '</p>'
        + '<p class="restoNote">'  + item.ratings[0].stars + '/5 ★ </p>').css('display', 'block');
      };


    }
  }
request.open("GET","src/items.json");
request.send();

} // Fin fonction initResto