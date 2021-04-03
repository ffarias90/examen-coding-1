const express = require("express");
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const port = 8000;

app.use(session({secret: 'cambiarcadaciertotiempo'}));  
app.use(flash());

// para archivos estaticos
app.use(express.static(__dirname + "/static")); // es directo a los archivos /archivo.xx

// para archivos estaticos
//app.use('/static', express.static("static")); // es con /static/archivo.xx en los archivos

// para los posts
app.use( express.json() );
app.use( express.urlencoded({ extended: true }) );

// Para las vistas
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// importar las rutas
app.use(require('./routes/auth'));
app.use(require('./routes/routes'));


app.listen(port, function() {
    console.log('Escuchando en el puerto ' + port);
});