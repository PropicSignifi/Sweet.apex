const _ = require('lodash');
const getValue = require('./index.js');

const ConstructorInvocation = node => {
    return _.map(node.arguments, getValue).join(', ');
};

module.exports = ConstructorInvocation;
