const getValue = require('./index.js');

const QualifiedName = node => {
    const {
        qualifier,
        name,
    } = node;

    return getValue(qualifier) + '.' + getValue(name);
};

module.exports = QualifiedName;
