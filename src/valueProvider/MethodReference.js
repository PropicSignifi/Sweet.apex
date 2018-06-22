const getValue = require('./index.js');

const MethodReference = node => {
    const clazz = node['class'];
    const method = node.method;

    return `${getValue(clazz)}::${getValue(method)}`;
};

module.exports = MethodReference;
