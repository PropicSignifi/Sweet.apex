const _ = require('lodash');
const AST = require('../../ast');
const getValue = require('../../valueProvider');
const compile = require('../../compiler');

const Func = {
    accept: ({ current, parent, root, }) => {
        const grandParent = AST.getParent(root, parent);

        return current.node === 'MethodDeclaration' &&
            AST.hasModifier(current.modifiers, 'func') &&
            grandParent.node === 'CompilationUnit';
    },

    groupBy: ({ parent, }) => {
        return getValue(parent.name);
    },

    runGroup: group => {
        const newNodes = [];
        let typeDeclaration = null;
        const newFuncs = [];

        _.each(group, ({ current, parent, root, }) => {
            const methodDeclaration = current;
            if(!typeDeclaration) {
                typeDeclaration = parent;
            }

            const methodName = getValue(methodDeclaration.name);
            const funcClassName = _.capitalize(methodName) + 'Func';
            newFuncs.push({
                name: methodName,
                type: funcClassName,
            });

            const parameters = _.map(methodDeclaration.parameters, param => {
                return {
                    name: getValue(param.name),
                    type: getValue(param.type),
                };
            });
            const returnType = getValue(methodDeclaration.returnType2);

            let castStatements = _.map(parameters, (param, index) => {
                return `${param.type} ${param.name} = (${param.type})args.get(${index});`;
            }).join('\n');
            castStatements = _.isEmpty(castStatements) ? '' : castStatements + '\n\n';

            const lines = [];
            compile(methodDeclaration.body, {
                lines,
                indent: '',
            });

            if(returnType === 'void') {
                lines.push('');
                lines.push('return null;');
            }

            const newFuncTypeContent =
                `private class ${funcClassName} extends Func {
                    public ${funcClassName}() {
                        super(${_.size(parameters)});
                    }

                    public override Object execN(List<Object> args) {
                        ${castStatements};
                        ${lines.join('\n')};
                    }
                }`;
            const newFuncType = AST.parseTypeDeclaration(newFuncTypeContent);

            newNodes.push(AST.parseEmptyLine());
            newNodes.push(newFuncType);

            const next = AST.findNext(typeDeclaration, methodDeclaration);
            _.pull(parent.bodyDeclarations, methodDeclaration);

            if(next && next.node === 'LineEmpty') {
                _.pull(parent.bodyDeclarations, next);
            }
        });

        typeDeclaration.bodyDeclarations.push(AST.parseEmptyLine());
        typeDeclaration.bodyDeclarations.push(AST.parseClassBodyDeclaration(`public static final Funcs F = new Funcs();`));

        typeDeclaration.bodyDeclarations.push(AST.parseEmptyLine());
        const funcsContent = _.map(newFuncs, newFunc => `public Func ${newFunc.name} = new ${newFunc.type}();`).join('\n');
        typeDeclaration.bodyDeclarations.push(
            AST.parseClassBodyDeclaration(`public class Funcs {
                ${funcsContent}
            }`)
        );

        _.each(newNodes, newNode => typeDeclaration.bodyDeclarations.push(newNode));
    },
};

module.exports = Func;
