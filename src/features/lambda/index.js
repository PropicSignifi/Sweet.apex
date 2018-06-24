const _ = require('lodash');
const AST = require('../../ast');
const getValue = require('../../valueProvider');
const compile = require('../../compiler');

const Lambda = {
    accept: ({ current, parent, root, }) => {
        const passed = current.node === 'LambdaExpression';

        return passed;
    },

    groupBy: ({ parent, root, }) => {
        return getValue(AST.getTopLevelType(root).name);
    },

    runGroup: group => {
        const newStatements = [];
        let typeDeclaration = null;

        _.each(group, ({ current, parent, root, }, index) => {
            if(!typeDeclaration) {
                typeDeclaration = AST.getTopLevelType(root);
            }

            const parameters = _.map(current.args, arg => {
                return {
                    name: getValue(arg.name),
                    type: getValue(arg.type),
                };
            });

            const lines = [];
            compile(current.body, {
                lines,
                indent: '',
            });

            const hasReturn = _.size(current.body.statements) > 0 && _.last(current.body.statements).node === 'ReturnStatement';

            const newFunc =
                `private class AnonymousFunc${index} extends Func {
                    public AnonymousFunc${index}() {
                        super(${_.size(parameters)});
                    }

                    public override Object execN(List<Object> args) {
                        ${_.map(parameters, (param, i) => `${param.type} ${param.name} = args.get(${i}) == null ? null : (${param.type})args.get(${i});`).join('\n')}

                        ${_.join(lines, '\n')}
                        ${hasReturn ? '' : 'return null;'}
                    }
                }`;

            newStatements.push(AST.parseEmptyLine());
            newStatements.push(AST.parseClassBodyDeclaration(newFunc));

            const newNode = {
                node: 'ClassInstanceCreation',
                'arguments': [],
                anonymousClassDeclaration: null,
                expression: null,
                type: {
                    node: 'SimpleType',
                    name: {
                        identifier: `AnonymousFunc${index}`,
                        node: 'SimpleName',
                    },
                },
            };

            AST.transform(current, newNode);
        });

        AST.appendChildren(typeDeclaration, 'bodyDeclarations', newStatements);
    },
};

module.exports = Lambda;
