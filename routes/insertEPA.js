const setEncuestas = require('../models/setEncuestas');
const DivisionesModel = require("../models/Divisions");
const moment_timezone = require('moment-timezone');
const express = require('express');
const moment = require('moment');
var axios = require('axios');
const path = require('path');
const fs = require('fs');
const log = require('../middlewares/log');
const { get } = require('../config/config');
const logger = log.create(__filename)
const app = express();
const jsonata = require('jsonata');


app.post('/inicioEPA', async (req, res) => {
  const cfg = log.request(logger, req, '/inicioEPA');
  var resp = {
    resultado: "NOK",
    descripcion: "Error en la asignacion"
  }
  let resultadoSave = "";
  let agente = "";
  let resultFind = "";

  if(typeof req.body.Encuesta == 'undefined') req.body.Encuesta = 'Error Sin Encuesta';

  resultFind = await setEncuestas.findOne({ "Conversationid": req.body.Conversationid });

  if (resultFind == null || resultFind == "null") {

    const opciones = new setEncuestas(
      {
        "Conversationid": req.body.Conversationid,
        "Fecha": moment().toDate(),
        "Ani": req.body.Ani,
        "Encuesta": req.body.Encuesta,
        "Operacion": 1
      }
    );

    console.log(JSON.stringify(opciones));

    try {
      resultadoSave = await opciones.save();
      resp.resultado = "OK";
      resp.descripcion = "Registro Exitoso de: " + req.body.Conversationid;
      //let datos = await consultaDatos(req.body.Conversationid);
    } catch (err) {
      resp.resultado = "NOK";
      resp.descripcion = err.message;
    }
  }
  else {
    resp.descripcion = "Interaccion ya registrada: " + req.body.Conversationid;
    resp.resultado = "NOK";
  }
  log.info(cfg, resp);
  return res.status(200).json(resp)
});

