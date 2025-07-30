// routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// Conexión a la BD
const db = mysql.createConnection({
  host: 'localhost',
  user: 'tu_usuario_mysql',
  password: 'tu_contrasena_mysql',
  database: 'barberapp'
});

// REGISTRO
router.post('/registro', async (req, res) => {
  const { nombre, correo, contrasena } = req.body;
  if (!nombre || !correo || !contrasena) return res.status(400).json({ error: 'Faltan datos' });

  const hashed = await bcrypt.hash(contrasena, 10);
  db.query('INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)', [nombre, correo, hashed],
    (err) => {
      if (err) return res.status(500).json({ error: 'Error al registrar' });
      res.status(200).json({ mensaje: 'Usuario registrado correctamente' });
    }
  );
});

// LOGIN
router.post('/login', (req, res) => {
  const { correo, contrasena } = req.body;
  db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const usuario = results[0];
    const valid = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    res.status(200).json({ mensaje: 'Inicio de sesión exitoso', usuario });
  });
});

module.exports = router;
