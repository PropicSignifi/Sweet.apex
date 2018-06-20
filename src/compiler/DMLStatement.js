const {
    addIndent,
} = require('../utils');
const getValue = require('../valueProvider');

const DMLStatement = (node, context) => {
    const {
        operator,
        operand,
    } = node;

    const {
        lines,
        indent,
    } = context;

    line = operator + ' ' + getValue(operand) + ';';

    lines.push(addIndent(line, indent));
};

module.exports = DMLStatement;
