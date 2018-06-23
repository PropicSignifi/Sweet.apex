const {
    addIndent,
} = require('../utils');
const getValue = require('../valueProvider');

const DMLStatement = (node, context) => {
    const {
        operator,
        operand,
        rest,
    } = node;

    const {
        lines,
        indent,
    } = context;

    line = operator + ' ' + getValue(operand);

    if(rest) {
        line += ' ' + getValue(rest);
    }

    line += ';';

    lines.push(addIndent(line, indent));
};

module.exports = DMLStatement;
