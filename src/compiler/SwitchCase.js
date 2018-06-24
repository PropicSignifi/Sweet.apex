const {
    addIndent,
} = require('../utils');
const getValue = require('../valueProvider');

const SwitchCase = (node, context) => {
    const {
        expression,
    } = node;

    const {
        lines,
        indent,
    } = context;

    if(expression) {
        lines.push(addIndent(`case ${getValue(expression)}:`, indent));
    }
    else {
        lines.push(addIndent(`default:`, indent));
    }
};

module.exports = SwitchCase;
