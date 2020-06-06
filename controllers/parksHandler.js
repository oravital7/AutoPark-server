const db = require('../utils/firestore');
const GeoPoint  = require('geopoint');
const parkModel = require('../models/parkingModel');

const admin = require("firebase-admin"); // TODO: Move google Geopoint


exports.postNewPark = (req, res, next) => {
    const RADIUS_THRESHOLD_KM = 0.007; 
    const MAIN_COLLECTION = 'parking';

    console.log("In postNewPark");
    console.log(req.query);
    console.log("----");
    console.log(req.body);
    const park = new parkModel(req.body);

    db.collection(MAIN_COLLECTION).doc(park.country).collection(park.city).get().then(snapshot => {
        let isInDb = false;

        snapshot.forEach(doc => {
            data = doc.data();
            
            const currPoint = new GeoPoint(data.geom._latitude, data.geom._longitude);
            const distInKm = park.geom.distanceTo(currPoint, true);
            console.log("dist: ", distInKm);

            if (distInKm < RADIUS_THRESHOLD_KM)
            {
                // TODO: Update parking time in db
                console.log("Parks already in db");
                isInDb = true;
                return true;
            }
           // console.log("dist [", distInMeter, "]");
           // console.log(doc.id, '=>', doc.data());
        });

        if (isInDb)
            return res.status(202).send();
        
        // TODO: Add 'pointToAdd' as new parking
        db.collection(MAIN_COLLECTION).doc(park.country).collection(park.city).doc().set({
            date: Date.now(),
            geom: new admin.firestore.GeoPoint(park.geom.latitude(), park.geom.longitude()),
            id: -1,
            size: park.size
        }).then(ref => {
            console.log('Added document with ID: ', ref.id);
            return res.status(200).send();
          }).catch(err => {
              console.log("Failed to add park", err);
              return res.status(500).send(err);
          });
          
    }
    ).catch(err => {
        console.log(err);
        return res.status(500).send(err);
    });

   // return res.status(500).send(err);
}