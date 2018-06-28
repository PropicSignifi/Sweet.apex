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

const buildIfStatement = (varName, expression, thenStatements, elseStatements) => {
    const statement = {
        node: 'IfStatement',
        expression: {
            node: 'InfixExpression',
            operator: '==',
            leftOperand: {
                identifier: varName,
                node: 'SimpleName',
            },
            rightOperand: expression,
        },
        thenStatement: {
            node: 'Block',
            statements: _.isArray(thenStatements) ? thenStatements : [thenStatements],
        },
    };

    if(elseStatements) {
        statement.elseStatement = {
            node: 'Block',
            statements: _.isArray(elseStatements) ? elseStatements : [elseStatements],
        };
    }

    return statement;
};

const Switch = {
    accept: ({ current, parent, }) => {
        const accepted =
            current.node === 'SwitchStatement';
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        const {
            expression,
            statements,
        } = current;

        const tmpName = _.truncate(AST.getUniqueName(current) + '_s', {
            length: 32,
            omission: '',
        });

        const cases = [];
        let currentCase = {
            expression: null,
            statements: [],
            hasBreak: false,
        };
        _.eachRight(statements, statement => {
            if(statement.node === 'SwitchCase') {
                currentCase.expression = statement.expression;
                cases.push(currentCase);

                currentCase = {
                    expression: null,
                    statements: [],
                    hasBreak: false,
                };
            }
            else if(statement.node === 'BreakStatement') {
                currentCase.hasBreak = true;
            }
            else {
                currentCase.statements.push(statement);
            }
        });

        _.reverse(cases);

        let newNode = [];
        _.eachRight(cases, c => {
            if(c.expression) {
                // case label
                if(c.hasBreak) {
                    const newIfElse = buildIfStatement(tmpName, c.expression, c.statements, newNode);
                    newNode = newIfElse;
                }
                else {
                    const newIf = buildIfStatement(tmpName, c.expression, c.statements);
                    if(_.isArray(newNode)) {
                        newNode = [
                            newIf,
                            ...newNode,
                        ];
                    }
                    else {
                        newNode = [
                            newIf,
                            newNode,
                        ];
                    }
                }
            }
            else {
                // default label
                newNode = c.statements;
            }
        });

        let newStatements = [
            AST.parseBlockStatement(`Object ${tmpName} = ${getValue(expression)};`),
        ];
        if(_.isArray(newNode)) {
            newStatements = [
                ...newStatements,
                ...newNode,
            ];
        }
        else {
            newStatements = [
                ...newStatements,
                newNode,
            ];
        }

        AST.insertChildrenAfter(parent, 'statements', current, newStatements);
        AST.removeChild(parent, 'statements', current);
    },
};

module.exports = Switch;
