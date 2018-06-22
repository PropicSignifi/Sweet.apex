const getValue = require('./index.js');
const { getModifiers, getAnnotations, } = require('../utils');

const SingleVariableDeclaration = node => {
    const {
        type,
        modifiers,
        varargs,
        name,
    } = node;

    let line = getAnnotations(modifiers);
    line += getModifiers(modifiers);
    line += getValue(type);
    line += ' ' + getValue(name);
    if(varargs) {
        line += ' ...';
    }

    return line;
};

module.exports = SingleVariableDeclaration;
