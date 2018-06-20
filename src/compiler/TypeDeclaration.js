const {
    addComments,
    addAnnotations,
    getModifiers,
    getTypeParameters,
    getExtendsSuperClass,
    getImplementsInterfaces,
    addIndent,
    addBodyDeclarations,
} = require('../utils');
const getValue = require('../valueProvider');

const TypeDeclaration = (node, context) => {
    const {
        name,
        superInterfaceTypes,
        superclassType,
        bodyDeclarations,
        typeParameters,
        interface,
        modifiers,
        comments,
    } = node;

    const {
        lines,
        indent,
    } = context;

    addComments(lines, indent, comments);

    addAnnotations(lines, indent, modifiers);

    let line = getModifiers(modifiers);
    line += interface ? 'interface' : 'class';
    line += ' ' + getValue(name);
    line += getTypeParameters(typeParameters);
    line += getExtendsSuperClass(superclassType);
    line += getImplementsInterfaces(superInterfaceTypes);
    line += ' {';

    lines.push(addIndent(line, indent));

    addBodyDeclarations(lines, indent, bodyDeclarations);

    lines.push(addIndent('}', indent));
};

module.exports = TypeDeclaration;
