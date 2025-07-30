// app.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));

// Rutas frontend para servir archivos HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/agendar', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'agendar.html'));
});
app.get('/servicios', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'servicios.html'));
});
app.get('/contacto', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contacto.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});
app.get('/ver-citas', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'ver-citas.html'));
});

// Importar rutas API para citas
const citaRoutes = require('./routes/citaRoutes');
app.use('/api/citas', citaRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
