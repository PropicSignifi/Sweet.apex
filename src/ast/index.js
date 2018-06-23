const _ = require('lodash');
const parse = require('../parser');
const getValue = require('../valueProvider');

const _traverse = (node, parent, callback) => {
    if(!node) {
        return;
    }

    callback = callback || _.noop;

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
                    const ret = _traverse(item, node, callback);
                    if(ret === false) {
                        terminated = true;
                        return false;
                    }
                }
            }
            else if(value.node) {
                const ret = _traverse(value, node, callback);
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

const traverse = (node, callback) => {
    _traverse(node, null, callback);
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

const parseTypeDeclaration = content => {
    const newTypeDeclaration = parse(content, {
        startRule: 'TypeDeclaration',
    });

    return newTypeDeclaration;
};

const parseClassBodyDeclaration = content => {
    const newClassBodyDeclaration = parse(content, {
        startRule: 'ClassBodyDeclaration',
    });

    return newClassBodyDeclaration;
};

const parseBlockStatement = line => {
    const newBlockStatement = parse(line, {
        startRule: 'BlockStatement',
    });

    return newBlockStatement;
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

    _.assign(srcNode, destNode);

    addIndex(srcNode);
};

const hasModifier = (modifiers, target) => !!_.find(modifiers, { node: 'Modifier', keyword: target });

const hasAnnotation = (modifiers, target) => !!_.find(modifiers, modifier => modifier.node === 'Annotation' && getValue(modifier.typeName) === target);

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
    if(parent && child) {
        parent[name] = child;
        child.parent = parent;

        addIndex(child);
    }
};

const removeChild = (parent, name, child) => {
    if(parent) {
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
    if(parent && child) {
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

const preppendChildren = (parent, name, children) => {
    if(parent && children) {
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
    if(parent && child) {
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

const apppendChildren = (parent, name, children) => {
    if(parent && children) {
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

const AST = {
    traverse,
    getParent,
    parseBlockStatement,
    parseBlockStatements,
    parseTypeDeclaration,
    parseClassBodyDeclaration,
    getMethodSignature,
    addIndex,
    removeIndex,
    transform,
    hasModifier,
    hasAnnotation,
    parseEmptyLine,
    findNext,
    findPrev,
    setChild,
    removeChild,
    removeChildren,
    appendChild,
    apppendChildren,
    prependChild,
    preppendChildren,
};

module.exports = AST;
