const parse = require('../parser');
const rebuild = require('../features');
const compile = require('../compiler');

const transpile = (src, config) => {
    const result = parse(src);
    if(config.isDebugEnabled) {
        console.log(JSON.stringify(result, null, 4));
    }

    rebuild(result, config.features);
    if(config.isDebugEnabled) {
        console.log('--------- After Rebuild ----------');
        console.log(JSON.stringify(result, null, 4));
    }

    const apexClass = compile(result);

    return apexClass;
};

module.exports = transpile;
