const {
    addIndent,
} = require('../utils');
const getValue = require('../valueProvider');
const compile = require('../compiler');

const BlockExpressionStatement = (node, context) => {
    const {
        expression,
        body,
    } = node;

    const {
        lines,
        indent,
    } = context;

    lines.push(addIndent(`${getValue(expression)} {`, indent));

    compile(body, {
        lines,
        indent: indent + '    ',
    });

    lines.push(addIndent(`}`, indent));
};

module.exports = BlockExpressionStatement;
