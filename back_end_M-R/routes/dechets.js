const express = require('express');
const router = express.Router();
const dechetsController = require('../controllers/dechetsController');
const { authenticateToken } = require('../utils/token');

router.get('/',dechetsController.getAllDechet)

router.post('/registerDechet',authenticateToken, dechetsController.ajoutDechet)
router.get('/:id',dechetsController.getDechetAndUserByIdDechet)     
router.get('/:id/clean/status', dechetsController.getCleaningStatus);
router.post('/:id/clean', authenticateToken, dechetsController.startCleaning);
router.delete('/:id/clean', authenticateToken, dechetsController.cancelCleaning);

//router.get('/', dechetsController.listerDechet)

module.exports = router;