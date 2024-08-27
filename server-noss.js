const { get } = require('./config/config');
const bodyParser = require('body-parser');
const log = require('./middlewares/log');
const mongoose = require('mongoose');
const express = require('express');
const http = require('http'); // Usando http en lugar de https
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

// Usamos HTTP sin necesidad de certificados
let httpServer = http.createServer(app);
httpServer.listen(process.env.PORT, async function () {
    const cfg = log.initiate(logger, undefined, 'app.listen');
    console.clear();

    log.info(cfg, `server listen >> ${ip.address()}:`, process.env.PORT);

    // Código de conexión a MongoDB (puedes descomentar si es necesario)
    // const connectionString = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_URL}/${process.env.MONGODB_DATABASE}`;

    // await mongoose.connect(connectionString, {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,
    // }).then(() => {
    //     log.info(cfg, 'MongoDB connected [' + process.env.MONGODB_URL + '/' + process.env.MONGODB_DATABASE + ']');
    // }).catch(error => {
    //     log.error(cfg, 'No se ha logrado conectar a MongoDb :', error);
    //     process.exit(1);
    // });
});
