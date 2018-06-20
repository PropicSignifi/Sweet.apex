const getValue = require('./index.js');
const { getModifiers, } = require('../utils');

const SingleVariableDeclaration = node => {
    const {
        type,
        modifiers,
        varargs,
        name,
    } = node;

    let line = getModifiers(modifiers);
    line += getValue(type);
    line += ' ' + getValue(name);
    if(varargs) {
        line += ' ...';
    }

    return line;
};

module.exports = SingleVariableDeclaration;
