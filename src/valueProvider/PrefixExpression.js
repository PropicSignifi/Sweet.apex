const getValue = require('./index.js');

const PrefixExpression = node => {
    const {
        operator,
        operand,
    } = node;

    return operator + getValue(operand);
};

module.exports = PrefixExpression;
