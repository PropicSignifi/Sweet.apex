const _ = require('lodash');
const getValue = require('./index.js');
const { getModifiers,  } = require('../utils');

const VariableDeclarationExpression = node => {
    const {
        modifiers,
        fragments,
        type,
    } = node;

    let line = getModifiers(modifiers);
    line += getValue(type);
    line += ' ' + _.map(fragments, getValue).join(', ');

    return line;
};

module.exports = VariableDeclarationExpression;
