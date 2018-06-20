const compile = require('../compiler');

const TypeDeclarationStatement = (node, context) => {
    const {
        declaration,
    } = node;

    const {
        lines,
        indent,
    } = context;

    compile(declaration, {
        lines,
        indent: indent + '    ',
    });
};

module.exports = TypeDeclarationStatement;
