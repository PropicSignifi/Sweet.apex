const _ = require('lodash');
const getValue = require('./index.js');
const compile = require('../compiler');

const LambdaExpression = node => {
    const {
        args,
        body,
    } = node;

    const lines = [];

    compile(body, {
        lines,
        indent: '    ',
    });
    return `(${_.map(args, getValue).join(', ')}) -> {\n${lines.join('\n')}\n}`;
};

module.exports = LambdaExpression;
