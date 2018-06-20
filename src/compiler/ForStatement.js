const _ = require('lodash');
const getValue = require('../valueProvider');
const {
    addIndent,
} = require('../utils');
const compile = require('../compiler');

const ForStatement = (node, context) => {
    const {
        initializers,
        expression,
        updaters,
        body,
    } = node;

    const {
        lines,
        indent,
    } = context;

    const init = _.map(initializers, getValue).join(', ');
    const expr = getValue(expression);
    const update = _.map(updaters, getValue).join(', ');

    lines.push(addIndent(`for(${init}; ${expr} ; ${update}) {`, indent));

    compile(body, {
        lines,
        indent: indent + '    ',
    });

    lines.push(addIndent(`}`, indent));
};

module.exports = ForStatement;
