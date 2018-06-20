const getValue = require('./index.js');

const TypeParameter = node => {
    const {
        name,
    } = node;

    return getValue(name);
};

module.exports = TypeParameter;
