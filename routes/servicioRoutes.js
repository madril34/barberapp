const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/ServicioController');

router.get('/ver', servicioController.mostrarServicios);

module.exports = router;
