const _ = require('lodash');
const {
    addAnnotations,
    getModifiers,
    addIndent,
} = require('../utils');
const getValue = require('../valueProvider');

const FieldDeclaration = (node, context) => {
    const {
        type,
        modifiers,
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
    const lastFragment = _.last(fragments);
    if(lastFragment && lastFragment.node === 'VariableDeclarationFragment' && !lastFragment.accessor) {
        line += ';';
    }

    lines.push(addIndent(line, indent));
};

module.exports = FieldDeclaration;
