const _ = require('lodash');
const getValue = require('./index.js');

const Annotation = node => {
    const {
        typeName,
        value,
        values,
    } = node;

    if(value) {
        return `@${getValue(typeName)}(${getValue(value)})`;
    }

    if(values) {
        return `@${getValue(typeName)}(${_.map(values, getValue).join(', ')})`;
    }

    return `@${getValue(typeName)}`;
};

module.exports = Annotation;
