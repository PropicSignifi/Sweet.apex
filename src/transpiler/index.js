const parse = require('../parser');
const rebuild = require('../features');
const compile = require('../compiler');
const { time, timeEnd, } = require('../utils');

const transpile = (src, config) => {
    time('Parse', config);
    const result = parse(src);
    timeEnd('Parse', config);
    if(config.isDebugEnabled) {
        console.log(JSON.stringify(result, null, 4));
    }

    time('Rebuild', config);
    rebuild(result, config);
    timeEnd('Rebuild', config);
    if(config.isDebugEnabled) {
        console.log('--------- After Rebuild ----------');
        console.log(JSON.stringify(result, null, 4));
    }

    time('Compile', config);
    const apexClass = compile(result);
    timeEnd('Compile', config);

    return apexClass;
};

module.exports = transpile;
