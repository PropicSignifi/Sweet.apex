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
const Typings = require('../../typings');

const createList = (type, values) => {
    return {
        node: "ArrayCreation",
        type: {
            node: "ParameterizedType",
            type: {
                node: "SimpleType",
                name: {
                    identifier: "List",
                    node: "SimpleName",
                },
            },
            typeArguments: [
                type,
            ],
        },
        initializer: {
            node: "ArrayInitializer",
            expressions: values,
        },
        dimensions: []
    };
};

const createListType = type => {
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
            type,
        ]
    };
};

const Varargs = {
    setUp: config => {
        Typings.prepTypings();
    },

    accept: ({ current, parent, }) => {
        const accepted =
            (current.node === 'MethodDeclaration' && Typings.hasVarargsInMethod(current)) ||
            (current.node === 'MethodInvocation' && Typings.maybeVarargsMethod(current));
        return accepted;
    },

    run: ({ current, parent, root, config, }) => {
        if(current.node === 'MethodDeclaration') {
            const methodSignature = AST.getMethodSignature(current, parent);

            const numOfVarargs = _.chain(current.parameters)
                .filter(param => param.varargs)
                .size()
                .value();
            if(numOfVarargs > 1) {
                throw new Error(`Only one varargs is supported in ${methodSignature}`);
            }

            const varargsIndex = _.findIndex(current.parameters, param => param.varargs);
            if(varargsIndex !== _.size(current.parameters) - 1) {
                throw new Error(`Varargs should be the last parameter in ${methodSignature}`);
            }

            const varargsParam = _.find(current.parameters, param => param.varargs);
            varargsParam.varargs = false;

            AST.setChild(varargsParam, 'type', createListType(varargsParam.type));
        }
        else {
            let matchedVarargsMethod = Typings.findVarargsMethod(current, config);

            if(!matchedVarargsMethod) {
                return;
            }

            const varargsIndex = _.findIndex(matchedVarargsMethod.parameters, param => param.varargs);
            const collectedArgs = _.slice(current.arguments, varargsIndex);

            _.each(collectedArgs, arg => {
                AST.removeChild(current, 'arguments', arg);
            });

            const varargsParamElementType = AST.parseType(matchedVarargsMethod.parameters[varargsIndex].type);
            const newArg = createList(varargsParamElementType, collectedArgs);
            AST.appendChild(current, 'arguments', newArg);
        }
    },
};

module.exports = Varargs;
