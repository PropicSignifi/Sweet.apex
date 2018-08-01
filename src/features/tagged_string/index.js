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

const tags = {};

const getTagName = annotation => {
    if(annotation.value) {
        return annotation.value;
    }
    else if(!_.isEmpty(annotation.values)) {
        const pair = _.find(annotation.values, pair => pair.name === 'name');
        if(pair) {
            return pair.value;
        }
    }
    return null;
};

const checkValidTagMethod = (method, type) => {
    if(!_.includes(method.modifiers, 'public') && !_.includes(method.modifiers, 'global')) {
        return `Method should be either public or global for ${type.name}.${method.name}`;
    }

    if(!_.includes(method.modifiers, 'static')) {
        return `Method should be static for ${type.name}.${method.name}`;
    }

    if(method.returnType === 'void') {
        return `Method should have a return type for ${type.name}.${method.name}`;
    }

    if(_.size(method.parameters) !== 2) {
        return `Method should expect exactly two parameters for ${type.name}.${method.name}`;
    }

    if(method.parameters[0].type !== 'List<String>') {
        return `The first parameter should be List<String> for ${type.name}.${method.name}`;
    }

    if(method.parameters[1].type !== 'List<Object>') {
        return `The second parameter should be List<Object> for ${type.name}.${method.name}`;
    }

    return null;
};

const Tag = {
    setUp: config => {
        const typings = Typings.getAllTypings(config);
        _.each(typings, (typing, name) => {
            _.each(typing.methodDeclarations, method => {
                const annotation = _.find(method.annotations, a => a.typeName === 'tag');
                if(!annotation) {
                    return;
                }

                let tagName = _.trim(getTagName(annotation), "'");
                if(!tagName) {
                    tagName = method.name;
                }

                const msg = checkValidTagMethod(method, typing);
                if(msg) {
                    throw new Error(msg);
                }

                tags[tagName] = {
                    name: tagName,
                    type: name,
                    method: method.name,
                    returnType: method.returnType,
                    parameters: method.parameters,
                };
            });
        });
    },

    accept: ({ current, parent, }) => {
        const accepted =
            current.node === 'TaggedStringLiteral' ||
            (current.node === 'MethodDeclaration' && AST.hasAnnotation(current.modifiers, 'tag'));
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        if(current.node === 'TaggedStringLiteral') {
            const value = current.escapedValue;
            let [ tagName, templateString ] = value.split('`');
            const tag = tags[tagName];
            if(!tag) {
                throw new Error(`Tag definition not found for ${tagName}`);
            }

            templateString = templateString.replace(/(?:\r\n|\r|\n)/g, '\\n');
            const items = [];
            const values = [];
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

                values.push(templateString.substring(startIndex + 2, endIndex));

                endIndex += 1;
            }

            const newCode = `(${tag.returnType})${tag.type}.${tag.method}(new List<String>{ ${items.join(', ')} }, new List<Object>{ ${values.join(', ')} })`;
            const newNode = AST.parseExpression(newCode);
            AST.transform(current, newNode);
        }
        else if(current.node === 'MethodDeclaration') {
            const annotation = AST.findAnnotation(current.modifiers, 'tag');
            AST.removeChild(current, 'modifiers', annotation);
        }
    },
};

module.exports = Tag;
