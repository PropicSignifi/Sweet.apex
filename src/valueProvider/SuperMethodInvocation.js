const _ = require('lodash');
const getValue = require('./index.js');

const SuperMethodInvocation = node => {
    const {
        name,
        qualifier,
    } = node;
    const args = node.arguments;

    if(qualifier) {
        return `${qualifier}.super.${getValue(name)}(${_.map(args, getValue).join(', ')})`;
    }
    else {
        return `super.${getValue(name)}(${_.map(args, getValue).join(', ')})`;
    }
};

module.exports = SuperMethodInvocation;
