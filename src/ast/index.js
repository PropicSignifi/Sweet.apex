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
const parse = require('../parser');
const getValue = require('../valueProvider');
const compile = require('../compiler');
const { log, } = require('../utils');

// Traverse the AST nodes
const _traverse = (node, parent, callback, skip) => {
    if(!node) {
        return;
    }

    callback = callback || _.noop;

    if(skip && _.isFunction(skip)) {
        if(skip(node, parent)) {
            return;
        }
    }

    const ret = callback(node, parent);
    let terminated = false;
    if(ret === false) {
        terminated = true;
    }

    if(!terminated) {
        _.forOwn(node, (value, key) => {
            if(key === 'parent') {
                // Skip index
                return;
            }

            if(terminated) {
                return false;
            }

            if(!value) {
                return;
            }

            if(_.isArray(value) && !_.isEmpty(value) && _.first(value).node) {
                for(let i in value) {
                    const item = value[i];
                    const ret = _traverse(item, node, callback, skip);
                    if(ret === false) {
                        terminated = true;
                        return false;
                    }
                }
            }
            else if(value.node) {
                const ret = _traverse(value, node, callback, skip);
                if(ret === false) {
                    terminated = true;
                }
            }
        });
    }

    if(terminated) {
        return false;
    }
};

// Traverse the AST nodes
const traverse = (node, callback, skip) => {
    _traverse(node, null, callback, skip);
};

// Add parent indexes through the AST nodes
// Parent indexes are added to make node referencing more convenient
const addIndex = root => {
    traverse(root, (curr, parent) => {
        curr.parent = parent;
        setUpScope(curr);
    });
};

const setUpScope = (current) => {
    if(!current) {
        return;
    }

    if(current.node === 'TypeDeclaration' ||
        current.node === 'EnumDeclaration' ||
        current.node === 'AnnotationTypeDeclaration') {
        current.scope = {};

        const fieldDeclarations = _.filter(current.bodyDeclarations, n => n.node === 'FieldDeclaration');
        _.forEach(fieldDeclarations, fieldDeclaration => {
            const type = getValue(fieldDeclaration.type);
            _.forEach(fieldDeclaration.fragments, fragment => {
                const name = getValue(fragment.name);
                current.scope[name] = type;
            });
        });

        const name = getValue(current.name);
        const top = getEnclosingType(current);
        if(top && current !== top) {
            current.scope['this'] = getValue(top.name) + '.' + name;
        }
        else {
            current.scope['this'] = name;
        }
        if(current.superclassType) {
            current.scope['super'] = getValue(current.superclassType);
        }
    }
    else if(current.node === 'Initializer' ||
        current.node === 'DoStatement' ||
        current.node === 'WhileStatement') {
        current.scope = {};
    }
    else if(current.node === 'IfStatement') {
        if(current.thenStatement) {
            current.thenStatement.scope = {};
        }

        if(current.elseStatement) {
            current.elseStatement.scope = {};
        }
    }
    else if(current.node === 'TryStatement') {
        current.body.scope = {};

        if(current['finally']) {
            current['finally'].scope = {};
        }
    }
    else if(current.node === 'CatchClause') {
        current.scope = {};
        const ex = current.exception;
        const name = getValue(ex.name);
        const type = getValue(ex.type);
        current.scope[name] = type;
    }
    else if(current.node === 'EnhancedForStatement') {
        current.scope = {};
        const param = current.parameter;
        const name = getValue(param.name);
        const type = getValue(param.type);
        current.scope[name] = type;
    }
    else if(current.node === 'MethodDeclaration') {
        current.scope = {};
        _.forEach(current.parameters, param => {
            const name = getValue(param.name);
            const type = getValue(param.type);
            current.scope[name] = type;
        });
    }
    else if(current.node === 'LambdaExpression') {
        current.scope = {};
        _.forEach(current.args, arg => {
            const name = getValue(arg.name);
            const type = getValue(arg.type);
            current.scope[name] = type;
        });
    }
    else if(current.node === 'VariableDeclarationStatement') {
        const type = getValue(current.type);
        const enclosingScope = getEnclosingScope(current);
        if(enclosingScope) {
            _.forEach(current.fragments, fragment => {
                const name = getValue(fragment.name);
                enclosingScope[name] = type;
            });
        }
    }
};

