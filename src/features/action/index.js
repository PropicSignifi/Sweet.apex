const _ = require('lodash');
const AST = require('../../ast');
const getValue = require('../../valueProvider');
const compile = require('../../compiler');

const Action = {
    accept: ({ current, parent, root, }) => {
        const passed = current.node === 'MethodDeclaration' &&
            AST.hasAnnotation(current.modifiers, 'action');

        return passed;
    },

    groupBy: ({ parent, root, }) => {
        return getValue(parent.name);
    },

    runGroup: group => {
        const newStatements = [];
        let typeDeclaration = null;
        const actionNames = [];

        _.each(group, ({ current, parent, root, }) => {
            if(!typeDeclaration) {
                typeDeclaration = parent;
            }

            if(!AST.hasAnnotation(current.modifiers, 'AuraEnabled')) {
                throw new Error('@AuraEnabled should be present');
            }
            if(!AST.hasModifier(current.modifiers, 'public')) {
                throw new Error('Should be public method');
            }
            if(!AST.hasModifier(current.modifiers, 'static')) {
                throw new Error('Should be static method');
            }

            const annotation = _.find(current.modifiers, modifier => modifier.node === 'Annotation' && getValue(modifier.typeName) === 'action');
            let returnRaw = false;
            let annotationValue = AST.getAnnotationValue(annotation);
            if(annotationValue) {
                if(_.isPlainObject(annotationValue)) {
                    returnRaw = annotationValue.returnRaw;
                }
                else {
                    returnRaw = annotationValue === 'true';
                }
            }

            const methodName = getValue(current.name);
            const actionName = _.capitalize(methodName) + 'Action';
            actionNames.push(actionName);

            const parameters = _.map(current.parameters, param => {
                return {
                    name: getValue(param.name),
                    type: getValue(param.type),
                };
            });

            const lines = [];
            compile(current.body, {
                lines,
                indent: '',
            });

            const returnType = getValue(current.returnType2);

            if(returnType === 'void') {
                lines.push('return null;');
            }

            const javaDocComment = AST.findPrev(parent, current);
            const paramComments = {};
            if(javaDocComment && javaDocComment.node === 'JavaDocComment') {
                _.each(_.split(javaDocComment.comment, '\n'), comment => {
                    comment = _.trimStart(comment, ' *');
                    if(comment.startsWith('@param ')) {
                        const [ paramName, ...paramDesc ] = comment.substring(7).split(' ');
                        if(paramName) {
                            paramComments[paramName] = _.join(paramDesc, ' ');
                        }
                    }
                });
            }

            let execActionCode = null;
            if(_.size(parameters) < 4) {
                execActionCode =
                    `public override Object execAction(${_.map(parameters, (param, index) => `Object arg${index}`).join(', ')}) {
                        ${_.map(parameters, (param, index) => `${param.type} ${param.name} = (${param.type})arg${index};`).join('\n')}

                        ${lines.join('\n')}
                    }`;
            }
            else {
                execActionCode =
                    `public override Object execActionN(List<Object> args) {
                        ${_.map(parameters, (param, index) => `${param.type} ${param.name} = (${param.type})args.get(${index});`).join('\n')}

                        ${lines.join('\n')}
                    }`;
            }

            const newActionContent =
                `private class ${actionName} extends Action {
                    public ${actionName}() {
                        super('${methodName}');

                        ${_.map(parameters, param => `param('${param.name}', ${param.type}.class, '${paramComments[param.name] || param.name}');`).join('\n')}
                        ${returnRaw ? 'this.returnRaw();' : ''}
                    }

                    ${execActionCode}
                }`;

            newStatements.push(AST.parseEmptyLine());
            newStatements.push(AST.parseClassBodyDeclaration(newActionContent));

            AST.removeChild(parent, 'bodyDeclarations', current);
            if(javaDocComment) {
                AST.removeChild(parent, 'bodyDeclarations', javaDocComment);
            }
        });

        const helperCode = [
            `private static Action.Registry registry = new Action.Registry();`,
            `\n`,
            `static {
                ${_.map(actionNames, actionName => `registry.action(new ${actionName}());`).join('\n')}
            }`,
            `\n`,
            `@AuraEnabled
            public static Object invoke(String name, Map<String, Object> args) {
                return registry.invoke(name, args);
            }`,
            `\n`,
            `@AuraEnabled
            public static Map<String, Action> apiDescriptorForLightning() {
                return registry.actions;
            }`,
        ];

        const helperStatements = _.map(helperCode, AST.parseClassBodyDeclaration);

        AST.appendChildren(typeDeclaration, 'bodyDeclarations', [
            ...helperStatements,
            ...newStatements,
        ]);
    },
};

module.exports = Action;
