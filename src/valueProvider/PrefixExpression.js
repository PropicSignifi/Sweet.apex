const _ = require('lodash');
const getValue = require('./index.js');

const PrefixExpression = node => {
    const {
        operator,
        operand,
    } = node;

    if(_.isString(operator)) {
        return operator + getValue(operand);
    }
    else {
        return getValue(operator) + ' ' + getValue(operand);
    }
};

module.exports = PrefixExpression;
