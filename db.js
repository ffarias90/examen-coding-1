const Sequelize = require('sequelize');

// acá creamos la conexión a la Base de Datos
const sql = new Sequelize('repasotrivia', 'root', '1234', {
    host: 'localhost',
    dialect: 'mysql'
});

const User = sql.define('User', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Debe indicar un nombre'
            },
            len: {
                args: [2],
                msg: 'El nombre debe ser de largo al menos 2'
            }
        }
    },
    rol: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "NORMAL"
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: {
                msg: 'Debe indicar un email'
            },
            len: {
                args: [3],
                msg: 'El email debe ser de largo al menos 3'
            },
            isEmail: {
                msg: 'Debe ser un email válido'
            }
        }
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Debe indicar una contraseña'
            },
            len: {
                args: [3],
                msg: 'La contraseña debe ser de largo al menos 3'
            },
        }
    }
});



const Pregunta = sql.define('Pregunta', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    question: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Debe indicar un nombre'
            },
            len: {
                args: [15],
                msg: 'debe tener un largo de 15'
            }
        }
    },

    answer: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Debe indicar un answer'
            },
            len: {
                args: [1],
                msg: 'debe tener un largo de 1'
            }
        }
    },

    fake_one: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Debe indicar un fake_one'
            },
            len: {
                args: [1],
                msg: 'debe tener un largo de 1'
            }
        }
    },

    fake_two: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Debe indicar una respuesta'
            },
            len: {
                args: [1],
                msg: 'debe tener un largo de 1'
            }
        }
    },
});



const Puntaje = sql.define('Puntaje', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    puntaje: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    porcentaje: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
});

//  después sincronizamos nuestro código con la base de datos
sql.sync()
    .then(() => {
        console.log('Tablas creadas (SI NO EXISTEN) ...');
    });

User.hasMany(Puntaje);
Puntaje.belongsTo(User);

// finalmente acá listamos todos los modelos que queremos exportar
module.exports = {
    User,
    Pregunta,
    Puntaje
};