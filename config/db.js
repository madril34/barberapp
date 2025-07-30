// config/db.js
const mysql = require('mysql2');


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '2547',       // Tu contraseña de MySQL
  database: 'barberapp'  // Tu base de datos
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a MySQL:', err);
  } else {
    console.log('Conectado a la base de datos MySQL');
  }
});

module.exports = db;
