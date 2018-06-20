const _ = require('lodash');
const getValue = require('./index.js');
const { getTypeParameters, } = require('../utils');

const ClassInstanceCreation = node => {
    const {
        type,
        typeArguments,
    } = node;
    const args = node.arguments;

    return `new ${getValue(type)}${getTypeParameters(typeArguments)}(${_.map(args, getValue).join(', ')})`;
};

module.exports = ClassInstanceCreation;
