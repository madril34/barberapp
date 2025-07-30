exports.obtenerCitas = (req, res) => {
  console.log("Obteniendo citas...");
  const query = 'SELECT * FROM citas';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener citas:', err);
      return res.status(500).json({ error: 'Error al obtener citas' });
    }
    console.log(results); // <-- Este log
    res.json(results);
  });
};

