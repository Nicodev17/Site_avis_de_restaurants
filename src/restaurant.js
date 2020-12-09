class Restaurant {
    constructor(name, photo, address, lat, lon, ratings) {
        this.name = name;
        this.photo = photo;
        this.address = address;
        this.position = {
            lat,
            lon
        };
        this.ratings = ratings;
    }

    // Méthode pour calculer la moyenne des notes de tous les avis d'un resto
    calculAverage(){

    }
    
    // Méthode pour ajouter un avis (note + com)
    addRating(stars, comment){

    }

    // Méthode pour ajouter un nouveau resto
    addResto(position){

    }
}