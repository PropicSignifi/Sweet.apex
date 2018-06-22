const AST = require('../../ast');

const Mod = {
    accept: ({ current, parent, }) => {
        const accepted =
            current.node === 'InfixExpression' &&
            current.operator === '%';
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        const newNode = {
            name: {
                identifier: "mod",
                node: "SimpleName",
            },
            expression: {
                identifier: "Math",
                node: "SimpleName",
            },
            node: "MethodInvocation",
            arguments: [
                current.leftOperand,
                current.rightOperand,
            ],
            typeArguments: [],
        };

        AST.transform(current, newNode);
    },
};

module.exports = Mod;
