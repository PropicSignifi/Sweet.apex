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

            const outerVariables = [];
            const outerVariableNames = [];
            const thisNodes = [];
            AST.traverse(current, (node, parent) => {
                if(node.node === 'QualifiedName' && getValue(node.qualifier) === 'outer') {
                    outerVariables.push(node);
                }
                else if(node.node === 'ThisExpression') {
                    thisNodes.push(node);
                }
            }, (node, parent) => {
                return node.node === 'LambdaExpression' && node !== current;
            });

            _.each(outerVariables, outerVariable => {
                const name = getValue(outerVariable.name);
                outerVariableNames.push(name);

                const newNode = AST.parseExpression(`anonymous_context.get('${name}')`);
                AST.transform(outerVariable, newNode);
            });

            _.each(thisNodes, thisNode => {
                const name = 'this';

                const newNode = AST.parseExpression(`anonymous_context.get('${name}')`);
                AST.transform(thisNode, newNode);
            });

            const parameters = AST.getParameters(current.args);

            const hasReturn = _.size(current.body.statements) > 0 && _.last(current.body.statements).node === 'ReturnStatement';

            const newFuncContent =
                `private class AnonymousFunc${index} extends Func {
                    private Sweet.AnonymousContext anonymous_context;

                    public AnonymousFunc${index}(Sweet.AnonymousContext context) {
                        super(${_.size(parameters)});

                        this.anonymous_context = context;
                    }

                    public override Object execN(List<Object> args) {
                        ${_.map(parameters, (param, i) => `${param.type} ${param.name} = args.get(${i}) == null ? null : (${param.type})args.get(${i});`).join('\n')}
                    }
                }`;
            const newFunc = AST.parseClassBodyDeclaration(newFuncContent);
            const execMethod = _.find(newFunc.bodyDeclarations, bodyDeclaration => bodyDeclaration.node === 'MethodDeclaration' && getValue(bodyDeclaration.name) === 'execN');

            execMethod.body.statements = [
                ...execMethod.body.statements,
                ...current.body.statements,
            ];

            if(!hasReturn) {
                execMethod.body.statements.push(AST.parseBlockStatement(`return null;`));
            }

            AST.addIndex(newFunc);
            newStatements.push(AST.parseEmptyLine());
            newStatements.push(newFunc);

            const outer = _.map(outerVariableNames, outerVariableName => `'${outerVariableName}' => ${outerVariableName}`).join(', ');

            const enclosingType = AST.getEnclosingType(current);
            const enclosingMethod = AST.getEnclosingMethod(current);
            const enclosingField = AST.getEnclosingField(current);
            const anonyousContext = _.find(_.get(enclosingType, 'bodyDeclarations'), bodyDeclaration => bodyDeclaration.node === 'FieldDeclaration' && !_.isEmpty(bodyDeclaration.fragments) && getValue(bodyDeclaration.fragments[0].name) === 'anonymous_context');

            let thisOuter = outer;
            if((enclosingMethod && !AST.hasModifier(enclosingMethod.modifiers, 'static')) ||
                (enclosingField && !AST.hasModifier(enclosingField.modifiers, 'static'))
            ) {
                thisOuter = _.isEmpty(thisOuter) ? "'this' => this" : thisOuter + ", 'this' => this";
            }

            const newNode = anonyousContext ?
                AST.parseExpression(`new AnonymousFunc${index}(new Sweet.AnonymousContext(anonymous_context, new Map<String, Object>{ ${outer} }))`) :
                AST.parseExpression(`new AnonymousFunc${index}(new Sweet.AnonymousContext(null, new Map<String, Object>{ ${thisOuter} }))`);

            AST.transform(current, newNode);
        });

        AST.appendChildren(typeDeclaration, 'bodyDeclarations', newStatements);
    },
};

module.exports = Lambda;
