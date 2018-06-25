const _ = require('lodash');
const AST = require('../../ast');
const getValue = require('../../valueProvider');

const Rethrow = {
    accept: ({ current, parent, }) => {
        const accepted =
            current.node === 'MethodDeclaration' &&
            AST.hasAnnotation(current.modifiers, 'rethrow');
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        const annotation = AST.findAnnotation(current.modifiers, 'rethrow');
        if(!annotation.value) {
            throw new Error('value is required for @rethrow');
        }

        const rethrowException = getValue(annotation.value);

        const newCode = `try {
        }
        catch(Exception e) {
            System.debug(LoggingLevel.Error, e.getStackTraceString());
            throw new ${rethrowException}(e.getMessage());
        }`;

        const newNode = AST.parseBlockStatement(newCode);
        newNode.body.statements = [
            ...current.body.statements
        ];

        AST.removeChildren(current.body, 'statements');
        AST.appendChild(current.body, 'statements', newNode);
        AST.removeChild(current, 'modifiers', annotation);
    },
};

module.exports = Rethrow;
