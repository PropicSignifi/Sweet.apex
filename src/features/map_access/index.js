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
const _ = require('lodash');

const getMapGet = current => {
    return {
        name: {
            identifier: "get",
            node: "SimpleName"
        },
        expression: _.cloneDeep(current.array),
        node: "MethodInvocation",
        "arguments": [
            _.cloneDeep(current.index),
        ],
        typeArguments: []
    };
};

const getMapPut = (current, node, operator) => {
    return {
        name: {
            identifier: "put",
            node: "SimpleName"
        },
        expression: _.cloneDeep(current.array),
        node: "MethodInvocation",
        "arguments": [
            _.cloneDeep(current.index),
            {
                node: "InfixExpression",
                operator,
                leftOperand: {
                    name: {
                        identifier: "get",
                        node: "SimpleName"
                    },
                    expression: _.cloneDeep(current.array),
                    node: "MethodInvocation",
                    "arguments": [
                        _.cloneDeep(current.index),
                    ],
                    typeArguments: []
                },
                rightOperand: node
            }
        ],
        typeArguments: []
    };
};

const getUnit = () => {
    return {
        node: "NumberLiteral",
        token: "1"
    };
};

const MapAccess = {
    accept: ({ current, parent, config, }) => {
        if(current.node === 'ArrayAccess') {
            const type = Typings.checkType(current.array, config);
            return _.toUpper(type).startsWith('MAP<');
        }

        return false;
    },

    run: ({ current, parent, root, }) => {
        if((parent.node === 'PostfixExpression' || parent.node === 'PrefixExpression') &&
            (parent.operator === '++' || parent.operator === '--')) {
            let operator = parent.operator.substring(0, 1);
            const newNode = getMapPut(current, getUnit(), operator);
            AST.transform(parent, newNode);
        }
        else if(parent.node === 'Assignment' && parent.leftHandSide === current) {
            let operator = parent.operator.substring(0, parent.operator.length - 1);
            const newNode = getMapPut(current, parent.rightHandSide, operator);
            AST.transform(parent, newNode);
        }
        else {
            const newNode = getMapGet(current);
            AST.transform(current, newNode);
        }
    },
};

module.exports = MapAccess;
