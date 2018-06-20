const getValue = require('./index.js');

const ParenthesizedExpression = node => {
    const {
        expression,
    } = node;

    return `(${getValue(expression)})`;
};

module.exports = ParenthesizedExpression;