app.post('/actualizaEPA', async (req, res) => {
  const cfg = log.request(logger, req, '/api/setEncuestas');
  var resp = {
    resultado: "NOK",
    descripcion: "Error en la asignacion"
  }
  let resultadoSave = "";
  let agente = "";
  let resultFind = "";
  
  resultFind = await setEncuestas.findOne({ "Conversationid": req.body.Conversationid });

  if (resultFind == null || resultFind == "null") {
    if(typeof req.body.Encuesta == 'undefined') req.body.Encuesta = 'Error Sin Encuesta';
    const opciones = new setEncuestas(
      {
        "Conversationid": req.body.Conversationid,
        "Fecha": moment().toDate(),
        "Ani": req.body.Ani,
        "Encuesta": req.body.Encuesta,
        "Agente": '',
        "Cola": '',
        "Division": ''
      }
    );

    if(typeof req.body.Respuesta1 != 'undefined'){
      if (req.body.Respuesta1 != "" && req.body.Respuesta1 != "vacio") {        
        let agenteNombre = '', cola = '', division = '';
        let datosConversacion = await consultaDatos(req.body.Conversationid);
        console.log("Datos Conversacion: " + JSON.stringify(datosConversacion).length);
        //console.log("Datos Conversacion: " + JSON.stringify(datosConversacion));
        for (var i = 0; i < datosConversacion.participants.length; i++) {
          if (datosConversacion.participants[i].purpose === "agent") {
            agenteNombre = datosConversacion.participants[i].name;
          }
          if (typeof datosConversacion.participants[i].queueName !== 'undefined') {
            cola = datosConversacion.participants[i].queueName;
          }
        }
        division = datosConversacion.divisions[datosConversacion.divisions.length - 1].division.id;
  
        let divisiones = await DivisionesModel.find({ "documentName": 'DivisionList' }).catch(function (error) {
          logger.error("Consultando datos de llamada: " + error.response.status + " - " + error.response.statusText);
        });
  
        if (typeof divisiones === 'undefined') {
          console.log("No se encontraron divisiones!!!!");
        } else {
          let divisionExpression = jsonata("$[id = '" + division + "']");
          let resultDivision = await divisionExpression.evaluate(divisiones[0].divisions);
          division = typeof resultDivision.name != 'undefined' ? resultDivision.name : division;
        }
  
        opciones.Agente = agenteNombre;
        opciones.Cola = cola;
        opciones.Division = division;
        opciones.Fecha = moment(datosConversacion.startTime, "YYYY-MM-DDTHH:mm:ss.sssZ").toDate();
        opciones.Respuesta1 = req.body.Respuesta1;
        //console.log("IN_Datos Conversacion: " + JSON.stringify(datos));
      }
    }

    console.log("A Registrar: " + JSON.stringify(opciones));

    try {
      resultadoSave = await opciones.save();
      resp.resultado = "OK";
      resp.descripcion = "Registro Exitoso de: " + req.body.Conversationid;
      //let datos = await consultaDatos(req.body.Conversationid);
    } catch (err) {
      resp.resultado = "NOK";
      resp.descripcion = err.message;
    }
  }
  else {
    //resp.descripcion = "Error al registrar, Conversationid ya existe de: " + req.body.Conversationid;
    //log.info(cfg, "Error al registrar, Conversationid ya existe de: " + req.body.Conversationid);
    let nd = req.body;

    var myquery = { Conversationid: req.body.Conversationid };
    var newvalues = { $set: {} };

    console.log(moment().format('HH:mm:ss.sss') + "RF: " + JSON.stringify(resultFind));

    if (typeof resultFind.Agente == 'undefined' || resultFind.Agente == '' || resultFind.Cola == '' || resultFind.Division == '') {
      console.log("Datos Evaluados: -A--" + resultFind.Agente + '--C--' + resultFind.Cola + '--D--' + resultFind.Division + '--');
      let agenteNombre = '', cola = '', division = '';
      let datosConversacion = await consultaDatos(req.body.Conversationid);
      console.log("Datos Conversacion: " + JSON.stringify(datosConversacion).length);
      //console.log("Datos Conversacion: " + JSON.stringify(datosConversacion));
      for (var i = 0; i < datosConversacion.participants.length; i++) {
        if (datosConversacion.participants[i].purpose === "agent") {
          agenteNombre = datosConversacion.participants[i].name;
        }
        if (typeof datosConversacion.participants[i].queueName !== 'undefined') {
          cola = datosConversacion.participants[i].queueName;
        }
      }
      division = datosConversacion.divisions[datosConversacion.divisions.length - 1].division.id;

      let divisiones = await DivisionesModel.find({ "documentName": 'DivisionList' }).catch(function (error) {
        logger.error("Consultando datos de llamada: " + error.response.status + " - " + error.response.statusText);
      });

      if (typeof divisiones === 'undefined') {
        console.log("No se encontraron divisiones!!!!");
      } else {
        let divisionExpression = jsonata("$[id = '" + division + "']");
        let resultDivision = await divisionExpression.evaluate(divisiones[0].divisions);
        division = typeof resultDivision.name != 'undefined' ? resultDivision.name : division;
      }

      newvalues.$set.Agente = agenteNombre;
      newvalues.$set.Cola = cola;
      newvalues.$set.Division = division;
      newvalues.$set.Fecha = moment(datosConversacion.startTime, "YYYY-MM-DDTHH:mm:ss.sssZ").toDate();
      //console.log("IN_Datos Conversacion: " + JSON.stringify(datos));
    }

    //console.log("OUT_Datos Conversacion: " + JSON.stringify(datos));    

    if (typeof nd.Idioma !== 'undefined') {
      if (typeof resultFind.Idioma !== 'undefined') {
        if (nd.Idioma !== resultFind.Idioma)
          newvalues.$set.Idioma = nd.Idioma;
      } else
        newvalues.$set.Idioma = nd.Idioma;
    }

    if (typeof nd.Buzon !== 'undefined') {
      if (typeof resultFind.Buzon !== 'undefined') {
        if (nd.Buzon !== resultFind.Buzon)
          newvalues.$set.Buzon = nd.Buzon;
      } else
        newvalues.$set.Buzon = nd.Buzon;
    }

    if (typeof nd.NombreBuzon !== 'undefined') {
      if (typeof resultFind.NombreBuzon !== 'undefined') {
        if (nd.NombreBuzon !== resultFind.NombreBuzon)
          newvalues.$set.NombreBuzon = nd.NombreBuzon;
      } else
        newvalues.$set.NombreBuzon = nd.NombreBuzon;
    }

    if (typeof nd.Respuesta1 !== 'undefined') {
      if (nd.Respuesta1 !== 'vacio') {
        if (typeof resultFind.Respuesta1 !== 'undefined') {
          if (nd.Respuesta1 !== resultFind.Respuesta1)
            newvalues.$set.Respuesta1 = nd.Respuesta1;
        } else
          newvalues.$set.Respuesta1 = nd.Respuesta1;
      }
    }

    if (typeof nd.Respuesta2 !== 'undefined') {
      if (nd.Respuesta2 !== 'vacio') {
        if (typeof resultFind.Respuesta2 !== 'undefined') {
          if (nd.Respuesta2 !== resultFind.Respuesta2)
            newvalues.$set.Respuesta2 = nd.Respuesta2;
        } else
          newvalues.$set.Respuesta2 = nd.Respuesta2;
      }
    }

    if (typeof nd.Respuesta3 !== 'undefined') {
      if (nd.Respuesta3 !== 'vacio') {
        if (typeof resultFind.Respuesta3 !== 'undefined') {
          if (nd.Respuesta3 !== resultFind.Respuesta3)
            newvalues.$set.Respuesta3 = nd.Respuesta3;
        } else
          newvalues.$set.Respuesta3 = nd.Respuesta3;
      }
    }

    if (typeof nd.Respuesta4 !== 'undefined') {
      if (nd.Respuesta4 !== 'vacio') {
        if (typeof resultFind.Respuesta4 !== 'undefined') {
          if (nd.Respuesta4 !== resultFind.Respuesta4)
            newvalues.$set.Respuesta4 = nd.Respuesta4;
        } else
          newvalues.$set.Respuesta4 = nd.Respuesta4;
      }
    }

    if (typeof nd.Respuesta5 !== 'undefined') {
      if (nd.Respuesta5 !== 'vacio') {
        if (typeof resultFind.Respuesta5 !== 'undefined') {
          if (nd.Respuesta5 !== resultFind.Respuesta5)
            newvalues.$set.Respuesta5 = nd.Respuesta5;
        } else
          newvalues.$set.Respuesta5 = nd.Respuesta5;
      }
    }

    if (typeof nd.Respuesta6 !== 'undefined') {
      if (nd.Respuesta6 !== 'vacio') {
        if (typeof resultFind.Respuesta6 !== 'undefined') {
          if (nd.Respuesta6 !== resultFind.Respuesta6)
            newvalues.$set.Respuesta6 = nd.Respuesta6;
        } else
          newvalues.$set.Respuesta6 = nd.Respuesta6;
      }
    }

    if (typeof nd.Respuesta7 !== 'undefined') {
      if (nd.Respuesta7 !== 'vacio') {
        if (typeof resultFind.Respuesta7 !== 'undefined') {
          if (nd.Respuesta7 !== resultFind.Respuesta7)
            newvalues.$set.Respuesta7 = nd.Respuesta7;
        } else
          newvalues.$set.Respuesta7 = nd.Respuesta7;
      }
    }

    if (typeof nd.Respuesta8 !== 'undefined') {
      if (nd.Respuesta8 !== 'vacio') {
        if (typeof resultFind.Respuesta8 !== 'undefined') {
          if (nd.Respuesta8 !== resultFind.Respuesta8)
            newvalues.$set.Respuesta8 = nd.Respuesta8;
        } else
          newvalues.$set.Respuesta8 = nd.Respuesta8;
      }
    }

    if (typeof nd.Respuesta9 !== 'undefined') {
      if (nd.Respuesta9 !== 'vacio') {
        if (typeof resultFind.Respuesta9 !== 'undefined') {
          if (nd.Respuesta9 !== resultFind.Respuesta9)
            newvalues.$set.Respuesta9 = nd.Respuesta9;
        } else
          newvalues.$set.Respuesta9 = nd.Respuesta9;
      }
    }

    if (typeof nd.Respuesta10 !== 'undefined') {
      if (nd.Respuesta10 !== 'vacio') {
        if (typeof resultFind.Respuesta10 !== 'undefined') {
          if (nd.Respuesta10 !== resultFind.Respuesta10)
            newvalues.$set.Respuesta10 = nd.Respuesta10;
        } else
          newvalues.$set.Respuesta10 = nd.Respuesta10;
      }
    }

    // if(typeof nd. !== 'undefined'){
    //   if(typeof resultFind. !== 'undefined'){
    //     if(nd. !== resultFind.)
    //       newvalues.$set. = nd.;
    //   }else
    //     newvalues.$set. = nd.;
    // }

    try {
      console.log("ND: " + JSON.stringify(newvalues));
      resultadoSave = await setEncuestas.updateMany(myquery, newvalues);
      resp.resultado = "OK";
      resp.descripcion = "Actualización Exitosade: " + req.body.Conversationid;

    } catch (err) {
      resp.resultado = "NOK";
      resp.descripcion = err.message;
    }
  }
  log.info(cfg, resp);
  return res.status(200).json(resp)
});

