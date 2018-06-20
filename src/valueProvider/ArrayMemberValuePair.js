const getValue = require('./index.js');

const ArrayMemberValuePair = node => {
    const {
        name,
        value,
    } = node;

    return `${getValue(name)} => ${getValue(value)}`;
};

module.exports = ArrayMemberValuePair;
