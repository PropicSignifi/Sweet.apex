const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const AST = require('../ast');

let features = null;

const loadFeatures = () => {
    const features = {};

    _.each(fs.readdirSync(__dirname), fileName => {
        if(fileName === 'index.js') {
            return;
        }

        const name = fileName.endsWith('.js') ? fileName.substring(0, fileName.length - 3) : fileName;
        const compiler = require('.' + path.sep + fileName);
        features[name] = compiler;
    });

    return features;
};

const accept = (context, feature) => {
    if(_.isFunction(feature.accept)) {
        return feature.accept(context);
    }

    return false;
};

const run = (context, feature) => {
    if(_.isFunction(feature.run)) {
        feature.run(context);
    }
};

const rebuildWithFeature = (node, feature) => {
    const collected = [];
    AST.traverse(node, (current, parent) => {
        const context = {
            current,
            parent,
            root: node,
        };
        if(accept(context, feature)) {
            collected.push(context);
        }
    });

    if(!_.isEmpty(collected)) {
        _.each(collected, context => {
            run(context, feature);
        });
    }
};

const rebuild = (node, fList) => {
    if(!node) {
        throw new Error('Node does not exist');
    }

    if(!features) {
        features = loadFeatures();
    }

    _.each(features, (feature, featureName) => {
        if(fList && !_.includes(fList, featureName)) {
            return;
        }

        rebuildWithFeature(node, feature);
    });
};

module.exports = rebuild;
