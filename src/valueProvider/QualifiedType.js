const getValue = require('./index.js');

const QualifiedType = node => {
    const {
        name,
        qualifier,
    } = node;

    return `${getValue(qualifier)}.${getValue(name)}`;
};

module.exports = QualifiedType;
