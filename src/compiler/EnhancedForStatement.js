const {
    addIndent,
} = require('../utils');
const getValue = require('../valueProvider');
const compile = require('../compiler');

const EnhancedForStatement = (node, context) => {
    const {
        parameter,
        expression,
        body,
    } = node;

    const {
        lines,
        indent,
    } = context;

    lines.push(addIndent(`for(${getValue(parameter)} : ${getValue(expression)}) {`, indent));

    compile(body, {
        lines,
        indent: indent + '    ',
    });

    lines.push(addIndent(`}`, indent));
};

module.exports = EnhancedForStatement;
