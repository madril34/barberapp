const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const PORT = 3000;

// Middleware para parsear JSON y urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesiones
app.use(session({
  secret: 'clave-secreta-super-segura', 
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2 // 2 horas
  }
}));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para verificar sesión activa
function verificarSesion(req, res, next) {
  if (!req.session.usuario) {
    return res.redirect('/login');
  }
  next();
}

// Middleware para verificar que el usuario sea admin
function verificarAdmin(req, res, next) {
  if (!req.session.usuario || req.session.usuario.rol !== 'admin') {
    return res.status(403).send('No autorizado');
  }
  next();
}

// Ruta raíz que redirige según rol si hay sesión
app.get('/', (req, res) => {
  if (req.session.usuario) {
    if (req.session.usuario.rol === 'admin') {
      return res.sendFile(path.join(__dirname, 'views', 'admin.html'));
    } else {
      return res.sendFile(path.join(__dirname, 'views', 'agendar.html'));
    }
  }
  // Si no hay sesión, mostrar la página de inicio o login
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Rutas protegidas
app.get('/admin', verificarSesion, verificarAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/agendar', verificarSesion, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'agendar.html'));
});

// Otras rutas públicas
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

// Rutas API backend
const citaRoutes = require('./routes/citaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

app.use('/api/citas', citaRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor BarberApp corriendo en: http://localhost:${PORT}`);
});
