const db = require('../utils/firestore')


exports.postNewPark = (req, res, next) => {

    (async () => {
        try {
        await db.collection('parking').doc('test').set({city : "Or"});
        return res.status(200).send();
        }
        catch (err)
        {
            console.log(err);
            return res.status(500).send(err);
        }
    })();

    console.log("In postNewPark");
    console.log(req.query);
    console.log("----");
    console.log(req.body);
    // res.send('<h1>Hello World</h1>');
}