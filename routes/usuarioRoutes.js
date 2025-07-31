const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Registro de usuario
router.post('/registro', async (req, res) => {
  try {
    const { nombre, correo, contraseña } = req.body;
    if (!nombre || !correo || !contraseña) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const [existingUser] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES (?, ?, ?, ?)',
      [nombre, correo, contraseña, 'cliente']
    );

    res.status(201).json({ mensaje: 'Usuario registrado con éxito', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

// Login de usuario
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

    // Guardar usuario en sesión
    req.session.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    };

    res.json({
      mensaje: 'Login exitoso',
      usuario: req.session.usuario,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

// Logout de usuario
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'No se pudo cerrar sesión' });
    }
    res.json({ mensaje: 'Sesión cerrada correctamente' });
  });
});

// Ruta para verificar sesión activa (opcional)
router.get('/sesion-activa', (req, res) => {
  if (req.session.usuario) {
    res.json({ usuario: req.session.usuario });
  } else {
    res.status(401).json({ error: 'No hay sesión activa' });
  }
});

module.exports = router;

