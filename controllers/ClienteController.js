const Cliente = require('../models/ClienteModel');

exports.mostrarClientes = (req, res) => {
  Cliente.obtenerTodos((err, resultados) => {
    if (err) return res.status(500).json(err);
    res.json(resultados);
  });
};
