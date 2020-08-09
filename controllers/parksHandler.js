const fs = require('fs');
const path = require('path');
const admin = require("firebase-admin");
const { v4: uuidv4 } = require('uuid');
const db = require('../utils/firestore');
const GeoPoint = require('geopoint');
const parkModel = require('../models/parkingModel');

const MAIN_COLLECTION = 'parking';

CMtoMM = (inCm) => {
    return inCm * 1000;
}

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
    // console.log(req.body);
    const park = new parkModel(req.body);
    console.log("out getParkIfExist");

    isParkInDb(park, (parkId) => {
        console.log("ParkId:", parkId);
        res.json({ id: parkId });
    });
}

exports.postNewPark = (req, res, next) => {
    console.log("In postNewPark");
    // console.log(req.body);
    const park = new parkModel(req.body);

    // Check if park already in db
    isParkInDb(park, (parkId) => {
        if (parkId) {
            console.log("Parks already in db ", parkId);
            return res.status(202).send(); // Parks in db.
        }

        imagePath = path.join("temp", "process_" + uuidv4() + ".png");
        let buff = new Buffer(park.image, 'base64');
        fs.writeFileSync(imagePath, buff);

        const spawn = require('child_process').spawn;
        const ls = spawn('python', [path.join("external", "depthtest.py"), imagePath, park.centerPoint.x,
            park.centerPoint.y]);
        console.log("printing data");
        ls.stdout.on('data', (data) => {
            fs.unlinkSync(imagePath); // remove image

            console.log(`stdout: ${data}`);
            
            let parkDistColorFactor = Number(data);
            if (parkDistColorFactor != -1) {
                let parkDistance = parkDistColorFactor * 51; // Baseline 0.51 cm
                console.log("Dist:", parkDistance,"park.sizePercentage", park.sizePercentage);
                park.sizePercentage *= CMtoMM(parkDistance);
                console.log("Python finish size:", park.sizePercentage);

                // Add park to db
                db.collection(MAIN_COLLECTION).doc(park.country).collection(park.city).doc().set({
                    date: admin.firestore.Timestamp.now(),
                    geom: new admin.firestore.GeoPoint(park.geom.latitude(), park.geom.longitude()),
                    id: park.userId,
                    size: park.sizePercentage
                }).then(ref => {
                    console.log('Added document with ID: ', ref.id);
                    return res.status(200).send();
                }).catch(err => {
                    console.log("Failed to add park", err);
                    return res.status(500).send(err);
                });
            }
            else {
                console.log("Failed caclculate depth");
            }
        });

        ls.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        ls.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    });
}

// Not in use
exports.postNewParkImage = (req, res, next) => {
    console.log("postNewParkImage");
    const park = new parkModel(req.body);
    // imagePath =  "temp\\test_image.jpg";
    imagePath = path.join("temp", "process_" + uuidv4() + ".png");
    //decoding imagey

    let buff = new Buffer(park.image, 'base64');
    fs.writeFileSync(imagePath, buff);

    const spawn = require('child_process').spawn;
    const ls = spawn('python', [path.join("external", "depthtest.py"), imagePath, park.centerPoint]);
    console.log("printing data");
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
