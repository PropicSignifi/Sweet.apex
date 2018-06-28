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

const DefaultValue = {
    accept: ({ current, parent, root, }) => {
        const methodDeclaration = AST.getParent(root, parent);

        const passed = parent.node === 'SingleVariableDeclaration' &&
            current.node === 'Annotation' &&
            getValue(current.typeName) === 'defaultValue' &&
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
        const newBlockStatements = [];
        let methodDeclaration = null;

        _.each(group, ({ current, parent, root, }) => {
            if(!methodDeclaration) {
                methodDeclaration = AST.getParent(root, parent);
            }

            if(!current.value) {
                throw new Error('Default value is not set for @defaultValue');
            }

            const paramName = getValue(parent.name);

            const content = `${paramName} = (${paramName} == null) ? ${getValue(current.value)} : ${paramName};`;
            const newBlockStatement = AST.parseBlockStatement(content);

            newBlockStatements.push(newBlockStatement);

            AST.removeChild(parent, 'modifiers', current);
        });

        newBlockStatements.push(AST.parseBlockStatement('\n'));

        AST.prependChildren(methodDeclaration.body, 'statements', newBlockStatements);
    },
};

module.exports = DefaultValue;
