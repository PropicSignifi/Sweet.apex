const getValue = require('./index.js');

const PostfixExpression = node => {
    const {
        operator,
        operand,
    } = node;

    return getValue(operand) + operator;
};

module.exports = PostfixExpression;
