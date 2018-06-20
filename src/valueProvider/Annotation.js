const _ = require('lodash');
const getValue = require('./index.js');

const Annotation = node => {
    const {
        value,
        values,
    } = node;

    if(value) {
        return getValue(value);
    }

    if(values) {
        return _.fromPairs(_.map(values, pair => {
            return [ getValue(pair.name), getValue(pair.value) ];
        }));
    }
};

module.exports = Annotation;
