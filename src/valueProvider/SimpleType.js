const getValue = require('./index.js');

const SimpleType = node => {
    const {
        name,
    } = node;

    return getValue(name);
};

module.exports = SimpleType;
