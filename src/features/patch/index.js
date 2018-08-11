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
const getValue = require('../../valueProvider');

const createMethodInvocation = (patchMethodName, patchMethodType, invokee, args) => {
    return {
        name: {
            identifier: patchMethodName,
            node: "SimpleName",
        },
        expression: {
            identifier: patchMethodType,
            node: "SimpleName",
        },
        node: "MethodInvocation",
        "arguments": [
            invokee,
            ...args,
        ],
        typeArguments: [],
    };
};

const Patch = {
    setUp: config => {
        Typings.prepTypings();
    },

    accept: ({ current, parent, }) => {
        const accepted =
            (current.node === 'MethodDeclaration' && AST.hasAnnotation(current.modifiers, 'patch')) ||
            (current.node === 'MethodInvocation' && Typings.maybePatchMethod(current));
        return accepted;
    },

    run: ({ current, parent, root, config, }) => {
        if(current.node === 'MethodDeclaration') {
            if(!AST.hasModifier(current.modifiers, 'static')) {
                throw new Error('Patch method should be static');
            }

            if(!AST.hasModifier(current.modifiers, 'public') && !AST.hasModifier(current.modifiers, 'global')) {
                throw new Error('Patch method should be either public or global');
            }

            const annotation = AST.findAnnotation(current.modifiers, 'patch');
            if(!annotation.value) {
                throw new Error('Patch method should have a target type');
            }

            const params = current.parameters;
            if(_.isEmpty(params)) {
                throw new Error('Patch method should have at least one parameter');
            }

            const paramType = getValue(params[0].type);
            if(paramType !== getValue(annotation.value)) {
                throw new Error('The type of the first parameter in the patch method should match its patch type');
            }

            AST.removeChild(current, 'modifiers', annotation);
        }
        else {
            let patchInfo = Typings.findPatchInfo(current, config);

            if(!patchInfo) {
                return;
            }

            const patchMethodName = patchInfo.method.name;
            const patchMethodType = patchInfo.typeName;
            const invokee = current.expression;
            const args = current.arguments;

            const newNode = createMethodInvocation(patchMethodName, patchMethodType, invokee, args);
            AST.transform(current, newNode);
        }
    },
};

module.exports = Patch;
