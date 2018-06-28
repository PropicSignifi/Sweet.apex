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

const aspects = [];

const AspectType = {
    Before: 'before',
    After: 'after',
};

const findMatchedAspects = (method, type) => {
    const signature = AST.getMethodSignature(method, type);
    return _.filter(aspects, aspect => new RegExp(aspect.pattern).test(signature));
};

const getAspectPattern = annotation => {
    if(annotation.value) {
        return annotation.value;
    }
    else if(!_.isEmpty(annotation.values)) {
        const pair = _.find(annotation.values, pair => pair.name === 'pattern');
        if(pair) {
            return pair.value;
        }
    }
    return null;
};

const checkValidAspectMethod = (method, type, aspectType) => {
    if(!_.includes(method.modifiers, 'public') && !_.includes(method.modifiers, 'global')) {
        return `Method should be either public or global for ${type.name}.${method.name}`;
    }

    if(!_.includes(method.modifiers, 'static')) {
        return `Method should be static for ${type.name}.${method.name}`;
    }

    if(aspectType === 'beforeMethod') {
        if(!(_.size(method.parameters) === 2 &&
            (method.parameters[0].type) === 'Object' &&
            (method.parameters[1].type) === 'List<Object>')) {
            return `Method parameters are incorrect for ${type.name}.${method.name}`;
        }
    }
    else if(aspectType === 'afterMethod') {
        if(!(_.size(method.parameters) === 3 &&
            (method.parameters[0].type) === 'Object' &&
            (method.parameters[1].type) === 'List<Object>' &&
            (method.parameters[2].type) === 'Object')) {
            return `Method parameters are incorrect for ${type.name}.${method.name}`;
        }
    }

    return null;
};

const Aspect = {
    setUp: config => {
        const typings = Typings.getAllTypings(config);
        _.each(typings, (typing, name) => {
            _.each(typing.methodDeclarations, method => {
                const annotation = _.find(method.annotations, a => a.typeName === 'beforeMethod' || a.typeName === 'afterMethod');
                if(!annotation) {
                    return;
                }

                let aspectPattern = _.trim(getAspectPattern(annotation), "'");
                if(!aspectPattern) {
                    throw new Error(`Aspect pattern is not specified for ${name}.${method.name}`);
                }

                const msg = checkValidAspectMethod(method, typing, annotation.typeName);
                if(msg) {
                    throw new Error(msg);
                }

                aspects.push({
                    pattern: aspectPattern,
                    aspectType: annotation.typeName === 'beforeMethod' ? AspectType.Before : AspectType.After,
                    type: name,
                    method: method.name,
                    returnType: method.returnType,
                });
            });
        });
    },

    accept: ({ current, parent, }) => {
        const accepted = current.node === 'MethodDeclaration';
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        let annotation = AST.findAnnotation(current.modifiers, 'beforeMethod');
        if(annotation) {
            AST.removeChild(current, 'modifiers', annotation);
        }
        annotation = AST.findAnnotation(current.modifiers, 'afterMethod');
        if(annotation) {
            AST.removeChild(current, 'modifiers', annotation);
        }

        const aspects = findMatchedAspects(current, parent);
        const beforeAspects = _.filter(aspects, aspect => aspect.aspectType === AspectType.Before);
        const afterAspects = _.filter(aspects, aspect => aspect.aspectType === AspectType.After);

        if(!_.isEmpty(aspects)) {
            const name = getValue(current.name);
            const typeName = getValue(parent.name);
            const returnType = getValue(current.returnType2);
            const isStatic = AST.hasModifier(current.modifiers, 'static');
            const hasReturn = returnType !== 'void';

            const newInnerMethodCode = `private ${isStatic ? 'static ' : ''}${returnType} aspect_${name}(${_.map(current.parameters, getValue).join(', ')}) {
            }`;
            const newInnerMethod = AST.parseClassBodyDeclaration(newInnerMethodCode);
            newInnerMethod.body.statements = current.body.statements;

            const beforeCodes = [];
            _.each(beforeAspects, aspect => {
                const args = [
                    isStatic ? typeName + '.class' : 'this',
                    `new List<Object>{ ${_.map(current.parameters, param => getValue(param.name)).join(', ')} }`,
                ];
                const beforeCode = `${aspect.type}.${aspect.method}(${args.join(', ')});`;
                beforeCodes.push(beforeCode);
            });

            const afterCodes = [];
            _.each(afterAspects, aspect => {
                const args = [
                    isStatic ? typeName + '.class' : 'this',
                    `new List<Object>{ ${_.map(current.parameters, param => getValue(param.name)).join(', ')} }`,
                    hasReturn ? 'ret' : 'null',
                ];
                const afterCode = `${hasReturn ? 'ret = (' + returnType + ')' : ''}${aspect.type}.${aspect.method}(${args.join(', ')});`;
                afterCodes.push(afterCode);
            });

            let newCodes = null;
            if(hasReturn) {
                newCodes = [
                    `${returnType} ret = aspect_${name}(${_.map(current.parameters, param => getValue(param.name)).join(', ')});`,
                    ...afterCodes,
                    `return ret;`
                ];
            }
            else {
                newCodes = [
                    `aspect_${name}(${_.map(current.parameters, param => getValue(param.name)).join(', ')});`,
                    ...afterCodes,
                ];
            }
            newCodes = [
                ...beforeCodes,
                ...newCodes,
            ];

            const newNodes = AST.parseBlockStatements(newCodes);
            AST.setChild(current.body, 'statements', newNodes);

            AST.appendChild(parent, 'bodyDeclarations', newInnerMethod);
        }
    },
};

module.exports = Aspect;
