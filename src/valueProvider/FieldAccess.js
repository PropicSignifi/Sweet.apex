const getValue = require('./index.js');

const FieldAccess = node => {
    const {
        name,
        expression,
    } = node;

    return `${getValue(expression)}.${getValue(name)}`;
};

module.exports = FieldAccess;
