const getValue = require('./index.js');

const Assignment = node => {
    const {
        operator,
        leftHandSide,
        rightHandSide,
    } = node;

    return `${getValue(leftHandSide)} ${operator} ${getValue(rightHandSide)}`;
};

module.exports = Assignment;
