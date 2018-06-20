const getValue = require('./index.js');

const CastExpression = node => {
    const {
        type,
        expression,
    } = node;

    return `(${getValue(type)})${getValue(expression)}`;
};

module.exports = CastExpression;
