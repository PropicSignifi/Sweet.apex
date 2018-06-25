const _ = require('lodash');
const AST = require('../../ast');
const getValue = require('../../valueProvider');

const Log = {
    accept: ({ current, parent, root, }) => {
        const accepted =
            current === AST.getTopLevelType(root) &&
            AST.hasAnnotation(current.modifiers, 'log');
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        const typeDeclaration = current;
        const annotation = AST.findAnnotation(typeDeclaration.modifiers, 'log');
        AST.removeChild(typeDeclaration, 'modifiers', annotation);

        const loggerCode = `public static final Log logger = Log.getLogger(${getValue(typeDeclaration.name)}.class);`;
        const newNodes = [
            AST.parseClassBodyDeclaration(loggerCode),
            AST.parseEmptyLine(),
        ];
        AST.prependChildren(typeDeclaration, 'bodyDeclarations', newNodes);
    },
};

module.exports = Log;
