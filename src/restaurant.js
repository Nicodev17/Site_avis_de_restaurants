class Restaurant {
    constructor(id, name, urlPhoto, address, lat, lon, placeId, ratings) {
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
    }

    // ---- Méthode pour calculer la moyenne des notes de tous les avis d'un resto ----
    // calculAverage(){
    //     let total = 0;

    //     if(this.ratings.length === 0) {
    //         return " - ";
    //     } else {
    //         this.ratings.forEach(element => {
    //             total += element.stars;
    //         });
    //         let result = total / this.ratings.length;
    //         result = Math.round(result * 10) / 10;
    //         return result;
    //     }
    // }

    // ---- Méthode pour récupérer les avis ----
    async getRatings(){
        // Retourne un tableau avec tous les avis de chaque resto
        // let avis = this.ratings;
        // return avis;

        let apiKey = 'AIzaSyAOC9ObG1y6HwJN-04mYSZy90W4nQOVs3k';

        const requestDetails = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${this.placeId}&fields=name,rating,review,user_ratings_total&key=${apiKey}`)
        .then(resultat => resultat.json())
        .then(json => json)
      
        const result = requestDetails;

        console.log(result);
    }  

    // ---- Méthode pour récupérer la photo StreetView du resto (plus utile pour l'instant) ----
    // getPhoto(url){
    //     // let lat = this.position.lat;
    //     // let lon = this.position.lon;
    //     // let apiKey = 'AIzaSyAOC9ObG1y6HwJN-04mYSZy90W4nQOVs3k';
    //     // let url = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lon}&fov=80&heading=70&pitch=0&key=${apiKey}`;
    //     // return url
    // }
    
    // ---- Méthode pour ajouter un avis (note + com) ----
    addRating(stars, comment){
        let rating = {
            stars: stars,
            comment: comment,
          };
        
        this.ratings.push(rating);
        //console.log(this.ratings);
    }

    // ---- Méthode pour afficher les restaurants dans la liste de droite ----
    displayRestoList() {
        $('#zoneListe ul').append('<li class="listItem">' + '<div class="contentItem">' + '<h4>' + this.name + '</h4>'
        + '<p class="restoAdress">' + this.address + '</p>'
        + '<p class="restoNote">' + /* this.calculAverage() */ + '/5' + '<strong> ★</strong>' + ' (' + /*this.getRatings().length*/ + ' avis)' + '</p>' + '</div>'
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