const getValue = require('./index.js');

const ArrayType = node => {
    const {
        componentType,
    } = node;

    return `List<${getValue(componentType)}>`;
};

module.exports = ArrayType;
