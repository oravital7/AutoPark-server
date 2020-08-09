const GeoPoint  = require('geopoint');
class Park {
    constructor(body)
    {
        this.country = body.country;
        this.city = body.city;
        this.geom = new GeoPoint(body.Geom._latitude, body.Geom._longitude);
        this.size = 40; // TODO: Change to real size
        this.userId = body.userId;
        this.image = body.image;
        this.centerPoint =body.centerP;

        // this.centerPoint =new point(body.centerP.x,body.centerP.y);
    
    }
}

module.exports = Park;