const getEnclosingScope = current => {
    if(!current) {
        return null;
    }

    const parent = current.parent;
    if(!parent) {
        return null;
    }
    if(parent.scope) {
        return parent.scope;
    }
    else {
        return getEnclosingScope(parent);
    }
};

const getScopeDepths = current => {
    if(!current || !current.parent) {
        return 0;
    }

    return (current.scope ? 1 : 0) + getScopeDepths(current.parent);
};

const printScopes = (root, config) => {
    traverse(root, (curr, parent) => {
        if(curr.scope) {
            log(`${_.repeat('--> ', getScopeDepths(curr))}${curr.node}[${curr.name ? getValue(curr.name) : 'Unknown'}]: ${JSON.stringify(curr.scope)}`, config);
        }
    });
};

// Remove parent indexes from the AST nodes
const removeIndex = root => {
    traverse(root, (curr, parent) => {
        curr.parent = null;
    });
};

// Get the parent of the AST node
const getParent = (root, current) => {
    if(!root || !current) {
        throw new Error('Root and current are required to get parent node');
    }

    return current.parent;
};

// Parse the content from the given start rule
const _parse = (type, content) => {
    const node = parse(content, {
        startRule: type,
    });

    return node;
};

// Parse the type declaration
const parseTypeDeclaration = content => _parse('TypeDeclaration', content);

// Parse the class body declaration
const parseClassBodyDeclaration = content => _parse('ClassBodyDeclaration', content);

// Parse the expression
const parseExpression = content => _parse('Expression', content);

// Parse the block statement
const parseBlockStatement = line => _parse('BlockStatement', line);

// Parse the block statements
const parseBlockStatements = lines => _.map(lines, parseBlockStatement);

// Parse the compilation unit
const parseCompilationUnit = content => _.parse('CompilationUnit', content);

// Parse the type
const parseType = content => _parse('Type', content);

// Get the method signature from the type and method
const getMethodSignature = (methodDeclaration, typeDeclaration) => {
    if(typeDeclaration) {
        const typeName = getValue(typeDeclaration.name);
        const methodName = getValue(methodDeclaration.name);
        return `${typeName}.${methodName}(${_.map(methodDeclaration.parameters, param => getValue(param.type)).join(', ')})`;
    }
    else {
        const methodName = getValue(methodDeclaration.name);
        return `${methodName}(${_.map(methodDeclaration.parameters, param => getValue(param.type)).join(', ')})`;
    }
};

// Transform the current AST node into the target node
const transform = (srcNode, destNode) => {
    if(!srcNode || !destNode) {
        return;
    }

    _.each(Object.keys(srcNode), key => {
        if(key === 'parent') {
            return;
        }

        delete srcNode[key];
    });

    destNode.parent = srcNode.parent;

    _.assign(srcNode, destNode);

    addIndex(srcNode);
};

// Find the target modifier name from the list of modifiers
const findModifier = (modifiers, target) => _.find(modifiers, { node: 'Modifier', keyword: target });

// Check if the list of modifiers contains the target modifier name
const hasModifier = (modifiers, target) => !!findModifier(modifiers, target);

// Find the target annotation by name from the list of modifiers
// In Sweet.apex, modifiers and annotations are all listed in modifiers
const findAnnotation = (modifiers, target) => _.find(modifiers, modifier => modifier.node === 'Annotation' && getValue(modifier.typeName) === target);

// Check if the list of modifiers contains the target annotation by name
const hasAnnotation = (modifiers, target) => !!findAnnotation(modifiers, target);

// Create a parsed empty line
const parseEmptyLine = () => ({
    node: 'LineEmpty',
});

