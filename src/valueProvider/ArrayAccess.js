const getValue = require('./index.js');

const ArrayAccess = node => {
    const {
        array,
        index,
    } = node;

    return `${getValue(array)}[${getValue(index)}]`;
};

module.exports = ArrayAccess;
