const getValue = require('../valueProvider');
const {
    addIndent,
} = require('../utils');

const ExpressionStatement = (node, context) => {
    const {
        expression,
    } = node;

    const {
        lines,
        indent,
    } = context;

    lines.push(addIndent(`${getValue(expression)};`, indent));
};

module.exports = ExpressionStatement;
