const { Router } = require('express');

const controller = require('./controller');
const router = Router();
const imageUploadMiddleware = require('../image-upload');


router.post('/upload',imageUploadMiddleware,controller.createNewOutfit);

module.exports = router;
