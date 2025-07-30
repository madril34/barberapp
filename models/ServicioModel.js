const db = require('../config/db');

const Servicio = {
  obtenerTodos: (callback) => {
    db.query('SELECT * FROM servicios', callback);
  }
};

module.exports = Servicio;
