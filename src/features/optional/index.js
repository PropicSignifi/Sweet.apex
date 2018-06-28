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

const Optional = {
    accept: ({ current, parent, root, }) => {
        const methodDeclaration = AST.getParent(root, parent);

        const passed = parent.node === 'SingleVariableDeclaration' &&
            current.node === 'Annotation' &&
            getValue(current.typeName) === 'optional' &&
            methodDeclaration !== null &&
            methodDeclaration.node === 'MethodDeclaration' &&
            (!!methodDeclaration.body);

        return passed;
    },

    groupBy: ({ parent, root, }) => {
        const methodDeclaration = AST.getParent(root, parent);
        return AST.getMethodSignature(methodDeclaration);
    },

    runGroup: group => {
        const newStatements = [];
        const { parent, root, } = group[0];
        const methodDeclaration = AST.getParent(root, parent);
        const typeDeclaration = AST.getParent(root, methodDeclaration);
        const totalOptional = _.size(group);
        const hasReturn = 'void' !== getValue(methodDeclaration.returnType2);

        const index = _.findIndex(methodDeclaration.parameters, param => AST.hasAnnotation(param.modifiers, 'optional'));
        const restParameters = _.slice(methodDeclaration.parameters, index);
        if(!_.every(restParameters, param => AST.hasAnnotation(param.modifiers, 'optional'))) {
            throw new Error('@optional should be used at rear parameters');
        }

        _.each(group, ({ current, parent, root, }) => {
            AST.removeChild(parent, 'modifiers', current);
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
