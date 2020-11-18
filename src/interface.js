/* ----- Sélection de la note pour l'affichage ---- */ 
$(function() {
    $("#slider-range").slider({
      range: true,
      min: 1,
      max: 5,
      values: [ 1, 5 ],
      slide: function( event, ui ) {
        $( "#note" ).val( "De " + ui.values[0] + " ★ à " + ui.values[1] + " ★" );
      }
    });
    $( "#note" ).val( "De " + $( "#slider-range" ).slider( "values", 0 ) +
      " ★ à " + $( "#slider-range" ).slider( "values", 1 ) + " ★" );
 
  } );
