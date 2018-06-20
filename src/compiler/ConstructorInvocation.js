const _ = require('lodash');
const {
    addIndent,
} = require('../utils');
const getValue = require('../valueProvider');

const ConstructorInvocation = (node, context) => {
    const args = node.arguments;

    const {
        lines,
        indent,
    } = context;

    lines.push(addIndent(`this(${_.map(args, getValue).join(', ')});`, indent));
};

module.exports = ConstructorInvocation;
