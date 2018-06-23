const _ = require('lodash');
const AST = require('../../ast');

const ArrayCreation = {
    accept: ({ current, parent, }) => {
        const accepted =
            current.node === 'ArrayInitializer' &&
            parent.node === 'VariableDeclarationFragment';
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        const declarationNode = AST.getParent(root, parent);
        if(!declarationNode || !declarationNode.type) {
            throw new Error('Failed to find type info for array creation');
        }

        const typeNode = _.cloneDeep(declarationNode.type);
        const arrayCreationNode = {
            node: 'ArrayCreation',
            type: typeNode,
            initializer: current,
            dimensions: [],
        };

        AST.setChild(parent, 'initializer', arrayCreationNode);
    },
};

module.exports = ArrayCreation;
