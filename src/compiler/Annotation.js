const _ = require('lodash');
const {
    addIndent,
} = require('../utils');
const getValue = require('../valueProvider');

const Annotation = (node, context) => {
    const {
        typeName,
        value,
        values,
    } = node;

    const {
        lines,
        indent,
    } = context;

    let ret = `@${getValue(typeName)}`;

    if(value) {
        ret += `(${getValue(value)})`;
    }

    if(values) {
        ret += `(${_.map(values, getValue).join(', ')})`;
    }

    lines.push(addIndent(ret, indent));
};

module.exports = Annotation;
