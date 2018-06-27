const _ = require('lodash');
const AST = require('../ast');
const getValue = require('../valueProvider');

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

const getName = (node, typingsConfig) => getValue(node.name);

const getModifiers = (node, typingsConfig) => _.chain(node.modifiers).filter(m => m.node === 'Modifier').map(getValue).value();

const getAnnotations = (node, typingsConfig) => _.chain(node.modifiers).filter(m => m.node === 'Annotation').map(AST.getAnnotation).value();

const getSuperclassType = (node, typingsConfig) => node.superclassType ? getValue(node.superclassType) : null;

const getSuperInterfaceTypes = (node, typingsConfig) => _.map(node.superInterfaceTypes, getValue);

const getTypeParameters = (node, typingsConfig) => _.map(node.typeParameters, getValue);

const buildMemberClassDeclarations = (node, typingsConfig) =>
    _.chain(node.bodyDeclarations)
        .filter(n => n.node === 'TypeDeclaration' && !n.interface)
        .map(n => buildClassDeclaration(n, node, typingsConfig))
        .value();

const buildMemberInterfaceDeclarations = (node, typingsConfig) =>
    _.chain(node.bodyDeclarations)
        .filter(n => n.node === 'TypeDeclaration' && n.interface)
        .map(n => buildInterfaceDeclaration(n, node, typingsConfig))
        .value();

const buildMemberEnumDeclarations = (node, typingsConfig) =>
    _.chain(node.bodyDeclarations)
        .filter(n => n.node === 'EnumDeclaration')
        .map(n => buildEnumDeclaration(n, node, typingsConfig))
        .value();

const buildFieldDeclaration = (node, parent, typingsConfig) => {
    const modifiers = getModifiers(node, typingsConfig);
    const annotations = getAnnotations(node, typingsConfig);
    const type = getValue(node.type);
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

const buildFieldDeclarations = (node, typingsConfig) =>
    _.chain(node.bodyDeclarations)
        .filter(n => n.node === 'FieldDeclaration')
        .map(n => buildFieldDeclaration(n, node, typingsConfig))
        .value();

const buildMethodDeclaration = (node, parent, typingsConfig) => {
    const modifiers = getModifiers(node, typingsConfig);
    const annotations = getAnnotations(node, typingsConfig);
    const name = getValue(node.name);
    const constructor = node.constructor;
    const returnType = node.returnType2 ? getValue(node.returnType2) : null;
    const parameters = _.map(node.parameters, param => {
        return {
            name: getValue(param.name),
            type: getValue(param.type),
        };
    });
    const comments = buildComments(node, parent, typingsConfig);

    return {
        name,
        modifiers,
        annotations,
        constructor,
        parameters,
        returnType,
        comments,
    };
};

const buildMethodDeclarations = (node, typingsConfig) =>
    _.chain(node.bodyDeclarations)
        .filter(n => n.node === 'MethodDeclaration')
        .map(n => buildMethodDeclaration(n, node, typingsConfig))
        .value();

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
        fieldDeclarations: buildFieldDeclarations(node, typingsConfig),
        methodDeclarations: buildMethodDeclarations(node, typingsConfig),
    };
};

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
        fieldDeclarations: buildFieldDeclarations(node, typingsConfig),
        methodDeclarations: buildMethodDeclarations(node, typingsConfig),
    };
};

const buildDoc = (node, typingsConfig) => {
    if(node.node === 'TypeDeclaration') {
        if(node.interface) {
            return buildInterfaceDeclaration(node, null, typingsConfig);
        }
        else {
            return buildClassDeclaration(node, null, typingsConfig);
        }
    }
    else if(node.node === 'EnumDeclaration') {
        return buildEnumDeclaration(node, null, typingsConfig);
    }
    else {
        return {};
    }
};

module.exports = buildDoc;
