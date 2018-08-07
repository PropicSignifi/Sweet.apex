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

const isOptional = param => AST.hasAnnotation(param.modifiers, 'optional') || !!param.optional;

const Optional = {
    accept: ({ current, parent, root, }) => {
        const passed = current.node === 'SingleVariableDeclaration' &&
            parent.node === 'MethodDeclaration' &&
            (!!parent.body) &&
            isOptional(current);

        return passed;
    },

    groupBy: ({ parent, root, }) => {
        return AST.getMethodSignature(parent);
    },

    runGroup: group => {
        const newStatements = [];
        const { parent, root, } = group[0];
        const methodDeclaration = parent;
        const typeDeclaration = AST.getParent(root, methodDeclaration);
        const totalOptional = _.size(group);
        const hasReturn = 'void' !== getValue(methodDeclaration.returnType2);

        const index = _.findIndex(methodDeclaration.parameters, isOptional);
        const restParameters = _.slice(methodDeclaration.parameters, index);
        if(!_.every(restParameters, isOptional)) {
            throw new Error('Rear parameters should all be optional');
        }

        _.each(group, ({ current, parent, root, }) => {
            const annotation = AST.findAnnotation(current.modifiers, 'optional');
            AST.removeChild(current, 'modifiers', annotation);
            current.required = null;
        });

        let delegator = methodDeclaration;

        for(let index = 0; index < totalOptional; index++) {
            delegator = _.cloneDeep(delegator);
            const initialParams = _.initial(delegator.parameters);
            delegator.parameters = initialParams;
            const params = AST.getParameters(initialParams);
            params.push({
                name: 'null',
                type: null,
            });
            const line = `${hasReturn ? 'return ': ''}${getValue(delegator.name)}(${_.map(params, param => param.name).join(', ')});`;
            delegator.body.statements = [ AST.parseBlockStatement(line), ];

            newStatements.push(AST.parseEmptyLine());
            newStatements.push(delegator);
        }

        AST.appendChildren(typeDeclaration, 'bodyDeclarations', newStatements);
    },
};

module.exports = Optional;
