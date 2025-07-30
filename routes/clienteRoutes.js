const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/ClienteController');

router.get('/ver', clienteController.mostrarClientes);

module.exports = router;
