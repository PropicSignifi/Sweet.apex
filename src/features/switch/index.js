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
