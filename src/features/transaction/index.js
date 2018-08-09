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

const Transaction = {
    accept: ({ current, parent, }) => {
        const accepted = current.node === 'MethodDeclaration' &&
            AST.hasAnnotation(current.modifiers, 'transaction');
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        const isStatic = AST.hasModifier(current.modifiers, 'static');
        const returnType = getValue(current.returnType2);
        const hasReturn = returnType !== 'void';
        const name = getValue(current.name);

        const newInnerMethodCode = `private ${isStatic ? 'static ' : ''}${returnType} transaction_${name}(${_.map(current.parameters, getValue).join(', ')}) {
        }`;
        const newInnerMethod = AST.parseClassBodyDeclaration(newInnerMethodCode);
        newInnerMethod.body.statements = current.body.statements;

        const paramNames = _.map(current.parameters, param => getValue(param.name)).join(', ');
        const newCodes = [
            `Savepoint sp = Database.setSavepoint();`,
            `try {
                ${hasReturn ? 'return ' : ''}transaction_${name}(${paramNames});
            }
            catch(Exception e) {
                Database.rollback(sp);
                throw e;
            }`,
        ];
        const newNodes = AST.parseBlockStatements(newCodes);

        const annotation = AST.findAnnotation(current.modifiers, 'transaction');
        AST.removeChild(current, 'modifiers', annotation);
        AST.setChild(current.body, 'statements', newNodes);
        AST.appendChild(parent, 'bodyDeclarations', newInnerMethod);
    },
};

module.exports = Transaction;
