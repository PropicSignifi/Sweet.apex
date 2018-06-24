const _ = require('lodash');
const AST = require('../../ast');
const getValue = require('../../valueProvider');

const DefaultValue = {
    accept: ({ current, parent, root, }) => {
        const methodDeclaration = AST.getParent(root, parent);

        const passed = parent.node === 'SingleVariableDeclaration' &&
            current.node === 'Annotation' &&
            getValue(current.typeName) === 'defaultValue' &&
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

            if(!current.value) {
                throw new Error('Default value is not set for @defaultValue');
            }

            const paramName = getValue(parent.name);

            const content = `${paramName} = (${paramName} == null) ? ${getValue(current.value)} : ${paramName};`;
            const newBlockStatement = AST.parseBlockStatement(content);

            newBlockStatements.push(newBlockStatement);

            AST.removeChild(parent, 'modifiers', current);
        });

        newBlockStatements.push(AST.parseBlockStatement('\n'));

        AST.prependChildren(methodDeclaration.body, 'statements', newBlockStatements);
    },
};

module.exports = DefaultValue;
