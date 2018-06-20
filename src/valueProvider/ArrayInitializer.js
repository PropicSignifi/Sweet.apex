const _ = require('lodash');
const getValue = require('../valueProvider');

const ArrayInitializer = node => {
    const {
        expressions,
    } = node;

    return _.map(expressions, getValue).join(', ');
};

module.exports = ArrayInitializer;
