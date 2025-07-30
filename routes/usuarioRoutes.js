const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// LOGIN (ya lo tienes)
router.post('/login', (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const sql = 'SELECT * FROM usuarios WHERE correo = ?';
  pool.query(sql, [correo], (error, results) => {
    if (error) {
      console.error('Error en la base de datos:', error);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const usuario = results[0];

    if (usuario.contraseña !== contraseña) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    res.json({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  });
});

// REGISTRO
router.post('/registro', (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  if (!nombre || !correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  // Verificar si ya existe usuario con ese correo
  pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (error, results) => {
    if (error) {
      console.error('Error en la base de datos:', error);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Insertar nuevo usuario
    const sql = 'INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES (?, ?, ?, ?)';
    const values = [nombre, correo, contraseña, 'cliente'];

    pool.query(sql, values, (error, results) => {
      if (error) {
        console.error('Error al registrar usuario:', error);
        return res.status(500).json({ error: 'Error al registrar usuario' });
      }

      res.status(201).json({ mensaje: 'Usuario registrado', id: results.insertId });
    });
  });
});

module.exports = router;