// Find the next AST node of the current node
const findNext = (parent, current) => {
    if(!parent || !current) {
        return null;
    }

    let next = null;

    _.forOwn(parent, (value, key) => {
        if(key === 'parent') {
            return;
        }

        if(_.isArray(value) && _.includes(value, current)) {
            const index = _.indexOf(value, current);
            if(index < _.size(value) - 1) {
                next = _.nth(value, index + 1);
                return false;
            }
        }
    });

    return next;
};

// Find the previous AST node of the current node
const findPrev = (parent, current) => {
    if(!parent || !current) {
        return null;
    }

    let prev = null;

    _.forOwn(parent, (value, key) => {
        if(key === 'parent') {
            return;
        }

        if(_.isArray(value) && _.includes(value, current)) {
            const index = _.indexOf(value, current);
            if(index > 0) {
                prev = _.nth(value, index - 1);
                return false;
            }
        }
    });

    return prev;
};

// Set the child AST node to the given name of the parent
const setChild = (parent, name, child) => {
    if(parent && name && child) {
        parent[name] = child;
        child.parent = parent;

        addIndex(child);
    }
};

// Remove the child from the given name of the parent
const removeChild = (parent, name, child) => {
    if(parent && name) {
        if(_.isArray(parent[name])) {
            if(child) {
                _.pull(parent[name], child);
                child.parent = null;
            }
            else {
                parent[name] = [];
            }
        }
        else {
            parent[name] = null;
            if(child) {
                child.parent = null;
            }
        }
    }
};

// Remove the children from the given name of the parent
const removeChildren = removeChild;

// Prepend a child to the given name of the parent
const prependChild = (parent, name, child) => {
    if(parent && name && child) {
        if(!parent[name]) {
            parent[name] = [];
        }

        parent[name] = [
            child,
            ...parent[name],
        ];

        child.parent = parent;
        addIndex(child);
    }
};

// Prepend children to the given name of the parent
const prependChildren = (parent, name, children) => {
    if(parent && name && children) {
        if(!parent[name]) {
            parent[name] = [];
        }

        parent[name] = [
            ...children,
            ...parent[name],
        ];

        _.each(children, child => {
            child.parent = parent;
            addIndex(child);
        });
    }
};

// Append a child to the given name of the parent
const appendChild = (parent, name, child) => {
    if(parent && name && child) {
        if(!parent[name]) {
            parent[name] = [];
        }

        parent[name] = [
            ...parent[name],
            child,
        ];

        child.parent = parent;
        addIndex(child);
    }
};

// Append children to the given name of the parent
const appendChildren = (parent, name, children) => {
    if(parent && name && children) {
        if(!parent[name]) {
            parent[name] = [];
        }

        parent[name] = [
            ...parent[name],
            ...children,
        ];

        _.each(children, child => {
            child.parent = parent;
            addIndex(child);
        });
    }
};

// Insert a child before the target to the given name of the parent
const insertChildBefore = (parent, name, target, child) => {
    if(parent && name && target && child) {
        if(!parent[name]) {
            parent[name] = [];
        }

        const index = _.indexOf(parent[name], target);
        if(index >= 0) {
            parent[name] = [
                ..._.slice(parent[name], 0, index),
                child,
                ..._.slice(parent[name], index),
            ];
            child.parent = parent;
            addIndex(child);
        }
    }
};

// Insert a child after the target to the given name of the parent
const insertChildAfter = (parent, name, target, child) => {
    if(parent && name && target && child) {
        if(!parent[name]) {
            parent[name] = [];
        }

        const index = _.indexOf(parent[name], target);
        if(index >= 0) {
            parent[name] = [
                ..._.slice(parent[name], 0, index + 1),
                child,
                ..._.slice(parent[name], index + 1),
            ];
            child.parent = parent;
            addIndex(child);
        }
    }
};

