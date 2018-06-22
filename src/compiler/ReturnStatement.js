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

    if(expression) {
        lines.push(addIndent('return ' + getValue(expression) + ';', indent));
    }
    else {
        lines.push(addIndent('return;', indent));
    }
};

module.exports = ReturnStatement;
