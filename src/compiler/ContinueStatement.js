const {
    addIndent,
} = require('../utils');

const ContinueStatement = (node, context) => {
    const {
        lines,
        indent,
    } = context;

    lines.push(addIndent(`continue;`, indent));
};

module.exports = ContinueStatement;
