const _ = require('lodash');
const getValue = require('./index.js');

const SuperConstructorInvocation = node => {
    const expression = node.expression;
    const args = node.arguments;

    return (expression ? getValue(expression) + '.' : '') + 'super(' + _.map(args, getValue).join(', ') + ')';
};

module.exports = SuperConstructorInvocation;
