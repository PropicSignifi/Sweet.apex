const _ = require('lodash');

const StringLiteral = node => {
    const {
        escapedValue,
    } = node;

    return `'${_.slice(escapedValue, 1, escapedValue.length - 1).join('')}'`;
};

module.exports = StringLiteral;
