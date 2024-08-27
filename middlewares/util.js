const moment = require('moment')
const isJson = require('is-json')


validaCampo = (nombre, valor, tipo = 'string', empty = true) => {
    if (!valor && !empty) throw new Error(`No se detecto el campo ${nombre}`)

    switch (tipo) {
        case 'number':
            if (!isNumeric(valor)) throw new Error(`El campo ${nombre} no es numerico`)
            break
        case 'date':
            if (!moment(valor).isValid()) throw new Error(`El campo ${nombre} no es una fecha`)
            valor = moment(valor)
            break
        case 'json':
            if (!isJson(valor, true)) throw new Error(`El campo ${nombre} no es json`)
            break;
        default:
            if (!empty && valor.trim().length === 0) throw new Error(`El campo ${nombre} viene vacio`)
            break
    }

    return valor
}

isNumeric = (n) => {
    return (typeof n == "number" && !isNaN(n));
}

getPhoneSip = (sipPhone) => {
    if (sipPhone.includes(':')) sipPhone = sipPhone.split(':')[1]
    if (sipPhone.includes('@')) sipPhone = sipPhone.split('@')[0]
    return sipPhone
}


module.exports = {
    validaCampo,
    isNumeric,
    isJson
}