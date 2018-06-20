const _ = require('lodash');
const {
    addAnnotations,
    getModifiers,
    addIndent,
} = require('../utils');
const getValue = require('../valueProvider');

const VariableDeclarationStatement = (node, context) => {
    const {
        modifiers,
        type,
        fragments,
    } = node;

    const {
        lines,
        indent,
    } = context;

    addAnnotations(lines, indent, modifiers);

    let line = getModifiers(modifiers);
    line += getValue(type);
    line += ' ';
    line += _.map(fragments, getValue).join(', ');
    line += ';';

    lines.push(addIndent(line, indent));
};

module.exports = VariableDeclarationStatement;
