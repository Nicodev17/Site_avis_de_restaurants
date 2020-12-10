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
  let arrayRestaurants = [];

  // Requête pour obtenir tous les resto du fichier JSON
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        var response = JSON.parse(this.responseText);
        let restaurants = response;    
    
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

        // Pop up fenetre info
        $('#zoneListe li:eq(' + i + ')').click(function(){
          // Affichage
          $('#overlay').css('visibility', 'visible');
          // Injection des infos
          $('h3').html(restaurant.name);
          $('#photoResto').html('<img src="' + restaurant.photo + '"alt="photo du restaurant">');
          $('#adresseResto p').html('Adresse : ' + restaurant.address);
          $('#avisResto p:eq(' + i + ')').html(restaurant.getComments());
        });

      //   $("#b2").click(function(){
      //     $("h1").fadeIn(2000);
      // });

        // Fermeture fenetre info
        $('#closeBox').click(function(){
          $('#overlay').css('visibility', 'hidden');
        });
      
        //Création de la bulle infoWindow pour le marqueur
        // const popup = new google.maps.InfoWindow({
        //   content: item.restaurantName,
        //   maxWidth:300,
        //   maxHeight:100
        // });

        // marker.addListener("click", () => {
        //   console.log('test');
        //   //popup.open(mapClass.map, marker);
        // });

        // Création d'un objet contenant les méthodes d'instance
        const restaurant = new Restaurant(item.restaurantName, item.photo, item.address, item.lat, item.lon, item.ratings);
        arrayRestaurants.push(restaurant);
        
        // Affichage dans la liste
        listItem.html('<h4>' + restaurant.name + '</h4>' 
        + '<p class="restoAdress">' + restaurant.address + '</p>'
        + '<p class="restoNote">'  + restaurant.calculAverage() + '/5 ★ </p>').css('display', 'block');

      };
      console.table(arrayRestaurants);
    }
  }

request.open("GET","src/items.json");
request.send();

} // Fin fonction initResto