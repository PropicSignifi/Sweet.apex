const getValue = require('./index.js');

const ArrowCastExpression = node => {
    const {
        toType,
        expression,
    } = node;

    return `(${getValue(toType)})${getValue(expression)}`;
};

module.exports = ArrowCastExpression;
