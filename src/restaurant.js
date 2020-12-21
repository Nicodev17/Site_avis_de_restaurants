class Restaurant {
    constructor(name, address, lat, lon, ratings) {
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

        this.ratings.forEach(element => {
            total += element.stars;
        });
        return total / this.ratings.length
    }

    // Méthode pour récupérer les commentaires
    getComments(){
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

    }

    // Méthode pour ajouter un nouveau resto
    addResto(position){

    }
}