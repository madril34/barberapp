const db = require('../config/db');

const Cliente = {
  obtenerTodos: (callback) => {
    db.query('SELECT * FROM clientes', callback);
  }
};

module.exports = Cliente;
