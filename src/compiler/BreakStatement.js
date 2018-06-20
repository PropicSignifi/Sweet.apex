const {
    addIndent,
} = require('../utils');

const BreakStatement = (node, context) => {
    const {
        lines,
        indent,
    } = context;

    lines.push(addIndent(`break;`, indent));
};

module.exports = BreakStatement;
