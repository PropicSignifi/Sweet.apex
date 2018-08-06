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
const Typings = require('../../typings');
const getValue = require('../../valueProvider');
const { log, writeToFile, } = require('../../utils');

const annotations = {};
const annotationInstances = [];

const getAnnotationRegisterCode = annotationInstance => {
    const annotation = annotations[annotationInstance.name];
    return `registerAnnotation(${annotationInstance.targetName}.class.getName(), new ${annotation.name}()${_.map(annotationInstance.fields, field => '.' + field.name + '(' + field.value + ')').join('')});`;
};

const getAnnotationsClass = name => {
    return `public class ${name} implements Sweet.Annotations {
    private final Map<String, List<Object>> annotations = new Map<String, List<Object>>();

    public List<Object> getAnnotations(String name) {
        List<Object> aList = annotations.get(name);
        return aList == null ? new List<Object>() : aList;
    }

    public Object getAnnotation(String name) {
        List<Object> aList = getAnnotations(name);
        return aList.isEmpty() ? null : aList.get(0);
    }

    private void registerAnnotation(String targetName, Object annotation) {
        List<Object> aList = annotations.get(targetName);
        if(aList == null) {
            aList = new List<Object>();
        }
        aList.add(annotation);
        annotations.put(targetName, aList);
    }

    {
        ${_.map(annotationInstances, getAnnotationRegisterCode).join('\n')}
    }
}`;
};

const getMetaContent = config => `<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>${config.apiVersion}</apiVersion>
    <status>Active</status>
</ApexClass>
`;

const transformAnnotationClass = (current, parent, root) => {
    const members = _.filter(current.bodyDeclarations, { node: 'AnnotationTypeMemberDeclaration' });
    const rest = _.reject(current.bodyDeclarations, { node: 'AnnotationTypeMemberDeclaration' });
    const name = current.name;
    const bodyDeclarations = [];

    _.forEach(members, member => {
        bodyDeclarations.push({
            node: "FieldDeclaration",
            fragments: [
                {
                    node: "VariableDeclarationFragment",
                    name: {
                        identifier: 'm_' + getValue(member.name),
                        node: "SimpleName"
                    },
                    extraDimensions: 0,
                    initializer: member.default,
                    accessor: null
                }
            ],
            type: member.type,
            modifiers: [
                {
                    node: "Modifier",
                    keyword: "private"
                }
            ]
        });
    });

    _.forEach(members, member => {
        const memberName = 'm_' + getValue(member.name);

        bodyDeclarations.push({
            parameters: [
                {
                    node: "SingleVariableDeclaration",
                    name: {
                        identifier: memberName,
                        node: "SimpleName"
                    },
                    extraDimensions: 0,
                    type: member.type,
                    modifiers: [],
                    varargs: false,
                    initializer: null
                }
            ],
            body: {
                node: "Block",
                statements: [
                    {
                        node: "ExpressionStatement",
                        expression: {
                            node: "Assignment",
                            operator: "=",
                            leftHandSide: {
                                node: "FieldAccess",
                                name: {
                                    identifier: memberName,
                                    node: "SimpleName"
                                },
                                expression: {
                                    node: "ThisExpression",
                                    qualifier: null
                                }
                            },
                            rightHandSide: {
                                identifier: memberName,
                                node: "SimpleName"
                            }
                        }
                    },
                    {
                        node: "ReturnStatement",
                        expression: {
                            node: "ThisExpression",
                            qualifier: null
                        }
                    }
                ]
            },
            extraDimensions: 0,
            typeParameters: [],
            node: "MethodDeclaration",
            returnType2: {
                node: "SimpleType",
                name,
            },
            name: member.name,
            constructor: false,
            modifiers: [
                {
                    node: "Modifier",
                    keyword: "public"
                }
            ]
        });

        bodyDeclarations.push({
            parameters: [],
            extraDimensions: 0,
            body: {
                node: "Block",
                statements: [
                    {
                        node: "ReturnStatement",
                        expression: {
                            node: "FieldAccess",
                            name: {
                                identifier: memberName,
                                node: "SimpleName"
                            },
                            expression: {
                                node: "ThisExpression",
                                qualifier: null
                            }
                        }
                    }
                ]
            },
            constructor: false,
            node: "MethodDeclaration",
            returnType2: member.type,
            name: member.name,
            typeParameters: [],
            modifiers: [
                {
                    node: "Modifier",
                    keyword: "public"
                }
            ]
        });
    });

    const newNode = {
        node: 'TypeDeclaration',
        name,
        modifiers: current.modifiers,
        bodyDeclarations: [
            ...bodyDeclarations,
            ...rest,
        ],
    };

    AST.transform(current, newNode);
};

const Annotation = {
    setUp: config => {
        const typings = Typings.getAllTypings(config);
        _.each(typings, (typing, name) => {
            if(typing.type === 'Annotation') {
                annotations[name] = typing;
            }

            _.forEach(typing.annotationDeclarations, decl => {
                const copy = _.cloneDeep(decl);
                const fullName = name + '.' + decl.name;
                copy.name = fullName;
                annotations[decl.name] = copy;
            });
        });
    },

    accept: ({ current, parent, }) => {
        const accepted =
            current.node === 'AnnotationTypeDeclaration' ||
            (current.node === 'Annotation' && parent.node === 'TypeDeclaration');
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        if(current.node === 'AnnotationTypeDeclaration') {
            transformAnnotationClass(current, parent, root);
        }
        else if(current.node === 'Annotation') {
            const typeDeclaration = parent;
            const annotationName = getValue(current.typeName);
            if(!annotations[annotationName]) {
                return;
            }

            const topTypeDeclaration = AST.getTopLevelType(root);
            const targetName = topTypeDeclaration === typeDeclaration ?
                getValue(typeDeclaration.name) :
                getValue(topTypeDeclaration.name) + '.' + getValue(typeDeclaration.name);

            const annotationInstance = {
                name: annotationName,
                targetName,
                fields: [],
            };
            if(current.values) {
                _.forEach(current.values, pair => {
                    annotationInstance.fields.push({
                        name: getValue(pair.name),
                        value: getValue(pair.value),
                    });
                });
            }
            else if(current.value) {
                annotationInstance.fields.push({
                    name: 'value',
                    value: getValue(current.value),
                });
            }
            annotationInstances.push(annotationInstance);

            const annotation = AST.findAnnotation(typeDeclaration.modifiers, annotationName);
            AST.removeChild(typeDeclaration, 'modifiers', annotation);
        }
    },

    finalize: config => {
        const name = 'SweetAnnotations';
        const newCode = getAnnotationsClass(name);

        return Promise.all([
            writeToFile(`${name}.cls`, newCode, config)
                .then(() => log(`Compiled ${config.destDir + name}.cls`, config)),
            writeToFile(`${name}.cls-meta.xml`, getMetaContent(config), config)
                .then(() => log(`Compiled ${config.destDir + name}.cls-meta.xml`, config)),
        ]);
    },
};

module.exports = Annotation;
