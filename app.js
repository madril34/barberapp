const express = require('express');
const path = require('path');
const session = require('express-session');  // Agregado
const app = express();
const PORT = 3000;

// ========== Middleware ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesiones
app.use(session({
  secret: 'clave-secreta-super-segura', // Puedes cambiarla por algo más único
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2 // 2 horas
  }
}));

// Archivos estáticos (CSS, imágenes, JS)
app.use(express.static(path.join(__dirname, 'public')));

// ========== Vistas frontend ==========
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

app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'registro.html'));
});

app.get('/ver-citas', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'ver-citas.html'));
});

// ========== Rutas backend ==========
const citaRoutes = require('./routes/citaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

app.use('/api/citas', citaRoutes);
app.use('/api/usuarios', usuarioRoutes);

// ========== Servidor ==========
app.listen(PORT, () => {
  console.log(`Servidor BarberApp corriendo en: http://localhost:${PORT}`);
});
