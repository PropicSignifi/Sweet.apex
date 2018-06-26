const _ = require('lodash');

const debug = (...values) => `
if(logger.isDebugEnabled()) {
    logger.debug(${_.join(values, ', ')});
}
`;

module.exports = debug;
