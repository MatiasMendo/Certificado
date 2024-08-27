const express = require('express')
const app = express()

app.use(require('./insertEPA'))

module.exports = app