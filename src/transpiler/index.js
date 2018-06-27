const normalize = require('../template');
const parse = require('../parser');
const { rebuild, } = require('../features');
const compile = require('../compiler');
const { time, timeEnd, log, } = require('../utils');

const transpile = (src, config) => {
    time('Normalize', config);
    src = normalize(src, config);
    timeEnd('Normalize', config);

    time('Parse', config);
    const result = parse(src);
    timeEnd('Parse', config);
    if(config.isDebugEnabled) {
        log(JSON.stringify(result, null, 4), config);
    }

    time('Rebuild', config);
    rebuild(result, config);
    timeEnd('Rebuild', config);
    if(config.isDebugEnabled) {
        log('--------- After Rebuild ----------', config);
        log(JSON.stringify(result, null, 4), config);
    }

    time('Compile', config);
    const apexClass = compile(result);
    timeEnd('Compile', config);

    return apexClass;
};

module.exports = transpile;
