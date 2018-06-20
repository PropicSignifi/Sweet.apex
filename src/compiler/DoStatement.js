const {
    addIndent,
} = require('../utils');
const compile = require('../compiler');
const getValue = require('../valueProvider');

const DoStatement = (node, context) => {
    const {
        expression,
        body,
    } = node;

    const {
        lines,
        indent,
    } = context;

    lines.push(addIndent(`do {`, indent));

    compile(body, {
        lines,
        indent: indent + '    ',
    });

    lines.push(addIndent(`} while(${getValue(expression)});`, indent));
};

module.exports = DoStatement;
