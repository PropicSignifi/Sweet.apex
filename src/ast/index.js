const _ = require('lodash');
const parse = require('../parser');
const getValue = require('../valueProvider');
const compile = require('../compiler');

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

const traverse = (node, callback, skip) => {
    _traverse(node, null, callback, skip);
};

const addIndex = root => {
    traverse(root, (curr, parent) => {
        curr.parent = parent;
    });
};

const removeIndex = root => {
    traverse(root, (curr, parent) => {
        curr.parent = null;
    });
};

const getParent = (root, current) => {
    if(!root || !current) {
        throw new Error('Root and current are required to get parent node');
    }

    return current.parent;
};

const _parse = (type, content) => {
    const node = parse(content, {
        startRule: type,
    });

    return node;
};

const parseTypeDeclaration = content => {
    return _parse('TypeDeclaration', content);
};

const parseClassBodyDeclaration = content => {
    return _parse('ClassBodyDeclaration', content);
};

const parseExpression = content => {
    return _parse('Expression', content);
};

const parseBlockStatement = line => {
    return _parse('BlockStatement', line);
};

const parseBlockStatements = lines => _.map(lines, parseBlockStatement);

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

const findModifier = (modifiers, target) => _.find(modifiers, { node: 'Modifier', keyword: target });

const hasModifier = (modifiers, target) => !!findModifier(modifiers, target);

const findAnnotation = (modifiers, target) => _.find(modifiers, modifier => modifier.node === 'Annotation' && getValue(modifier.typeName) === target);

const hasAnnotation = (modifiers, target) => !!findAnnotation(modifiers, target);

const parseEmptyLine = () => ({
    node: 'LineEmpty',
});

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

const setChild = (parent, name, child) => {
    if(parent && name && child) {
        parent[name] = child;
        child.parent = parent;

        addIndex(child);
    }
};

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

const removeChildren = removeChild;

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

const getTopLevelType = root => {
    return root.types[0];
};

const getEnclosingType = node => {
    return _getEnclosing('TypeDeclaration', node);
};

const getEnclosingMethod = node => {
    return _getEnclosing('MethodDeclaration', node);
};

const getEnclosingField = node => {
    return _getEnclosing('FieldDeclaration', node);
};

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

const getParameters = parameters => _.map(parameters, param => {
    return {
        name: getValue(param.name),
        type: getValue(param.type),
    };
});

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
};

module.exports = AST;
