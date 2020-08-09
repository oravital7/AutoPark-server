const router = require('express').Router();

const parksHandler = require('../controllers/parksHandler')

router.post('/parks/add', parksHandler.postNewPark);
router.post('/parks/check', parksHandler.postParkIfExist);
// router.post('/parks/addimage', parksHandler.postNewParkImage);

module.exports = router;