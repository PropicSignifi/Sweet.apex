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

const ImportStatic = {
    accept: ({ current, parent, }) => {
        const accepted =
            current.node === 'CompilationUnit' ||
            (current.node === 'SimpleName' && current.isIdentifier) ||
            (current.node === 'MethodInvocation' && !current.expression);
        return accepted;
    },

    run: ({ current, parent, root, config, }) => {
        if(current.node === 'CompilationUnit') {
            const topLevelType = AST.getTopLevelType(current);
            _.chain(current.imports)
                .filter({ 'static': true })
                .each(i => {
                    Typings.addStaticTypingName(getValue(topLevelType.name), getValue(i.name));
                })
                .value();
        }
        else if(current.node === 'SimpleName') {
            const topLevelType = AST.getTopLevelType(root);

            try {
                Typings.checkType(current, config);
            }
            catch(e) {
                const typingNames = Typings.getStaticTypingNames(getValue(topLevelType.name));
                const variableName = getValue(current);
                let matchedTypingName = null;
                for(let typingName of typingNames) {
                    const typing = Typings.lookup(typingName, null, config);
                    if(Typings.getVariableType(typing, variableName, config)) {
                        matchedTypingName = typingName;
                        break;
                    }
                }

                if(matchedTypingName) {
                    const newNode = AST.parseExpression(`${matchedTypingName}.${variableName}`);

                    AST.transform(current, newNode);
                }
                else {
                    throw e;
                }
            }
        }
        else {
            const topLevelType = AST.getTopLevelType(root);

            try {
                Typings.checkType(current, config);
            }
            catch(e) {
                const typingNames = Typings.getStaticTypingNames(getValue(topLevelType.name));
                const methodName = getValue(current.name);
                const argTypes = _.chain(current.arguments)
                    .map(arg => Typings.checkType(arg, config))
                    .value();
                let matchedTypingName = null;
                for(let typingName of typingNames) {
                    const typing = Typings.lookup(typingName, null, config);
                    if(Typings.getMethodType(typing, methodName, argTypes, config)) {
                        matchedTypingName = typingName;
                        break;
                    }
                }

                if(matchedTypingName) {
                    const expressionNode = {
                        identifier: matchedTypingName,
                        node: "SimpleName"
                    };

                    AST.setChild(current, 'expression', expressionNode);
                }
                else {
                    throw e;
                }
            }
        }
    },
};

module.exports = ImportStatic;
