const _ = require('lodash');
const fs = require('fs');
const build = require('./builder');
const { time, timeEnd, getName, } = require('../utils');
const FileUpdates = require('../utils/fileUpdates');
const normalize = require('../template');
const parse = require('../parser');

const allTypings = {};

const slim = typings => {
    _.each(typings, (value, key) => {
        if(_.isEmpty(value)) {
            delete typings[key];
        }
        else {
            slim(value);
        }
    });
};

const add = node => {
    const typings = build(node, {
        includeComments: false,
    });

    slim(typings);

    allTypings[typings.name] = typings;
};

const scan = (fileName, config) => {
    const name = getName(fileName);
    time(`Scan file ${fileName}`, config);

    return new Promise((resolve, reject) => {
        if(!FileUpdates.hasChanged(fileName, config)) {
            resolve(null);
        }
        else {
            fs.readFile(fileName, 'utf8', (error, src) => {
                timeEnd(`Scan file ${fileName}`, config);
                if(error) {
                    reject(error);
                }

                try {
                    time('Normalize', config);
                    src = normalize(src, config);
                    timeEnd('Normalize', config);

                    time('Parse', config);
                    const result = parse(src);
                    timeEnd('Parse', config);

                    add(result);

                    resolve(result);
                }
                catch(e) {
                    reject(new Error(`Failed to scan ${fileName}:\n${e}`));
                }
            });
        }
    });
};

const Typings = {
    add,
    scan,
};

module.exports = Typings;
