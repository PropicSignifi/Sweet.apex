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
const getValue = require('../../valueProvider');
const Typings = require('../../typings');

const createMapType = () => {
    return {
        node: "ParameterizedType",
        type: {
            node: "SimpleType",
            name: {
                identifier: "Map",
                node: "SimpleName"
            }
        },
        typeArguments: [
            {
                node: "SimpleType",
                name: {
                    identifier: "String",
                    node: "SimpleName"
                }
            },
            {
                node: "SimpleType",
                name: {
                    identifier: "Object",
                    node: "SimpleName"
                }
            }
        ]
    };
};

const createListType = () => {
    return {
        node: "ParameterizedType",
        type: {
            node: "SimpleType",
            name: {
                identifier: "List",
                node: "SimpleName"
            }
        },
        typeArguments: [
            {
                node: "SimpleType",
                name: {
                    identifier: "Object",
                    node: "SimpleName"
                }
            }
        ]
    };
};

const ArrayCreation = {
    accept: ({ current, parent, }) => {
        const accepted =
            current.node === 'ArrayInitializer';
        return accepted;
    },

    run: ({ current, parent, root, config, }) => {
        if(current.parent.node !== 'ArrayCreation') {
            let typeNode = null;

            if(current.parent.node === 'VariableDeclarationFragment') {
                const declarationNode = AST.getParent(root, current.parent);
                if(!declarationNode || !declarationNode.type) {
                    throw new Error('Failed to find type info for array creation');
                }

                const typeName = getValue(declarationNode.type);
                if(typeName.startsWith('List<') || typeName.startsWith('Map<')) {
                    typeNode = _.cloneDeep(declarationNode.type);
                }
            }
            else if(current.parent.node === 'Assignment') {
                const typeName = Typings.checkType(current.parent.leftHandSide, config);
                typeNode = AST.parseType(typeName);
            }

            if(!typeNode) {
                const pair = _.first(current.expressions);
                if(pair && pair.node === 'ArrayMemberValuePair') {
                    typeNode = createMapType();
                }
                else {
                    typeNode = createListType();
                }
            }

            const initializerCopy = {
                node: 'ArrayInitializer',
                expressions: current.expressions,
            };

            const arrayCreationNode = {
                node: 'ArrayCreation',
                type: typeNode,
                initializer: initializerCopy,
                dimensions: [],
            };

            AST.transform(current, arrayCreationNode);
        }
    },
};

module.exports = ArrayCreation;
