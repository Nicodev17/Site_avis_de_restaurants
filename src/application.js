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
        $( "#note" ).val( "Note entre " + ui.values[0] + " ★ et " + ui.values[1] + " ★" );
      }
    });
    $( "#note" ).val( "Note entre " + $( "#slider-range" ).slider( "values", 0 ) +
      " ★ et " + $( "#slider-range" ).slider( "values", 1 ) + " ★" );
 
  } );

/*----------------------------------------------------------------------
--------------|| Récupération et affichage des resto ||-----------------
----------------------------------------------------------------------*/

async function initResto() {
  let mapClass = new GoogleMap();
  await mapClass.load(zoneMap);
  await mapClass.geoloc();
  //let marker = null;

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
        let listItem = $('.zoneListe li:eq(' + i + ')');

        // Création d'un marqueur
        let marker = mapClass.addMarker(item.lat, item.lon, 'media/icon_marker.png');

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

        // Création d'un objet contenant les méthodes d'instance
        const restaurant = new Restaurant(item.restaurantName, "media/favicon_burger.png", item.address, item.lat, item.lon, item.ratings);
        console.log(restaurant);
        
        // Affichage dans la liste
        listItem.html('<h4>' + item.restaurantName + '</h4>' 
        + '<p class="restoAdress"> Adresse : ' + item.address + '</p>'
        + '<p class="restoNote"> Note : '  + item.ratings[0].stars + '/5 </p>'
        + '<p class="restoComment"> Commentaire : '  + item.ratings[0].comment + '</p>');
      };


    }
  }
request.open("GET","src/items.json");
request.send();



} // Fin fonction initResto