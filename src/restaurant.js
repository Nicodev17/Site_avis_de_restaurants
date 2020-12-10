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
        let total = 0;

        this.ratings.forEach(element => {
            total += element.stars;
        });
        return total / this.ratings.length
    }

    // Méthode pour récupérer les commentaires
    getComments(){
        
        for(let i = 0 ; i < this.ratings.length ; i++) {
            this.ratings.forEach(element => {
                let test = $('#avisResto p:eq(' + i + ')').html(element.comment);
                return test
            });
        }
    }    
    
    // Méthode pour ajouter un avis (note + com)
    addRating(stars, comment){

    }

    // Méthode pour ajouter un nouveau resto
    addResto(position){

    }
}