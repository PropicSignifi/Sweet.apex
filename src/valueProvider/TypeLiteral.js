const _ = require('lodash');
const getValue = require('./index.js');
const { getTypeParameters, } = require('../utils');

const TypeLiteral = node => {
    const {
        type,
        typeArguments,
    } = node;

    if(!_.isEmpty(typeArguments)) {
        return `${getValue(type)}${getTypeParameters(typeArguments)}.class`;
    }
    else {
        return `${getValue(type)}.class`;
    }
};

module.exports = TypeLiteral;
