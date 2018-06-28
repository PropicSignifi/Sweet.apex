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

const operators = {};

const getOperatorName = annotation => {
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

const checkValidOperatorMethod = (method, type) => {
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

    return null;
};

const Operator = {
    setUp: config => {
        const typings = Typings.getAllTypings(config);
        _.each(typings, (typing, name) => {
            _.each(typing.methodDeclarations, method => {
                const annotation = _.find(method.annotations, a => a.typeName === 'operator');
                if(!annotation) {
                    return;
                }

                let operatorName = _.trim(getOperatorName(annotation), "'");
                if(!operatorName) {
                    operatorName = method.name;
                }

                const msg = checkValidOperatorMethod(method, typing);
                if(msg) {
                    throw new Error(msg);
                }

                operators[operatorName] = {
                    name: operatorName,
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
            (current.node === 'InfixExpression' && !_.isString(current.operator)) ||
            (current.node === 'MethodDeclaration' && AST.hasAnnotation(current.modifiers, 'operator'));
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        if(current.node === 'InfixExpression') {
            const operatorName = getValue(current.operator);
            const operator = operators[operatorName];
            if(!operator) {
                throw new Error(`Operator definition not found for ${operatorName}`);
            }

            const newCode = `(${operator.returnType})${operator.type}.${operator.method}((${operator.parameters[0].type})1, (${operator.parameters[1].type})2)`;
            const newNode = AST.parseExpression(newCode);
            newNode.expression.arguments[0].expression = current.leftOperand;
            newNode.expression.arguments[1].expression = current.rightOperand;
            AST.transform(current, newNode);
        }
        else if(current.node === 'MethodDeclaration') {
            const annotation = AST.findAnnotation(current.modifiers, 'operator');
            AST.removeChild(current, 'modifiers', annotation);
        }
    },
};

module.exports = Operator;
