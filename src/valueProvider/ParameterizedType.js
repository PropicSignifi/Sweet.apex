const getValue = require('./index.js');
const { getTypeParameters, } = require('../utils');

const ParameterizedType = node => {
    const {
        type,
        typeArguments,
    } = node;

    return `${getValue(type)}${getTypeParameters(typeArguments)}`;
};

module.exports = ParameterizedType;
