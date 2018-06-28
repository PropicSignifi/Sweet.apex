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
const {
    getModifiers,
    getImplementsInterfaces,
    addIndent,
    addBodyDeclarations,
} = require('../utils');
const getValue = require('../valueProvider');

const EnumDeclaration = (node, context) => {
    const {
        name,
        superInterfaceTypes,
        bodyDeclarations,
        enumConstants,
        modifiers,
    } = node;

    const {
        lines,
        indent,
    } = context;

    let line = getModifiers(modifiers);
    line += 'enum';
    line += ' ' + getValue(name);
    line += getImplementsInterfaces(superInterfaceTypes);
    line += ' {';

    lines.push(addIndent(line, indent));

    _.each(enumConstants, (enumConstant, index) => {
        const isLast = index === _.size(enumConstants) - 1;

        lines.push(addIndent(`    ${getValue(enumConstant)}${isLast ? '' : ','}`, indent));
    });

    addBodyDeclarations(lines, indent, bodyDeclarations);

    lines.push(addIndent('}', indent));
};

module.exports = EnumDeclaration;
