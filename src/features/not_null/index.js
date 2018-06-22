const _ = require('lodash');
const AST = require('../../ast');
const getValue = require('../../valueProvider');

const NotNull = {
    accept: ({ current, parent, root, }) => {
        const methodDeclaration = AST.getParent(root, parent);

        const passed = parent.node === 'SingleVariableDeclaration' &&
            current.node === 'Annotation' &&
            getValue(current.typeName) === 'notNull' &&
            methodDeclaration !== null &&
            methodDeclaration.node === 'MethodDeclaration' &&
            (!!methodDeclaration.body);

        return passed;
    },

    groupBy: ({ parent, root, }) => {
        const methodDeclaration = AST.getParent(root, parent);
        return AST.getMethodSignature(methodDeclaration);
    },

    runGroup: group => {
        const newBlockStatements = [];
        let methodDeclaration = null;

        _.each(group, ({ current, parent, root, }) => {
            if(!methodDeclaration) {
                methodDeclaration = AST.getParent(root, parent);
            }

            const typeDeclaration = AST.getParent(root, methodDeclaration);
            const paramName = getValue(parent.name);

            const content = `Sweet.assertNotNull(${paramName}, '"${paramName}" in ${AST.getMethodSignature(methodDeclaration, typeDeclaration)} should not be null');`;
            const newBlockStatement = AST.parseBlockStatement(content);

            newBlockStatements.push(newBlockStatement);

            _.pull(parent.modifiers, current);
        });

        newBlockStatements.push(AST.parseBlockStatement('\n'));

        methodDeclaration.body.statements = [
            ...newBlockStatements,
            ...methodDeclaration.body.statements,
        ];
    },
};

module.exports = NotNull;
