const _ = require('lodash');
const {
    addIndent,
} = require('../utils');
const compile = require('../compiler');

const TryStatement = (node, context) => {
    const {
        body,
        catchClauses,
    } = node;
    const finallyClause = node.finally;

    const {
        lines,
        indent,
    } = context;

    lines.push(addIndent(`try {`, indent));

    compile(body, {
        lines,
        indent: indent + '    ',
    });

    lines.push(addIndent(`}`, indent));

    _.each(catchClauses, catchClause => {
        compile(catchClause, {
            lines,
            indent,
        });
    });

    if(finallyClause) {
        lines.push(addIndent(`finally {`, indent));

        compile(finallyClause, {
            lines,
            indent: indent + '    ',
        });

        lines.push(addIndent(`}`, indent));
    }
};

module.exports = TryStatement;
