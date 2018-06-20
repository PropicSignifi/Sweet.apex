const _ = require('lodash');
const {
    getModifiers,
    getImplementsInterfaces,
    addIndent,
    addBodyDeclarations,
} = require('../utils');
const getValue = require('../valueProvider');

const EnumDeclaration = (node, context) => {
    const {
        name,
        superInterfaceTypes,
        bodyDeclarations,
        enumConstants,
        modifiers,
    } = node;

    const {
        lines,
        indent,
    } = context;

    let line = getModifiers(modifiers);
    line += 'enum';
    line += ' ' + getValue(name);
    line += getImplementsInterfaces(superInterfaceTypes);
    line += ' {';

    lines.push(addIndent(line, indent));

    _.each(enumConstants, (enumConstant, index) => {
        const isLast = index === _.size(enumConstants) - 1;

        lines.push(addIndent(`    ${getValue(enumConstant)}${isLast ? '' : ','}`, indent));
    });

    addBodyDeclarations(lines, indent, bodyDeclarations);

    lines.push(addIndent('}', indent));
};

module.exports = EnumDeclaration;
