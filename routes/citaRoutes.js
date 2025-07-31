const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Middleware para verificar sesión activa
function verificarSesion(req, res, next) {
  if (!req.session.usuario) {
    return res.status(401).json({ error: 'Debes iniciar sesión' });
  }
  next();
}

// Obtener todas las citas con nombre del cliente (solo admins)
router.get('/todas', verificarSesion, async (req, res) => {
  try {
    if (req.session.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const [results] = await pool.query(`
      SELECT citas.id, usuarios.nombre AS cliente_nombre, citas.fecha, citas.hora, citas.servicio, citas.barbero, citas.estado
      FROM citas
      LEFT JOIN usuarios ON citas.cliente_id = usuarios.id
    `);
    res.json(results);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error al obtener citas' });
  }
});

// Agendar cita (solo usuario logueado)
router.post('/agendar', verificarSesion, async (req, res) => {
  try {
    const { fecha, hora, servicio, barbero } = req.body;
    const cliente_id = req.session.usuario.id;
    const estado = 'pendiente';

    if (!fecha || !hora || !servicio || !barbero) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const [result] = await pool.query(
      'INSERT INTO citas (cliente_id, fecha, hora, servicio, barbero, estado) VALUES (?, ?, ?, ?, ?, ?)',
      [cliente_id, fecha, hora, servicio, barbero, estado]
    );

    res.status(201).json({ mensaje: 'Cita agendada', id: result.insertId });
  } catch (error) {
    console.error('Error al agendar cita:', error);
    res.status(500).json({ error: 'Error al agendar cita' });
  }
});

// Eliminar cita (solo dueño o admin)
router.delete('/eliminar/:id', verificarSesion, async (req, res) => {
  const citaId = req.params.id;
  const usuario = req.session.usuario;

  try {
    // Verificar si la cita existe y pertenece al usuario o si es admin
    const [rows] = await pool.query('SELECT * FROM citas WHERE id = ?', [citaId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const cita = rows[0];
    if (usuario.rol !== 'admin' && cita.cliente_id !== usuario.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta cita' });
    }

    await pool.query('DELETE FROM citas WHERE id = ?', [citaId]);
    res.json({ mensaje: 'Cita eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({ error: 'Error al eliminar cita' });
  }
});

// Obtener citas del usuario logueado
router.get('/mis-citas', verificarSesion, async (req, res) => {
  try {
    const usuarioId = req.session.usuario.id;

    const [citas] = await pool.query(
      'SELECT id, fecha, hora, servicio, barbero, estado FROM citas WHERE cliente_id = ? ORDER BY fecha, hora',
      [usuarioId]
    );

    res.json(citas);
  } catch (error) {
    console.error('Error al obtener las citas del usuario:', error);
    res.status(500).json({ error: 'Error al obtener tus citas' });
  }
});

module.exports = router;


