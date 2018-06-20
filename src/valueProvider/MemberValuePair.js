const getValue = require('./index.js');

const MemberValuePair = node => {
    const {
        name,
        value,
    } = node;

    return `${getValue(name)}=${getValue(value)}`;
};

module.exports = MemberValuePair;
