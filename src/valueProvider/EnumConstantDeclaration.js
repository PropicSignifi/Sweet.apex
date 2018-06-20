const _ = require('lodash');
const getValue = require('./index.js');

const EnumConstantDeclaration = node => {
    const name = node.name;
    const args = node.arguments;

    if(_.isEmpty(args)) {
        return `${getValue(name)}`;
    }
    else {
        return `${getValue(name)}(${_.map(args, getValue).join(', ')})`;
    }
};

module.exports = EnumConstantDeclaration;
