const _ = require('lodash');
const {
    addIndent,
} = require('../utils');
const getValue = require('../valueProvider');

const SuperConstructorInvocation = (node, context) => {
    const expression = node.expression;
    const args = node.arguments;

    const {
        lines,
        indent,
    } = context;

    if(expression) {
        lines.push(addIndent(`${getValue(expression)}.super(${_.map(args, getValue).join(', ')});`, indent));
    }
    else {
        lines.push(addIndent(`super(${_.map(args, getValue).join(', ')});`, indent));
    }
};

module.exports = SuperConstructorInvocation;
