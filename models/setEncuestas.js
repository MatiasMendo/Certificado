var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Encuesta = new Schema({
    Conversationid:{
        type: Schema.Types.String,
        required: true
    },
    Fecha :{
        type: Date,
        required: true
    },
    Ani :{
        type: Schema.Types.String,
        required: true
    },
    Agente :{
        type: Schema.Types.String,
        required:  false
    },
    Respuesta1:{
        type: Schema.Types.String,
        required: false
    },
    Respuesta2 :{
        type: Schema.Types.String,
        required: false
    },
    Respuesta3 :{
        type: Schema.Types.String,
        required: false
    },
    Respuesta4 :{
        type: Schema.Types.String,
        required: false
    },
    Respuesta5 :{
        type: Schema.Types.String,
        required: false
    },
    Respuesta6 :{
        type: Schema.Types.String,
        required: false
    },
    Respuesta7 :{
        type: Schema.Types.String,
        required: false
    },
    Respuesta8  :{
        type: Schema.Types.String,
        required: false
    },
    Respuesta9  :{
        type: Schema.Types.String,
        required: false
    },
    Respuesta10  :{
        type: Schema.Types.String,
        required: false
    },
    Encuesta  :{
        type: Schema.Types.String,
        required: true
    },
    Cola  :{
        type: Schema.Types.String,
        required: false
    },
    Division  :{
        type: Schema.Types.String,
        required: false
    },
    Idioma  :{
        type: Schema.Types.String,
        required: false
    },
    Buzon  :{
        type: Schema.Types.String,
        required: false
    },
    NombreBuzon  :{
        type: Schema.Types.String,
        required: false
    },
    Operacion  :{
        type: Schema.Types.Number,
        required: false
    }
});

const SetEncuestas = mongoose.model("respuestas_encuestas", Encuesta);

module.exports = SetEncuestas;
