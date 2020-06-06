const router = require('express').Router();

const parksHandler = require('../controllers/parksHandler')

router.post('/parks/add', parksHandler.postNewPark);

module.exports = router;