const GeoPoint  = require('geopoint');
class Park {
    constructor(body)
    {
        this.country = body.country;
        this.city = body.city;
        this.geom = new GeoPoint(body.Geom._latitude, body.Geom._longitude);
        this.sizePercentage = body.sizePercentage;
        this.userId = body.userId;
        this.image = body.image;
        this.centerPoint = body.centerP;    
    }
}

module.exports = Park;