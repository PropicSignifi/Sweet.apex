const _ = require('lodash');

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
            if(terminated) {
                return false;
            }

            if(!value) {
                return;
            }

            if(_.isArray(value) && !_.isEmpty(value) && _.first(value).node) {
                _.each(value, item => {
                    const ret = _traverse(item, node, callback);
                    if(ret === false) {
                        terminated = true;
                        return false;
                    }
                });
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

const getParent = (root, current) => {
    if(!root || !current) {
        throw new Error('Root and current are required to get parent node');
    }

    let ret = null;

    traverse(root, (curr, parent) => {
        if(curr === current) {
            ret = parent;
            return false;
        }
    });

    return ret;
};

const AST = {
    traverse,
    getParent,
};

module.exports = AST;
