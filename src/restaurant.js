class Restaurant {
    constructor(id, name, address, lat, lon, ratings) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.position = {
            lat,
            lon
        };
        this.ratings = ratings;
    }

    // Méthode pour calculer la moyenne des notes de tous les avis d'un resto
    calculAverage(){
        let total = 0;

        if(this.ratings.length === 0) {
            return " - ";
        }

        this.ratings.forEach(element => {
            total += element.stars;
        });
        let result = total / this.ratings.length;
        result = Math.round(result * 10) / 10;
        return result;
    }

    // Méthode pour récupérer les commentaires
    getRatings(){
        // Retourne un tableau avec tous les avis de chaque resto
        let avis = this.ratings;
        return avis;
    }    

    // Méthode pour récupérer la photo StreetView du resto
    getPhoto(){
        let lat = this.position.lat;
        let lon = this.position.lon;
        let apiKey = 'AIzaSyAOC9ObG1y6HwJN-04mYSZy90W4nQOVs3k';
        let url = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lon}&fov=80&heading=70&pitch=0&key=${apiKey}`;
        return url
    }
    
    
    // Méthode pour ajouter un avis (note + com)
    addRating(stars, comment){

        let rating = {
            stars: stars,
            comment: comment,
          };
        
        this.ratings.push(rating);

        console.log(this.ratings);
    }

    // Méthode pour afficher les restaurants dans la liste de droite
    displayRestoList(item) {
        let restaurant = item;
        
        $('#zoneListe ul').append('<li class="listItem">' + '<div class="contentItem">' + '<h4>' + restaurant.name + '</h4>'
        + '<p class="restoAdress">' + restaurant.address + '</p>'
        + '<p class="restoNote">' + restaurant.calculAverage() + '/5' + '<strong> ★</strong>' + ' (' + restaurant.getRatings().length + ' avis)' + '</p>' + '</div>'
        + '<div class="photoBox">' + '<img src="' + restaurant.getPhoto() + '" class="photoList">' + '</div>' + '</li>');
      }

      // Comportement des marqueurs au survol d'un item de la liste
      // ** item : restaurant du tableau arrayResto / marker : le marker correspondant / listItem : item de la liste **

      markerEvent(item, marker, listItem) {
        let text = item.name;
        $(document).ready(function () {
          listItem.hover(
            function () {
              marker.activated();
              $('.marker.is-active').append("<p id='infoBulle'>" + text + "</p>");
            },
            function () {
              $('#infoBulle').remove();
              marker.desactivated();
            }
          );
        });
      }
}