// Insert children before the target to the given name of the parent
const insertChildrenBefore = (parent, name, target, children) => {
    if(parent && name && target && children) {
        if(!parent[name]) {
            parent[name] = [];
        }

        const index = _.indexOf(parent[name], target);
        if(index >= 0) {
            parent[name] = [
                ..._.slice(parent[name], 0, index),
                ...children,
                ..._.slice(parent[name], index),
            ];

            _.each(children, child => {
                child.parent = parent;
                addIndex(child);
            });
        }
    }
};

// Insert children after the target to the given name of the parent
const insertChildrenAfter = (parent, name, target, children) => {
    if(parent && name && target && children) {
        if(!parent[name]) {
            parent[name] = [];
        }

        const index = _.indexOf(parent[name], target);
        if(index >= 0) {
            parent[name] = [
                ..._.slice(parent[name], 0, index + 1),
                ...children,
                ..._.slice(parent[name], index + 1),
            ];

            _.each(children, child => {
                child.parent = parent;
                addIndex(child);
            });
        }
    }
};

// Get the unique name of the AST node
const getUniqueName = node => {
    const items = [];
    let curr = node;
    while(curr) {
        if(curr.name) {
            items.push(getValue(curr.name));
        }

        curr = curr.parent;
    }

    _.reverse(items);

    return _.join(items, '_');
};

// Get the value of the annotation
const getAnnotationValue = annotation => {
    if(annotation.value) {
        return getValue(annotation.value);
    }
    else if(annotation.values) {
        const data = {};
        _.each(annotation.values, pair => {
            data[getValue(pair.name)] = getValue(pair.value);
        });

        return data;
    }
    else {
        return null;
    }
};

// Get a simplified version of the annotation
const getAnnotation = annotation => {
    const data = {
        typeName: getValue(annotation.typeName),
    };

    if(annotation.value) {
        data.value = getValue(annotation.value);
    }
    else if(annotation.values) {
        data.values = _.map(annotation.values, pair => {
            return {
                name: getValue(pair.name),
                value: getValue(pair.value),
            };
        });
    }

    return data;
};

// Get the top level type
const getTopLevelType = root => {
    return root.types[0];
};

// Get the enclosing type of this AST node
const getEnclosingType = node => {
    return _getEnclosing('TypeDeclaration', node);
};

// Get the enclosing method of this AST node
const getEnclosingMethod = node => {
    return _getEnclosing('MethodDeclaration', node);
};

// Get the enclosing field of this AST node
const getEnclosingField = node => {
    return _getEnclosing('FieldDeclaration', node);
};

// Get the enclosing AST node of the given node with the type
const _getEnclosing = (type, node) => {
    let current = node;
    while(current) {
        if(current.node === type) {
            break;
        }

        current = current.parent;
    }

    return current;
};

// Get a simplified version of parameters
const getParameters = parameters => _.map(parameters, param => {
    return {
        name: getValue(param.name),
        type: getValue(param.type),
    };
});

// Get the compiled string of the AST node
const getCompiled = node => {
    const lines = [];
    compile(node, {
        lines,
        indent: '',
    });

    return lines;
};

const AST = {
    traverse,
    getParent,
    parseBlockStatement,
    parseBlockStatements,
    parseTypeDeclaration,
    parseClassBodyDeclaration,
    parseExpression,
    parseCompilationUnit,
    parseType,
    getMethodSignature,
    addIndex,
    removeIndex,
    transform,
    hasModifier,
    findModifier,
    hasAnnotation,
    findAnnotation,
    parseEmptyLine,
    findNext,
    findPrev,
    setChild,
    removeChild,
    removeChildren,
    appendChild,
    appendChildren,
    prependChild,
    prependChildren,
    insertChildBefore,
    insertChildAfter,
    insertChildrenBefore,
    insertChildrenAfter,
    getUniqueName,
    getAnnotationValue,
    getTopLevelType,
    getEnclosingType,
    getEnclosingMethod,
    getEnclosingField,
    getParameters,
    getCompiled,
    getAnnotation,
    getEnclosingScope,
    printScopes,
};

module.exports = AST;
