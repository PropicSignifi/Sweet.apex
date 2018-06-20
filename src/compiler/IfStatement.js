const {
    addIndent,
} = require('../utils');
const getValue = require('../valueProvider');
const compile = require('../compiler');

const IfStatement = (node, context) => {
    const {
        expression,
        thenStatement,
        elseStatement,
    } = node;

    const {
        lines,
        indent,
    } = context;

    lines.push(addIndent(`if(${getValue(expression)}) {`, indent));

    compile(thenStatement, {
        lines,
        indent: indent + '    ',
    });

    if(elseStatement) {
        lines.push(addIndent(`} else {`, indent));

        compile(elseStatement, {
            lines,
            indent: indent + '    ',
        });
    }

    lines.push(addIndent(`}`, indent));
};

module.exports = IfStatement;
