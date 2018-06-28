/**
 * MIT License
 *
 * Copyright (c) 2018 Click to Cloud Pty Ltd
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 **/
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
