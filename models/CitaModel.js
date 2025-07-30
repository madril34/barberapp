// models/CitaModel.js
const db = require('../config/db');

const Cita = {
  crear: async ({ nombre, fecha, hora, servicio, barbero }) => {
    const sql = 'INSERT INTO citas (nombre, fecha, hora, servicio, barbero, estado) VALUES (?, ?, ?, ?, ?, ?)';
    const valores = [nombre, fecha, hora, servicio, barbero, 'pendiente'];
    await db.execute(sql, valores);
  },

  obtenerTodas: async () => {
    const [rows] = await db.execute('SELECT * FROM citas');
    return rows;
  }
};

module.exports = Cita;
