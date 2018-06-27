const _ = require('lodash');
const { getFeature, } = require('../features');

const finalize = config => {
    return Promise.all(
        _.chain(config.features)
            .map(featureName => getFeature(featureName))
            .filter(f => f && _.isFunction(f.finalize))
            .map(f => f.finalize(config))
            .value()
    );
};

module.exports = finalize;
