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

const File = {
    accept: ({ current, parent, }) => {
        const accepted =
            (current.node === 'VariableDeclarationStatement' || current.node === 'FieldDeclaration') &&
            AST.hasAnnotation(current.modifiers, 'file');
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        const variableDeclarationStatement = current;
        const annotation = AST.findAnnotation(variableDeclarationStatement.modifiers, 'file');
        const annotationValue = AST.getAnnotationValue(annotation);
        const filename = _.isPlainObject(annotationValue) ? annotationValue.name : annotationValue;

        const newNode = {
            name: {
                identifier: "readFile",
                node: "SimpleName",
            },
            expression: {
                identifier: "Sweet",
                node: "SimpleName",
            },
            node: "MethodInvocation",
            'arguments': [
                {
                    node: "StringLiteral",
                    escapedValue: filename,
                }
            ],
            typeArguments: [],
        };

        AST.removeChild(variableDeclarationStatement, 'modifiers', annotation);

        _.each(variableDeclarationStatement.fragments, fragment => {
            AST.setChild(fragment, 'initializer', _.cloneDeep(newNode));
        });
    },
};

module.exports = File;
