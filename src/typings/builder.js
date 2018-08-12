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
const AST = require('../ast');
const getValue = require('../valueProvider');

let aliases = {};

// Build the comments
const buildComments = (node, parent, typingsConfig) => {
    if(!typingsConfig.includeComments) {
        return {};
    }

    let comments = [];

    if(!_.isEmpty(node.comments)) {
        comments = _.chain(node.comments)
            .filter(c => c.value.startsWith('/**'))
            .map(c => c.value)
            .value();
    }

    if(parent) {
        const prev = AST.findPrev(parent, node);
        if(prev && prev.node === 'JavaDocComment') {
            comments = [
                ...comments,
                prev.comment,
            ];
        }
    }

    return _.isEmpty(comments) ? {} : parseComment(_.first(comments));
};

// Parse the comments and extract possible annotations
const parseComment = comment => {
    const data = {
        value: '',
        properties: {},
    };

    const lines = _.chain(comment)
        .split('\n')
        .map(line => _.trimStart(line, ' *'))
        .value();

    let key = null;
    let value = [];

    _.each(lines, line => {
        if(line.startsWith('/**')) {
            return;
        }
        else if(line.startsWith('@')) {
            if(key) {
                data.properties[key] = _.trim(value.join('\n'));
            }
            else {
                data.value = _.trim(value.join('\n'));
            }

            const [ newKey, ...rest ] = _.split(_.trim(line.substring(1)), ' ');

            key = newKey;
            value = [ rest.join(' '), ];
        }
        else if(line.startsWith('/')) {
            if(key) {
                data.properties[key] = _.trim(value.join('\n'));
            }
            else {
                data.value = _.trim(value.join('\n'));
            }
        }
        else {
            value.push(line);
        }
    });

    return data;
};

// Get the name of the AST node
const getName = (node, typingsConfig) => getValue(node.name);

// Get the modifiers of the AST node
const getModifiers = (node, typingsConfig) => _.chain(node.modifiers).filter(m => m.node === 'Modifier').map(getValue).value();

// Get the annotations of the AST node
const getAnnotations = (node, typingsConfig) => _.chain(node.modifiers).filter(m => m.node === 'Annotation').map(AST.getAnnotation).value();

// Get the super class type of the AST node
const getSuperclassType = (node, typingsConfig) => node.superclassType ? getValue(node.superclassType) : null;

// Get the super interface types of the AST node
const getSuperInterfaceTypes = (node, typingsConfig) => _.map(node.superInterfaceTypes, getValue);

// Get the type parameters of the AST node
const getTypeParameters = (node, typingsConfig) => _.map(node.typeParameters, getValue);

// Build the member class declarations of the AST node
const buildMemberClassDeclarations = (node, typingsConfig) =>
    _.chain(node.bodyDeclarations)
        .filter(n => n.node === 'TypeDeclaration' && !n.interface)
        .map(n => buildClassDeclaration(n, node, typingsConfig))
        .value();
//
// Build the member annotation declarations of the AST node
const buildMemberAnnotationDeclarations = (node, typingsConfig) =>
    _.chain(node.bodyDeclarations)
        .filter(n => n.node === 'AnnotationTypeDeclaration')
        .map(n => buildAnnotationDeclaration(n, node, typingsConfig))
        .value();

// Build the member interface declarations of the AST node
const buildMemberInterfaceDeclarations = (node, typingsConfig) =>
    _.chain(node.bodyDeclarations)
        .filter(n => n.node === 'TypeDeclaration' && n.interface)
        .map(n => buildInterfaceDeclaration(n, node, typingsConfig))
        .value();

// Build the member enum declarations of the AST node
const buildMemberEnumDeclarations = (node, typingsConfig) =>
    _.chain(node.bodyDeclarations)
        .filter(n => n.node === 'EnumDeclaration')
        .map(n => buildEnumDeclaration(n, node, typingsConfig))
        .value();

// Build the field declaration of the AST node
const buildFieldDeclaration = (node, parent, typingsConfig) => {
    const modifiers = getModifiers(node, typingsConfig);
    const annotations = getAnnotations(node, typingsConfig);
    const type = getRealType(getValue(node.type));
    const comments = buildComments(node, parent, typingsConfig);

    return _.chain(node.fragments)
        .map(f => {
            return {
                name: getValue(f.name),
                type,
                modifiers,
                annotations,
                comments,
            };
        })
        .value();
};

// Build the annotation field declaration of the AST node
const buildAnnotationFieldDeclaration = (node, parent, typingsConfig) => {
    return {
        name: getValue(node.name),
        'default': node.default ? getValue(node.default) : null,
        modifiers: getModifiers(node, typingsConfig),
        type: getValue(node.type),
    };
};

// Build the field declarations of the AST node
const buildFieldDeclarations = (node, typingsConfig) =>
    _.chain(node.bodyDeclarations)
        .filter(n => n.node === 'FieldDeclaration')
        .map(n => buildFieldDeclaration(n, node, typingsConfig))
        .value();

// Build the annotation field declarations of the AST node
const buildAnnotationFieldDeclarations = (node, typingsConfig) =>
    _.chain(node.bodyDeclarations)
        .filter(n => n.node === 'AnnotationTypeMemberDeclaration')
        .map(n => buildAnnotationFieldDeclaration(n, node, typingsConfig))
        .value();

