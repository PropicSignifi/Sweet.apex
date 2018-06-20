const getValue = require('./index.js');

const VariableDeclarationFragment = node => {
    const {
        name,
        initializer,
        accessor,
    } = node;

    if(initializer) {
        return `${getValue(name)} = ${getValue(initializer)}`;
    }
    else if(accessor) {
        return `${getValue(name)} ${getValue(accessor).join('\n')}`;
    }
    else {
        return `${getValue(name)}`;
    }
};

module.exports = VariableDeclarationFragment;
