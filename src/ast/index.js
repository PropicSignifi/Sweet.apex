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

const AST = {
    traverse,
    getParent,
    parseBlockStatement,
    parseBlockStatements,
    getMethodSignature,
    addIndex,
    removeIndex,
};

module.exports = AST;
