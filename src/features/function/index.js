const _ = require('lodash');
const AST = require('../../ast');
const getValue = require('../../valueProvider');
const compile = require('../../compiler');

const Func = {
    accept: ({ current, parent, root, }) => {
        const grandParent = AST.getParent(root, parent);

        return current.node === 'MethodDeclaration' &&
            AST.hasAnnotation(current.modifiers, 'func') &&
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

            if(!AST.hasModifier(methodDeclaration.modifiers, 'static')) {
                throw new Error('Func method should be static');
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
                return `${param.type} ${param.name} = args.get(${index}) == null ? null : (${param.type})args.get(${index});`;
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

            const annotation = _.find(methodDeclaration.modifiers, modifier => modifier.node === 'Annotation' && getValue(modifier.typeName) === 'func');
            AST.removeChild(methodDeclaration, 'modifiers', annotation);
            AST.removeChildren(methodDeclaration.body, 'statements');

            let line = '';
            if(returnType === 'void') {
                line = `F.${methodName}.runN(new List<Object>{ ${_.map(parameters, param => param.name).join(', ')} });`;
            }
            else {
                line = `return (${returnType})F.${methodName}.runN(new List<Object>{ ${_.map(parameters, param => param.name).join(', ')} });`;
            }
            AST.appendChild(methodDeclaration.body, 'statements', AST.parseBlockStatement(line));
        });

        AST.appendChild(typeDeclaration, 'bodyDeclarations', AST.parseEmptyLine());
        AST.appendChild(typeDeclaration, 'bodyDeclarations', AST.parseClassBodyDeclaration(`public static final Funcs F = new Funcs();`));

        AST.appendChild(typeDeclaration, 'bodyDeclarations', AST.parseEmptyLine());
        const funcsContent = _.map(newFuncs, newFunc => `public Func ${newFunc.name} = new ${newFunc.type}();`).join('\n');
        AST.appendChild(typeDeclaration, 'bodyDeclarations',
            AST.parseClassBodyDeclaration(`public class Funcs {
                ${funcsContent}
            }`)
        );

        AST.appendChildren(typeDeclaration, 'bodyDeclarations', newNodes);
    },
};

module.exports = Func;
