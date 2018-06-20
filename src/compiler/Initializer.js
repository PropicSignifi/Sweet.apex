const _ = require('lodash');
const {
    addIndent,
    getModifiers,
} = require('../utils');
const compile = require('../compiler');

const Initializer = (node, context) => {
    const {
        body,
        modifiers,
    } = node;

    const {
        lines,
        indent,
    } = context;

    lines.push(addIndent(_.isEmpty(modifiers) ? '{' : getModifiers(modifiers) + '{', indent));

    compile(body, {
        lines,
        indent: indent + '    ',
    });

    lines.push(addIndent('}', indent));
};

module.exports = Initializer;
