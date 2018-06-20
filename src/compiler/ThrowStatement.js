const {
    addIndent,
} = require('../utils');
const getValue = require('../valueProvider');

const ThrowStatement = (node, context) => {
    const {
        expression,
    } = node;

    const {
        lines,
        indent,
    } = context;

    lines.push(addIndent(`throw ${getValue(expression)};`, indent));
};

module.exports = ThrowStatement;
