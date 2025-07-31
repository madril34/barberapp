const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ==============================
// INICIAR SESIÓN
// ==============================
router.post('/login', async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const usuario = rows[0];

    if (usuario.contraseña !== contraseña) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Sesión simple: podrías usar JWT o sesiones reales si deseas
    res.json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ==============================
// REGISTRAR NUEVO USUARIO
// ==============================
router.post('/registro', async (req, res) => {
  try {
    const { nombre, correo, contraseña } = req.body;

    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const [existe] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (existe.length > 0) {
      return res.status(409).json({ error: 'Correo ya registrado' });
    }

    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES (?, ?, ?, ?)',
      [nombre, correo, contraseña, 'cliente']
    );

    res.status(201).json({ mensaje: 'Usuario registrado correctamente', id: resultado.insertId });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
