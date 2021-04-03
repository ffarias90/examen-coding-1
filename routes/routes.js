const { Router } = require('express');
const Sequelize = require('sequelize');
const { Op } = require("sequelize");
const { Pregunta, User , Puntaje} = require('../db')
const router = Router();

// aca configuramos las rutas.
function checkLogin(req, res, next) {


    if (req.session.user == null) {
        req.flash('errors', "Tienes que estar logeado para entrar a esta parte del sistema.");
        return res.redirect('/login');
    }

    res.locals.user = req.session.user;

    next();
}

function checkAdmin(req, res, next) {

    if (req.session.user.rol != "ADMIN") {
        req.flash('errors', "No tienes permisos de Administrador. No puedes entrar a esta parte del sistema.");
        return res.redirect('/');
    }

    next();

}

function getRandom(min, max, excluir = []) { // min and max included 

    let azar = Math.floor(Math.random() * (max - min + 1) + min);
    
    if (excluir.length > 0){
        while (excluir.includes(azar)){
            azar = Math.floor(Math.random() * (max - min + 1) + min);
        }
    }
    

    return azar;
}


router.get("/", [checkLogin], async (req, res) => {


    const errors = req.flash("errors");
    const mensajes = req.flash("mensajes");
    const resultado = req.flash("resultado");

    const busqueda = req.query.q;

    const opciones = {};
    opciones.order = [['porcentaje', 'desc']] ;
    
    if (busqueda != undefined) {
        opciones.include = [{
            model: User,
            where: {
                name: { [Op.like]: '%' + busqueda + '%' }
            }
        }];
    }else{
        opciones.include = [User];
    }

    

    const puntajes = await Puntaje.findAll(opciones);

    res.render("principal.ejs", { errors, mensajes, resultado, puntajes })
});


router.get("/new", [checkLogin], (req, res) => {

    const errors = req.flash("errors");
    const mensajes = req.flash("mensajes");

    res.render("pregunta.ejs", { errors, mensajes })
});

router.post("/new", [checkLogin], async (req, res) => {
    console.log("POST /new");
    console.log(req.body);

    try {

        const pregunta = await Pregunta.create(req.body);

        console.log(pregunta);

        req.flash("mensajes", "Pregunta agregada correctamente");

    } catch (err) {
        for (var key in err.errors) {
            req.flash('errors', err.errors[key].message);
        }
        return res.redirect('/new');
    }

    return res.redirect("/");

});

// recibe una pregunta de la base de datos 
// y la formatea para tener las respuestas al azar.
function prepararPregunta(pregunta){

    console.log(pregunta.id, "<-------->", pregunta.question);

    let azar1 = getRandom(1,3);
    let azar2 = getRandom(1,3, [azar1]);
    let azar3 = getRandom(1,3, [azar1, azar2]);

    let preguntaFormateada = {};
    preguntaFormateada['id'] = pregunta.id;
    preguntaFormateada['pregunta'] = pregunta.question;
    preguntaFormateada['opcion' + azar1] = pregunta.answer;
    preguntaFormateada['opcion' + azar2] = pregunta.fake_one;
    preguntaFormateada['opcion' + azar3] = pregunta.fake_two;

    return preguntaFormateada;

}


router.get("/play", [checkLogin], async (req, res) => {

    const errors = req.flash("errors");
    const mensajes = req.flash("mensajes");

    const preguntasBD = await Pregunta.findAll({ order: Sequelize.literal('rand()'), limit: 3 });

    let preguntas = [];

    for (var pregunta of preguntasBD) {
    
        preguntas.push(prepararPregunta(pregunta));
    
    }

    console.log(preguntas);

    res.render("jugar.ejs", { errors, mensajes, preguntas })
});



router.post("/play", [checkLogin], async (req, res) => {
    console.log("POST /play");
    console.log(req.body);

    let correctas = 0; 

    //{ '1': 'Temuco', '2': 'Pokemon', '5': 'Python' }

    for (let idPregunta in req.body){

        console.log(idPregunta, '<<--->>', req.body[idPregunta]);
        const respuesta = await Pregunta.findByPk(idPregunta);
        if(respuesta.answer == req.body[idPregunta])
            correctas++;

    }

    porcentaje = correctas * (100/3);
    
    console.log("PREGUNTAS CORRECTAS: ", correctas, " Porcentaje: " , porcentaje.toFixed(1));

    const user = await User.findByPk(req.session.user.id);

    user.createPuntaje({
        porcentaje,
        puntaje: correctas
    });

    req.flash('resultado', {msg: `Tienes ${correctas}/3 es decir un ${porcentaje.toFixed(1)}% de Exito.`, res: correctas});
    
    return res.redirect("/");

});

module.exports = router;
