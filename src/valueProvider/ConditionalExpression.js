const getValue = require('./index.js');

const ConditionalExpression = node => {
    const {
        expression,
        thenExpression,
        elseExpression,
    } = node;

    return getValue(expression) + ' ? ' + getValue(thenExpression) + ' : ' + getValue(elseExpression);
};

module.exports = ConditionalExpression;
