const {
    addIndent,
} = require('../utils');
const getValue = require('../valueProvider');
const compile = require('../compiler');

const CatchClause = (node, context) => {
    const {
        body,
        exception,
    } = node;

    const {
        lines,
        indent,
    } = context;

    lines.push(addIndent(`catch(${getValue(exception)}) {`, indent));

    compile(body, {
        lines,
        indent: indent + '    ',
    });

    lines.push(addIndent(`}`, indent));
};

module.exports = CatchClause;
