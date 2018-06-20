const _ = require('lodash');
const compile = require('../compiler');
const { getModifiers,  } = require('../utils');

const AccessorDeclarationFragment = node => {
    const {
        setter,
        getter,
    } = node;

    const lines = [];

    lines.push('{');

    if(setter) {
        const modifiers = getModifiers(setter.modifiers);

        if(setter.body) {
            const setterLines = [];
            compile(setter.body, {
                lines: setterLines,
                indent: '',
            });

            lines.push(`    ${modifiers}set {`);
            _.each(setterLines, setterLine => {
                lines.push(`        ${setterLine}`);
            });
            lines.push(`    }`);
        }
        else {
            lines.push(`    ${modifiers}set;`);
        }
    }

    if(getter) {
        if(setter) {
            lines.push(``);
        }

        const modifiers = getModifiers(getter.modifiers);

        if(getter.body) {
            const getterLines = [];
            compile(getter.body, {
                lines: getterLines,
                indent: '',
            });

            lines.push(`    ${modifiers}get {`);
            _.each(getterLines, getterLine => {
                lines.push(`        ${getterLine}`);
            });
            lines.push(`    }`);
        }
        else {
            lines.push(`    ${modifiers}get;`);
        }
    }

    lines.push('}');

    return lines;
};

module.exports = AccessorDeclarationFragment;
