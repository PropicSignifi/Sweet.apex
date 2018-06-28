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
const AST = require('../../ast');

const TemplateString = {
    accept: ({ current, parent, }) => {
        const accepted =
            current.node === 'TemplateStringLiteral';
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        let templateString = current.escapedValue.substring(1, current.escapedValue.length - 1);
        templateString = templateString.replace(/(?:\r\n|\r|\n)/g, '\\n');
        const items = [];
        let startIndex = 0;
        let endIndex = 0;
        while(true) {
            startIndex = templateString.indexOf('${', endIndex);
            if(startIndex < 0) {
                items.push("'" + templateString.substring(endIndex, templateString.length) + "'");
                break;
            }

            items.push("'" + templateString.substring(endIndex, startIndex) + "'");

            endIndex = templateString.indexOf('}', startIndex);
            if(endIndex < 0) {
                throw new Error('Invalid template string');
            }

            items.push(templateString.substring(startIndex + 2, endIndex));

            endIndex += 1;
        }

        const line = _.join(items, ' + ');
        const newNode = AST.parseExpression(line);
        AST.transform(current, newNode);
    },
};

module.exports = TemplateString;
