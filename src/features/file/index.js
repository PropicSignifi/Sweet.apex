const _ = require('lodash');
const AST = require('../../ast');

const File = {
    accept: ({ current, parent, }) => {
        const accepted =
            (current.node === 'VariableDeclarationStatement' || current.node === 'FieldDeclaration') &&
            AST.hasAnnotation(current.modifiers, 'file');
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        const variableDeclarationStatement = current;
        const annotation = AST.findAnnotation(variableDeclarationStatement.modifiers, 'file');
        const annotationValue = AST.getAnnotationValue(annotation);
        const filename = _.isPlainObject(annotationValue) ? annotationValue.name : annotationValue;

        const newNode = {
            name: {
                identifier: "readFile",
                node: "SimpleName",
            },
            expression: {
                identifier: "Sweet",
                node: "SimpleName",
            },
            node: "MethodInvocation",
            'arguments': [
                {
                    node: "StringLiteral",
                    escapedValue: filename,
                }
            ],
            typeArguments: [],
        };

        AST.removeChild(variableDeclarationStatement, 'modifiers', annotation);

        _.each(variableDeclarationStatement.fragments, fragment => {
            AST.setChild(fragment, 'initializer', _.cloneDeep(newNode));
        });
    },
};

module.exports = File;
