const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/todas', CitaController.obtenerCitas);

  try {
    const [rows] = await pool.query('SELECT * FROM citas');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error al obtener citas' });
  
};

module.exports = router;
