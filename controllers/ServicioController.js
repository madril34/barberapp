const Servicio = require('../models/ServicioModel');

exports.mostrarServicios = (req, res) => {
  Servicio.obtenerTodos((err, resultados) => {
    if (err) return res.status(500).json(err);
    res.json(resultados);
  });
};
