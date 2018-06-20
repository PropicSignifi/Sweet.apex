const fs = require('fs');
const path = require('path');
const _ = require('lodash');

let valueProviders = null;

const loadValueProviders = () => {
    const providers = {};

    _.each(fs.readdirSync(__dirname), fileName => {
        if(fileName === 'index.js') {
            return;
        }

        const name = fileName.endsWith('.js') ? fileName.substring(0, fileName.length - 3) : fileName;
        const provider = require('.' + path.sep + fileName);
        providers[name] = provider;
    });

    return providers;
};

const getValue = node => {
    if(!node) {
        throw new Error('Node does not exist');
    }

    if(!valueProviders) {
        valueProviders = loadValueProviders();
    }

    const valueProvider = valueProviders[node.node];
    if(valueProvider) {
        return valueProvider(node);
    }
    else {
        throw new Error(`Failed to get value for ${node.node}`);
    }
};

module.exports = getValue;