// Build the method declaration of the AST node
const buildMethodDeclaration = (node, parent, typingsConfig) => {
    const modifiers = getModifiers(node, typingsConfig);
    const annotations = getAnnotations(node, typingsConfig);
    const name = getValue(node.name);
    const constructor = node.constructor;
    const returnType = node.returnType2 ? getValue(node.returnType2) : null;
    const parameters = _.map(node.parameters, param => {
        return {
            name: getValue(param.name),
            type: getRealType(getValue(param.type)),
            varargs: param.varargs,
        };
    });
    const comments = buildComments(node, parent, typingsConfig);

    return {
        name,
        modifiers,
        annotations,
        constructor,
        parameters,
        returnType: getRealType(returnType),
        comments,
    };
};

// Build the method declarations of the AST node
const buildMethodDeclarations = (node, typingsConfig) =>
    _.chain(node.bodyDeclarations)
        .filter(n => n.node === 'MethodDeclaration')
        .map(n => buildMethodDeclaration(n, node, typingsConfig))
        .value();

// Build the class declaration of the AST node
const buildClassDeclaration = (node, parent, typingsConfig) => {
    return {
        type: 'Class',
        name: getName(node, typingsConfig),
        modifiers: getModifiers(node, typingsConfig),
        annotations: getAnnotations(node, typingsConfig),
        comments: buildComments(node, parent, typingsConfig),
        superclassType: getSuperclassType(node, typingsConfig),
        superInterfaceTypes: getSuperInterfaceTypes(node, typingsConfig),
        typeParameters: getTypeParameters(node, typingsConfig),
        classDeclarations: buildMemberClassDeclarations(node, typingsConfig),
        interfaceDeclarations: buildMemberInterfaceDeclarations(node, typingsConfig),
        enumDeclarations: buildMemberEnumDeclarations(node, typingsConfig),
        annotationDeclarations: buildMemberAnnotationDeclarations(node, typingsConfig),
        fieldDeclarations: buildFieldDeclarations(node, typingsConfig),
        methodDeclarations: buildMethodDeclarations(node, typingsConfig),
    };
};

// Build the interface declaration of the AST node
const buildInterfaceDeclaration = (node, parent, typingsConfig) => {
    return {
        type: 'Interface',
        name: getName(node, typingsConfig),
        modifiers: getModifiers(node, typingsConfig),
        annotations: getAnnotations(node, typingsConfig),
        comments: buildComments(node, parent, typingsConfig),
        superclassType: getSuperclassType(node, typingsConfig),
        classDeclarations: buildMemberClassDeclarations(node, typingsConfig),
        interfaceDeclarations: buildMemberInterfaceDeclarations(node, typingsConfig),
        enumDeclarations: buildMemberEnumDeclarations(node, typingsConfig),
        fieldDeclarations: buildFieldDeclarations(node, typingsConfig),
        methodDeclarations: buildMethodDeclarations(node, typingsConfig),
    };
};

// Build the enum declaration of the AST node
const buildEnumDeclaration = (node, parent, typingsConfig) => {
    return {
        type: 'Enum',
        name: getName(node, typingsConfig),
        modifiers: getModifiers(node, typingsConfig),
        annotations: getAnnotations(node, typingsConfig),
        comments: buildComments(node, parent, typingsConfig),
        superInterfaceTypes: getSuperInterfaceTypes(node, typingsConfig),
        classDeclarations: buildMemberClassDeclarations(node, typingsConfig),
        interfaceDeclarations: buildMemberInterfaceDeclarations(node, typingsConfig),
        enumDeclarations: buildMemberEnumDeclarations(node, typingsConfig),
        annotationDeclarations: buildMemberAnnotationDeclarations(node, typingsConfig),
        fieldDeclarations: buildFieldDeclarations(node, typingsConfig),
        methodDeclarations: buildMethodDeclarations(node, typingsConfig),
    };
};

// Build the annotation declaration of the AST node
const buildAnnotationDeclaration = (node, parent, typingsConfig) => {
    return {
        type: 'Annotation',
        name: getName(node, typingsConfig),
        modifiers: getModifiers(node, typingsConfig),
        annotations: getAnnotations(node, typingsConfig),
        comments: buildComments(node, parent, typingsConfig),
        fieldDeclarations: buildAnnotationFieldDeclarations(node, typingsConfig),
    };
};

const getRealType = typeName => {
    return typeName && aliases[typeName] ? aliases[typeName] : typeName;
};

// Build the doc object
const buildDoc = (node, typingsConfig) => {
    _.chain(node.imports)
        .filter(i => !i.static && !!i.alias)
        .each(i => {
            aliases[getValue(i.alias)] = getValue(i.name);
        })
        .value();

    const topLevelType = AST.getTopLevelType(node);
    if(topLevelType.node === 'TypeDeclaration') {
        if(topLevelType.interface) {
            return buildInterfaceDeclaration(topLevelType, null, typingsConfig);
        }
        else {
            return buildClassDeclaration(topLevelType, null, typingsConfig);
        }
    }
    else if(topLevelType.node === 'EnumDeclaration') {
        return buildEnumDeclaration(topLevelType, null, typingsConfig);
    }
    else if(topLevelType.node === 'AnnotationTypeDeclaration') {
        return buildAnnotationDeclaration(topLevelType, null, typingsConfig);
    }
    else {
        return {};
    }
};

module.exports = buildDoc;
