const db = require('../utils/firestore');
const GeoPoint = require('geopoint');
const parkModel = require('../models/parkingModel');

const admin = require("firebase-admin");

const MAIN_COLLECTION = 'parking';

isParkInDb = (park, cb) => {
    const RADIUS_THRESHOLD_KM = 0.007; // 7 meter threshold
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
                    cb(doc.id);
                    throw BreakException;
                }
                // console.log("dist [", distInMeter, "]");
            });
        } catch (err) {
            return; // Parks in db.
        }

        return cb();

    }).catch(err => {
        return cb();
    });
}

exports.postParkIfExist = (req, res, next) => {
    console.log("in getParkIfExist");
    console.log(req.body);
    const park = new parkModel(req.body);
    console.log("out getParkIfExist");

    isParkInDb(park, (parkId) => {
        console.log("ParkId:", parkId);
        res.json({id : parkId});
    });
}

exports.postNewPark = (req, res, next) => {
    console.log("In postNewPark");
    console.log(req.body);
    const park = new parkModel(req.body);

    // Check if park already in db
    isParkInDb(park, (parkId) => {
        if (parkId)
        {
            console.log("Parks already in db ", parkId);
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
    });

    // db.collection(MAIN_COLLECTION).doc(park.country).collection(park.city).get().then(snapshot => {
    //     var BreakException = {};

    //     try {
    //         snapshot.forEach(doc => {
    //             data = doc.data();

    //             const currPoint = new GeoPoint(data.geom._latitude, data.geom._longitude);
    //             const distInKm = park.geom.distanceTo(currPoint, true);

    //             if (distInKm < RADIUS_THRESHOLD_KM) {
    //                 // TODO: Update parking time in db
    //                 console.log("Parks already in db");
    //                 throw BreakException;
    //             }
    //             // console.log("dist [", distInMeter, "]");
    //             // console.log(doc.id, '=>', doc.data());
    //         });
    //     } catch (e) {
    //         return res.status(202).send(); // Parks in db.
    //     }

}

exports.postNewParkImage = (req, res, next) => {
    console.log("postNewParkImage");

    imagePath =  "temp\\test_image.jpg";
    // Save in temp with unique id

    //

    const spawn = require('child_process').spawn;
    const ls = spawn('python', ['external\\depthtest.py', imagePath]);

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

    // temp\\test_image.jpg find dist

    //
    
    // Upload to db
    return res.status(200).send();
}