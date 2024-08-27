const { get } = require('./config/config');
const bodyParser = require('body-parser');
const log = require('./middlewares/log');
const mongoose = require('mongoose');
const express = require('express');
const https = require('https');
const fs = require('fs');
const ip = require('ip');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
const logger = log.create(__filename);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

app.use(require('./routes/index.js'));

dotenv.config({
    path: path.join(__dirname, '.env')
});

// Rutas de los archivos de certificados que has proporcionado
let keyPath = path.join(__dirname,"Certificado Sixbell 2024 (2)/Sixbell.com_2024_sin.key");
let certPath = path.join(__dirname,"Certificado Sixbell 2024 (2)/Sixbell.com_2024.crt");
let caPath = [
    path.join(__dirname,"Certificado Sixbell 2024 (2)/IntermedioAlpha.crt"),
    path.join(__dirname,"Certificado Sixbell 2024 (2)/RootAlpha_2024.crt")
];

let credentials = {
    key: fs.readFileSync(keyPath), // Clave privada
    cert: fs.readFileSync(certPath), // Certificado SSL
    ca: caPath.map(path => fs.readFileSync(path)), // Certificados de la cadena
    requestCert: false,
    rejectUnauthorized: false
}
let httpsServer = https.createServer(credentials, app);
httpsServer.listen(process.env.PORT, async function () {
    const cfg = log.initiate(logger, undefined, 'app.listen');
    console.clear();

    log.info(cfg, `server listen >> ${ip.address()}:`, process.env.PORT);

    // Código de conexión a MongoDB (puedes descomentar si es necesario)
});
