const _ = require('lodash');
const AST = require('../../ast');
const getValue = require('../../valueProvider');

const buildComments = (node, parent, config) => {
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

const getName = (node, config) => getValue(node.name);

const getModifiers = (node, config) => _.chain(node.modifiers).filter(m => m.node === 'Modifier').map(getValue).value();

const getAnnotations = (node, config) => _.chain(node.modifiers).filter(m => m.node === 'Annotation').map(AST.getAnnotation).value();

const getSuperclassType = (node, config) => node.superclassType ? getValue(node.superclassType) : null;

const getSuperInterfaceTypes = (node, config) => _.map(node.superInterfaceTypes, getValue);

const getTypeParameters = (node, config) => _.map(node.typeParameters, getValue);

const buildMemberClassDeclarations = (node, config) =>
    _.chain(node.bodyDeclarations)
        .filter(n => n.node === 'TypeDeclaration' && !n.interface)
        .map(n => buildClassDeclaration(n, node, config))
        .value();

const buildMemberInterfaceDeclarations = (node, config) =>
    _.chain(node.bodyDeclarations)
        .filter(n => n.node === 'TypeDeclaration' && n.interface)
        .map(n => buildInterfaceDeclaration(n, node, config))
        .value();

const buildMemberEnumDeclarations = (node, config) =>
    _.chain(node.bodyDeclarations)
        .filter(n => n.node === 'EnumDeclaration')
        .map(n => buildEnumDeclaration(n, node, config))
        .value();

const buildFieldDeclaration = (node, parent, config) => {
    const modifiers = getModifiers(node, config);
    const annotations = getAnnotations(node, config);
    const type = getValue(node.type);
    const comments = buildComments(node, parent, config);

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

const buildFieldDeclarations = (node, config) =>
    _.chain(node.bodyDeclarations)
        .filter(n => n.node === 'FieldDeclaration')
        .map(n => buildFieldDeclaration(n, node, config))
        .value();

const buildMethodDeclaration = (node, parent, config) => {
    const modifiers = getModifiers(node, config);
    const annotations = getAnnotations(node, config);
    const name = getValue(node.name);
    const constructor = node.constructor;
    const returnType = getValue(node.returnType2);
    const parameters = _.map(node.parameters, param => {
        return {
            name: getValue(param.name),
            type: getValue(param.type),
        };
    });
    const comments = buildComments(node, parent, config);

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

const buildMethodDeclarations = (node, config) =>
    _.chain(node.bodyDeclarations)
        .filter(n => n.node === 'MethodDeclaration')
        .map(n => buildMethodDeclaration(n, node, config))
        .value();

const buildClassDeclaration = (node, parent, config) => {
    return {
        type: 'Class',
        name: getName(node, config),
        modifiers: getModifiers(node, config),
        annotations: getAnnotations(node, config),
        comments: buildComments(node, parent, config),
        superclassType: getSuperclassType(node, config),
        superInterfaceTypes: getSuperInterfaceTypes(node, config),
        typeParameters: getTypeParameters(node, config),
        classDeclarations: buildMemberClassDeclarations(node, config),
        interfaceDeclarations: buildMemberInterfaceDeclarations(node, config),
        enumDeclarations: buildMemberEnumDeclarations(node, config),
        fieldDeclarations: buildFieldDeclarations(node, config),
        methodDeclarations: buildMethodDeclarations(node, config),
    };
};

const buildInterfaceDeclaration = (node, parent, config) => {
    return {
        type: 'Interface',
        name: getName(node, config),
        modifiers: getModifiers(node, config),
        annotations: getAnnotations(node, config),
        comments: buildComments(node, parent, config),
        superclassType: getSuperclassType(node, config),
        classDeclarations: buildMemberClassDeclarations(node, config),
        interfaceDeclarations: buildMemberInterfaceDeclarations(node, config),
        enumDeclarations: buildMemberEnumDeclarations(node, config),
        fieldDeclarations: buildFieldDeclarations(node, config),
        methodDeclarations: buildMethodDeclarations(node, config),
    };
};

const buildEnumDeclaration = (node, parent, config) => {
    return {
        type: 'Enum',
        name: getName(node, config),
        modifiers: getModifiers(node, config),
        annotations: getAnnotations(node, config),
        comments: buildComments(node, parent, config),
        superInterfaceTypes: getSuperInterfaceTypes(node, config),
        classDeclarations: buildMemberClassDeclarations(node, config),
        interfaceDeclarations: buildMemberInterfaceDeclarations(node, config),
        enumDeclarations: buildMemberEnumDeclarations(node, config),
        fieldDeclarations: buildFieldDeclarations(node, config),
        methodDeclarations: buildMethodDeclarations(node, config),
    };
};

const buildDoc = (node, config) => {
    if(node.node === 'TypeDeclaration') {
        if(node.interface) {
            return buildInterfaceDeclaration(node, null, config);
        }
        else {
            return buildClassDeclaration(node, null, config);
        }
    }
    else if(node.node === 'EnumDeclaration') {
        return buildEnumDeclaration(node, null, config);
    }
    else {
        return {};
    }
};

module.exports = buildDoc;
