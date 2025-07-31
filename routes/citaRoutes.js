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

// Obtener todas las citas con nombre del cliente
router.get('/todas', (req, res) => {
  const sql = `
    SELECT citas.id, usuarios.nombre AS cliente_nombre, citas.fecha, citas.hora, citas.servicio, citas.barbero, citas.estado
    FROM citas
    LEFT JOIN usuarios ON citas.cliente_id = usuarios.id
  `;
  pool.query(sql, (error, results) => {
    if (error) {
      console.error('Error al obtener citas:', error);
      return res.status(500).json({ error: 'Error al obtener citas' });
    }
    res.json(results);
  });
});

// Agendar cita (solo usuario logueado)
router.post('/agendar', verificarSesion, (req, res) => {
  const { fecha, hora, servicio, barbero } = req.body;
  const estado = 'pendiente';

  // Tomar cliente_id de la sesión
  const cliente_id = req.session.usuario.id;

  if (!fecha || !hora || !servicio || !barbero) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const sql = 'INSERT INTO citas (cliente_id, fecha, hora, servicio, barbero, estado) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [cliente_id, fecha, hora, servicio, barbero, estado];

  pool.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error al agendar cita:', error);
      return res.status(500).json({ error: 'Error al agendar cita' });
    }
    res.status(201).json({ mensaje: 'Cita agendada', id: results.insertId });
  });
});

// Eliminar cita (opcional: también puedes validar que solo el dueño la elimine)
router.delete('/eliminar/:id', (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM citas WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error('Error al eliminar cita:', error);
      return res.status(500).json({ error: 'Error al eliminar cita' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    res.json({ mensaje: 'Cita eliminada' });
  });
});

module.exports = router;


