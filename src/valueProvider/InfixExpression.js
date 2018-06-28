const _ = require('lodash');
const getValue = require('./index.js');

const InfixExpression = node => {
    const {
        operator,
        leftOperand,
        rightOperand,
    } = node;

    if(_.isEmpty(operator)) {
        return getValue(leftOperand) + ' instanceof ' + getValue(rightOperand);
    }
    else if(_.isString(operator)) {
        return getValue(leftOperand) + ' ' + operator + ' ' + getValue(rightOperand);
    }
    else {
        return getValue(leftOperand) + ' ' + getValue(operator) + ' ' + getValue(rightOperand);
    }
};

module.exports = InfixExpression;
