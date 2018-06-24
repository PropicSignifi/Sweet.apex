const _ = require('lodash');
const {
    addIndent,
} = require('../utils');
const getValue = require('../valueProvider');
const compile = require('../compiler');

const SwitchStatement = (node, context) => {
    const {
        expression,
        statements,
    } = node;

    const {
        lines,
        indent,
    } = context;

    lines.push(addIndent(`switch(${getValue(expression)}) {`, indent));

    _.each(statements, statement => {
        compile(statement, {
            lines,
            indent: statement.node === 'SwitchCase' ? indent + '    ' : indent + '        ',
        });
    });

    lines.push(addIndent(`}`, indent));
};

module.exports = SwitchStatement;
