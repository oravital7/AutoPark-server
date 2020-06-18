const db = require('../utils/firestore');
const GeoPoint = require('geopoint');
const parkModel = require('../models/parkingModel');

const admin = require("firebase-admin");


exports.postNewPark = (req, res, next) => {
    const RADIUS_THRESHOLD_KM = 0.007; // 7 meter threshold
    const MAIN_COLLECTION = 'parking';

    console.log("In postNewPark");
    console.log(req.body);
    const park = new parkModel(req.body);


    // Check if park already in db
    db.collection(MAIN_COLLECTION).doc(park.country).collection(park.city).get().then(snapshot => {
        var BreakException = {};

        try {
            snapshot.forEach(doc => {
                data = doc.data();

                const currPoint = new GeoPoint(data.geom._latitude, data.geom._longitude);
                const distInKm = park.geom.distanceTo(currPoint, true);

                if (distInKm < RADIUS_THRESHOLD_KM) {
                    // TODO: Update parking time in db
                    console.log("Parks already in db");
                    throw BreakException;
                }
                // console.log("dist [", distInMeter, "]");
                // console.log(doc.id, '=>', doc.data());
            });
        } catch (e) {
            return res.status(202).send(); // Parks in db.
        }

        // Add park to db
        db.collection(MAIN_COLLECTION).doc(park.country).collection(park.city).doc().set({
            date: admin.firestore.Timestamp.now(),
            geom: new admin.firestore.GeoPoint(park.geom.latitude(), park.geom.longitude()),
            id: park.userId,
            size: park.size
        }).then(ref => {
            console.log('Added document with ID: ', ref.id);
            return res.status(200).send();
        }).catch(err => {
            console.log("Failed to add park", err);
            return res.status(500).send(err);
        });

    }).catch(err => {
        console.log(err);
        return res.status(500).send(err);
    });
}