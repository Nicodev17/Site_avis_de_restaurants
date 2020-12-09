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
