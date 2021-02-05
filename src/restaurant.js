class Restaurant {
  constructor(id, name, urlPhoto, address, lat, lon, placeId, ratings, ratingsTotal, average) {
      this.id = id;
      this.name = name;
      this.urlPhoto = urlPhoto;
      this.address = address;
      this.position = {
          lat,
          lon
      };
      this.placeId = placeId;
      this.ratings = ratings;
      this.ratingsTotal = ratingsTotal;
      this.average = average;
  }

  // ---- Méthode pour calculer la moyenne des notes de tous les avis d'un resto ----
  recalculAverage(noteAdded){
      let moyenne = this.average;
      let result = ((moyenne * (this.ratingsTotal -1)) + noteAdded) / this.ratingsTotal;
      result = Math.round(result * 10) / 10;
      this.average = result;
      return result;
  }

  // ---- Méthode pour récupérer les avis ----
  async getRatings() {

      let apiKey = 'AIzaSyAOC9ObG1y6HwJN-04mYSZy90W4nQOVs3k';

      const requestDetails = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${this.placeId}&fields=name,rating,review,user_ratings_total&key=${apiKey}`)
      .then(resultat => resultat.json())
      .then(json => json)

      const response = requestDetails.result;
      //console.log(response);

      const reviews = requestDetails.result.reviews;
      // console.log(reviews);

      const ratingsTotal = response.user_ratings_total;

      const average = response.rating;

      if(reviews === undefined) {
        this.ratings = [];
        this.ratingsTotal = 0;
        this.average = 0;
      } else {
        this.ratings = reviews;
        this.ratingsTotal = ratingsTotal;
        this.average = average;
      }
  }
  
  // ---- Méthode pour ajouter un avis (note + com) ----
  addRating(rating, text){
      let newReview = {
          rating: rating,
          text: text,
        };
      
      this.ratings.push(newReview);
  }

  // ---- Méthode pour afficher les restaurants dans la liste de droite ----
  displayRestoList() {
    /* Si le resto n'a aucun avis */
    if(this.average == undefined){
      this.ratings = [];
      this.ratingsTotal = "Aucun";
      this.average = " - ";
    } else {
      this.ratingsTotal = this.ratingsTotal;
      this.average = this.average;
    }

    $('#zoneListe ul').append('<li class="listItem">' + '<div class="contentItem">' + '<h4>' + this.name + '</h4>'
    + '<p class="restoAdress">' + this.address + '</p>'
    + '<p class="restoNote">' + this.average + '/5 <strong> ★</strong>' + ' (' + this.ratingsTotal + ' avis)' + '</p>' + '</div>'
    + '<div class="photoBox">' + '<img src="' + this.urlPhoto + '" class="photoList">' + '</div>' + '</li>');
  }

  // ---- Méthode du comportement des marqueurs au survol d'un item de liste ----
  // ** item : restaurant du tableau arrayResto / marker : le marker correspondant / listItem : item de la liste **
  markerEventHover(item, marker, listItem) {
    let text = item.name;
    $(document).ready(function () {
      listItem.hover(
        function () {
          marker.activated(text);
        },
        function () {
          marker.desactivated();
        }
      );
    });    
  };

} // Fin classe Restaurant