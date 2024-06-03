const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const config = require('./config');
const dotenv = require('dotenv');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const SQLiteStore = require('connect-sqlite3')(session);
const fs = require('node:fs');
const usuarios = require('./database/tables/usuarios');
const authMiddleWare = require('./middlewares/authMiddleware');
const cookieParser = require('cookie-parser');


// Middleware para analizar cuerpos JSON
app.use(express.json());

// Middleware para analizar cuerpos con URL codificada
app.use(express.urlencoded({ extended: true }));

// Configuración del motor de plantillas (si usas EJS, Pug, etc.)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Importar y usar las rutas
const userRoutes = require('./routes/registrar-usuario');
app.use('/api/users', userRoutes);

// Configuración de la sesión
app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));


// codigo para el almacenamiento de clientes
// Importar los controladores
const clientesController = require('./controllers/clientesController'); 
// Usar el controlador para manejar rutas
app.use('/', clientesController);


// codigo para el almacenamiento de informes
// Importar los controladores
const informesController = require('./controllers/informesController');
// Usar los controladores para manejar rutas
app.use('/', informesController);


// codigo para las ventas
// Importar controladores
const ventasController = require('./controllers/ventasController');
// Usar los controladores para manejar rutas
app.use('/', ventasController);


// codigo para las interacciones
// Importar el controlador
const interaccionesController = require('./controllers/interaccionesController');
// Usar el controlador para manejar rutas
app.use('/', interaccionesController);


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
});


app.use(cookieParser());

dotenv.config();

app.use(session({
    secret: process.env.ACCESS_TOKEN_SECRET, // Clave secreta para firmar la cookie de sesión
    resave: false,
    saveUninitialized: true,
    store: new SQLiteStore({ db: 'sessionsDB.sqlite', table: 'sessions' }) // Almacena las sesiones en una base de datos SQLite
}));

app.use(flash());

// Configurar Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Configurar estrategia de autenticación local
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await usuarios.obtenerPorNombre(username);
      if (!user) {
        return done(null, false, { message: 'Usuario incorrecto.' });
      }
      const passwordMatch = await authMiddleWare.comparePassword(password, user.password_hash);
      if (!passwordMatch) {
        return done(null, false, { message: 'Contraseña incorrecta.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  await usuarios.obtenerPorId(id).then((user) => {
    done(null, user);
  }).catch((error) => {
    done(error, null);
  });
});

app.use(express.urlencoded({ extended: true }));

// Configuracion de la plantilla pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware para procesar archivos estáticos 
app.use(express.static('public'));
app.use(express.json());


app.get('/logout', async (req, res) => {
    await req.logout(async (err) => {
      if (err) {
        // Manejo del error, si es necesario
        console.error(err);
      }
      //req.session.destroy(); // Eliminar la sesión completa
      await req.session.destroy((err) => {
        if (err) {
          console.error('Error al destruir la sesión:', err);
          return res.status(500).send('Error al cerrar sesión');
        }
        console.log('req.session.destroy finalizado correctamente');
      });
      // Eliminar el contenido del almacén de sesiones
      await req.sessionStore.clear((err) => {
        if (err) {
          console.error('Error al limpiar el almacén de sesiones:', err);
          return res.status(500).send('Error al cerrar sesión');
        }
        console.log('req.sessionStore.clear finalizado correctamente');
      });
      res.clearCookie('token');
      res.redirect('/'); // Redirigir a la página principal u otra página de tu elección
    });
});


// Rutas
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const cesarRouter = require('./routes/cesar');
const loginRouter = require('./routes/login');
const base64Router = require('./routes/base64');
const hexadecimalRouter = require('./routes/hexadecimal');
const registroRouter = require('./routes/registro');
const sustitucionRouter = require('./routes/sustitucion');
const registrarUsuarioRouter = require('./routes/registrar-usuario');

app.use('/', indexRouter);
app.use('/auth', authRouter); 
app.use('/cesar', cesarRouter);
app.use('/login', loginRouter);
app.use('/base64', base64Router);
app.use('/hexadecimal', hexadecimalRouter);
app.use('/registro', registroRouter);
app.use('/sustitucion', sustitucionRouter);
app.use('/registrar-usuario', registrarUsuarioRouter);


const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
    console.log('Servidor escuchando en el puerto 3010');
});