async function consultaDatos(Conversationid)
//async function  consultaAgente(Conversationid)
{
  const cfg = log.initiate(logger, undefined, 'consultaAgente');
  var encodedData = Buffer.from(process.env.CLIENTID + ':' + process.env.CLIENTSECRET).toString('base64');

  var options = {
    method: 'POST',
    url: process.env.URLTOKEN,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + encodedData
    },
    data: "grant_type=client_credentials"
  };

  let token = await axios(options).catch(function (error) {
    logger.error("Creando token: " + error.response.status + " - " + error.response.statusText);
  });

  token = token.data.access_token;

  var optionsAGENTE = {
    method: 'GET',
    url: process.env.URLINTERACCION + Conversationid,
    headers: {
      'Authorization': 'bearer ' + token
    }
  };

  let resultado = await axios(optionsAGENTE).catch(function (error) {
    logger.error("Consultando datos de llamada: "+Conversationid + " - " + error.response.status + " - " + error.response.statusText);
  });
  //console.log("conversacion ::", JSON.stringify(resultado.data, null, 4));
  //console.log("conversacion ::" + JSON.stringify(resultado.data));
  return typeof resultado.data != 'undefined' ? resultado.data : {};
}

async function consultaEncuestas()
//async function  consultaAgente(Conversationid)
{
  const cfg = log.initiate(logger, undefined, 'consultaEncuestas');
  var encodedData = Buffer.from(process.env.CLIENTID + ':' + process.env.CLIENTSECRET).toString('base64');

  var options = {
    method: 'POST',
    url: process.env.URLTOKEN,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + encodedData
    },
    data: "grant_type=client_credentials"
  };

  let token = await axios(options).catch(function (error) {
    //logger.error("Creando token: " + error.response.status + " - " + error.response.statusText);
    logger.error("Creando token: " + JSON.stringify(error.response));
  });

  token = token.data.access_token;

  var optionsAGENTE = {
    method: 'GET',
    url: "https://api.mypurecloud.com/api/v2/flows/datatables/5f0d6e96-6144-43d6-bb8d-bf14aedb60ed/rows?showbrief=false&pageNumber=1&pageSize=100&sortBy=key&sortOrder=ascending",
    //url: process.env.URLINTERACCION + Conversationid,
    headers: {
      'Authorization': 'bearer ' + token
    }
  };

  let resultado = await axios(optionsAGENTE).catch(function (error) {
    logger.error("Consultando datos encuestas: " + error.response.status + " - " + error.response.statusText);
  });
  //console.log("conversacion ::", JSON.stringify(resultado.data, null, 4));
  console.log("encuestas ::" + JSON.stringify(resultado.data));
  return resultado.data
}


module.exports = app;
