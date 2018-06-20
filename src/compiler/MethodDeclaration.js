const _ = require('lodash');
const {
    addAnnotations,
    getModifiers,
    addIndent,
} = require('../utils');
const getValue = require('../valueProvider');
const compile = require('../compiler');

const MethodDeclaration = (node, context) => {
    const {
        modifiers,
        returnType2,
        name,
        constructor,
        parameters,
        body,
    } = node;

    const {
        lines,
        indent,
    } = context;

    addAnnotations(lines, indent, modifiers);

    let line = getModifiers(modifiers);

    if(!constructor) {
        line += getValue(returnType2) + ' ';
    }

    line += getValue(name);
    line += '(';
    line += _.map(parameters, getValue).join(', ');
    line += ')';

    if(body) {
        line += ' {';
    }
    else {
        line += ';';
    }

    lines.push(addIndent(line, indent));

    if(body) {
        compile(body, {
            lines,
            indent: indent + '    ',
        });

        lines.push(addIndent('}', indent));
    }
};

module.exports = MethodDeclaration;
