const express = require('express');
const router = express.Router();
const numberController = require('../controllers/numberController');

router.post('/addnumber/', numberController.addNumber); 
router.get('/get/', numberController.getNumbers);

router.delete('/delete/:id', numberController.deleteSingleNumber);
router.delete('/delete-all', numberController.deleteAllNumbers);  


module.exports = router;
