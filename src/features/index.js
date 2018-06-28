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
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const AST = require('../ast');
const { time, timeEnd, } = require('../utils');

// The Sweet.apex features
let features = null;

// Load the features
const loadFeatures = () => {
    const features = {};

    _.each(fs.readdirSync(__dirname), fileName => {
        if(fileName === 'index.js') {
            return;
        }

        const name = fileName.endsWith('.js') ? fileName.substring(0, fileName.length - 3) : fileName;
        const feature = require('.' + path.sep + fileName);
        feature.name = name;
        features[name] = feature;
    });

    return features;
};

// Check if the feature accepts the AST node
const accept = (context, feature) => {
    if(_.isFunction(feature.accept)) {
        return feature.accept(context);
    }

    return false;
};

// Run the feature with the AST node
const run = (context, feature) => {
    if(_.isFunction(feature.run)) {
        feature.run(context);
    }
};

// Run the feature with the group of AST nodes
const runGroup = (group, feature) => {
    if(_.isFunction(feature.runGroup)) {
        feature.runGroup(group);
    }
};

// Set up the feature
const setUp = (config, feature) => {
    if(_.isFunction(feature.setUp)) {
        feature.setUp(config);
    }
};

// Tear down the feature
const tearDown = (config, feature) => {
    if(_.isFunction(feature.tearDown)) {
        feature.tearDown(config);
    }
};

// Rebuild the AST node with the feature
const rebuildWithFeature = (node, feature, config) => {
    const collected = [];

    AST.traverse(node, (current, parent) => {
        const context = {
            current,
            parent: parent || {},
            root: node || {},
            config,
        };

        if(accept(context, feature)) {
            collected.push(context);
        }
    });

    if(!_.isEmpty(collected)) {
        if(_.isFunction(feature.groupBy)) {
            const groups = _.groupBy(collected, feature.groupBy);

            _.each(groups, group => {
                runGroup(group, feature);
            });
        }
        else {
            _.each(collected, context => {
                run(context, feature);
            });
        }
    }
};

// Rebuild the node with all the features
const rebuild = (node, config) => {
    if(!node) {
        throw new Error('Node does not exist');
    }

    const fList = config.features;

    const features = getFeatures();

    time('Add index', config);
    AST.addIndex(node);
    timeEnd('Add index', config);

    time('Set up', config);
    _.each(fList, featureName => {
        const feature = features[featureName];
        if(!feature) {
            throw new Error(`No such feature "${featureName}" cound be found`);
        }

        setUp(config, feature);
    });
    timeEnd('Set up', config);

    _.each(fList, featureName => {
        const feature = features[featureName];

        time(`Rebuild with ${featureName}`, config);
        rebuildWithFeature(node, feature, config);
        timeEnd(`Rebuild with ${featureName}`, config);
    });

    time('Tear down', config);
    _.each(fList, featureName => {
        const feature = features[featureName];

        tearDown(config, feature);
    });
    timeEnd('Tear down', config);

    time('Remove index', config);
    AST.removeIndex(node);
    timeEnd('Remove index', config);
};

const getFeatures = () => {
    if(!features) {
        features = loadFeatures();
    }

    return features;
};

const getFeature = featureName => getFeatures[featureName];

module.exports = {
    rebuild,
    getFeatures,
    getFeature,
};
