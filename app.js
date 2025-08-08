const express = require('express');
const path = require('path');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

// Configurar motor de plantillas EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware para parsear JSON y urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesiones
app.use(session({
  secret: 'clave-secreta-super-segura',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 horas
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
      return res.redirect('/ver-citas');
    } else {
      return res.redirect('/agendar');
    }
  }
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/admin', verificarSesion, verificarAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/agendar', verificarSesion, (req, res) => {
  if (req.session.usuario.rol === 'admin') {
    return res.redirect('/ver-citas');
  }
  res.sendFile(path.join(__dirname, 'views', 'agendar.html'));
});

app.get('/ver-citas', verificarSesion, (req, res) => {
  res.render('ver-citas', { usuario: req.session.usuario });
});

app.get('/chat', verificarSesion, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'chat.html'));
});

// Rutas públicas
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

// API: Obtener todas las citas con nombre del cliente (solo admin)
app.get('/api/citas/todas', verificarSesion, async (req, res) => {
  if (req.session.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  try {
    const [citas] = await pool.query(`
      SELECT c.*, u.nombre AS cliente_nombre
      FROM citas c
      JOIN usuarios u ON c.cliente_id = u.id
    `);
    res.json(citas);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error al obtener citas' });
  }
});

// API: Obtener citas del usuario logueado
app.get('/api/citas/mis-citas', verificarSesion, async (req, res) => {
  try {
    const usuarioId = req.session.usuario.id;
    const [citas] = await pool.query(
      'SELECT id, fecha, hora, servicio, barbero, estado FROM citas WHERE cliente_id = ? ORDER BY fecha, hora',
      [usuarioId]
    );
    res.json(citas);
  } catch (error) {
    console.error('Error al obtener las citas del usuario:', error);
    res.status(500).json({ error: 'Error al obtener tus citas' });
  }
});

// Nueva ruta para obtener el rol del usuario logueado
app.get('/api/usuario/rol', verificarSesion, (req, res) => {
  res.json({ rol: req.session.usuario.rol });
});

// Rutas API backend (otras)
const citaRoutes = require('./routes/citaRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
app.use('/api/citas', citaRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Chat con socket.io
io.on('connection', (socket) => {
  console.log('🟢 Usuario conectado al chat');
  socket.on('mensaje_usuario', (msg) => {
    const texto = msg.toLowerCase();
    console.log('Mensaje del usuario:', texto);
    let respuesta = 'Disculpa, no entendí eso. ¿Puedes intentar con otra cosa?';
    if (texto.includes('hola')) {
      respuesta = '¡Hola! ¿Quieres saber sobre nuestros servicios o horarios?';
    } else if (
      texto.includes('servicios') ||
      ['corte de cabello', 'barba', 'paquete'].some((s) => texto.includes(s))
    ) {
      respuesta =
        'Ofrecemos Corte de cabello, Barba y Paquete Corte + Barba. ¿Quieres saber los horarios disponibles?';
    } else if (
      texto.includes('horario') ||
      ['mañana', 'tarde', 'noche'].some((h) => texto.includes(h))
    ) {
      respuesta = 'Nuestros horarios son de 9:00 AM a 6:00 PM de lunes a sábado.';
    } else if (texto.includes('contacto')) {
      respuesta =
        'Puedes llamarnos al 1234-5678 o escribirnos al correo contacto@barberapp.com';
    }
    socket.emit('mensaje_bot', respuesta);
  });
  socket.on('disconnect', () => {
    console.log('🔴 Usuario salió del chat');
  });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor BarberApp + Chat en: http://localhost:${PORT}`);
});

