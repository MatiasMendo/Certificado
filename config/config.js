const dotenv = require('dotenv');
dotenv.config();

const cfgEnv = 'dev';
const cfgLog = {
    name: 'app',
    config: {
        appenders: {
            app: {
                type: 'dateFile',
                filename: 'log/appLog.log',
                pattern: '.yyyy-MM-dd',
                daysToKeep: 15,
                compress: true,
                layout: { type: 'pattern', pattern: '[%d] %p [%h] %X{archivo} %m' }
            },
            console: { type: 'console', layout: { type: 'pattern', pattern: '[%d] %[%p%] [%h] %[%X{archivo}%] %m' } }
        },
        categories: { default: { appenders: ['app', 'console'], level: 'all' } }
    }
}

get = (...items) => {
    try {
        if (items.length > 0) {
            itm0 = eval(items[0])
            if (Array.isArray(itm0)) {
                const r = itm0.find(itm => { return itm.id === items[1] })
                if (!r) throw new Error
                return r
            } else {
                let resp = eval(`${items.join('.')}.${cfgEnv}`)
                return resp ? resp : eval(`${items.join('.')}`)
            }
        } else {
            return `Environment: ${cfgEnv}`
        }
    } catch (e) {
        throw new Error(`No se resolvio la configuracion ${items.join('.')} para el environment ${cfgEnv}`)
    }
}

module.exports = {
    cfgLog,
    get
}