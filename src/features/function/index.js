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

            const parameters = AST.getParameters(methodDeclaration.parameters);
            const returnType = getValue(methodDeclaration.returnType2);

            let castStatements = _.map(parameters, (param, index) => {
                return `${param.type} ${param.name} = args.get(${index}) == null ? null : (${param.type})args.get(${index});`;
            }).join('\n');
            castStatements = _.isEmpty(castStatements) ? '' : castStatements + '\n\n';

            const lines = AST.getCompiled(methodDeclaration.body);

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

            const annotation = AST.findAnnotation(methodDeclaration.modifiers, 'func');
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
