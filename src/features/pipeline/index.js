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
const AST = require('../../ast');
const Typings = require('../../typings');

const Pipeline = {
    accept: ({ current, parent, }) => {
        const accepted =
            (current.node === 'InfixExpression' &&
                current.operator === '|>') ||
            (current.node === 'VariableDeclarationFragment' &&
                current.initializer &&
                current.initializer.node === 'InfixExpression' &&
                current.initializer.operator === '|>') ||
            (current.node === 'Assignment' &&
                current.rightHandSide.node === 'InfixExpression' &&
                current.rightHandSide.operator === '|>');
        return accepted;
    },

    run: ({ current, parent, root, config, }) => {
        if(current.node === 'InfixExpression') {
            const newNode = {
                node: "MethodInvocation",
                "arguments": [
                    current.leftOperand,
                ],
                name: {
                    identifier: "run",
                    node: "SimpleName"
                },
                typeArguments: [],
                expression: {
                    node: "ParenthesizedExpression",
                    expression: {
                        node: "CastExpression",
                        type: {
                            node: "SimpleType",
                            name: {
                                identifier: "Func",
                                node: "SimpleName"
                            }
                        },
                        expression: current.rightOperand,
                    }
                }
            };

            AST.transform(current, newNode);
        }
        else if(current.node === 'VariableDeclarationFragment') {
            const type = parent.type;
            const newNode = {
                node: "CastExpression",
                type,
                expression: current.initializer,
            };

            AST.setChild(current, 'initializer', newNode);
        }
        else if(current.node === 'Assignment') {
            const typeName = Typings.checkType(current.leftHandSide, config);
            const type = AST.parseType(typeName);

            const newNode = {
                node: "CastExpression",
                type,
                expression: current.rightHandSide,
            };

            AST.setChild(current, 'rightHandSide', newNode);
        }
    },
};

module.exports = Pipeline;
