const _ = require('lodash');
const compile = require('../compiler');

const Block = (node, context) => {
    const {
        statements,
    } = node;

    const {
        lines,
        indent,
    } = context;

    _.each(statements, statement => {
        compile(statement, {
            lines,
            indent,
        });
    });
};

module.exports = Block;
