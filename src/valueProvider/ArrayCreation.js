const getValue = require('./index.js');

const ArrayCreation = node => {
    const {
        type,
        initializer,
    } = node;

    return `new ${getValue(type)}{ ${getValue(initializer)} }`;
};

module.exports = ArrayCreation;
