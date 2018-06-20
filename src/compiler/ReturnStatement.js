const {
    addIndent,
} = require('../utils');

const getValue = require('../valueProvider');

const ReturnStatement = (node, context) => {
    const {
        expression,
    } = node;

    const {
        lines,
        indent,
    } = context;

    lines.push(addIndent('return ' + getValue(expression) + ';', indent));
};

module.exports = ReturnStatement;
