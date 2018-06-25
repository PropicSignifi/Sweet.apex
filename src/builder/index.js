const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { normalize, log, } = require('../utils');

const writeToFile = (fileName, content, config) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(config.fileDestDir + fileName, content, (error, data) => {
            if(error) {
                reject(error);
            }

            resolve(null);
        });
    });
};

const buildFile = (fileName, config) => {
    log(`Building ${fileName} ...`, config);

    const index = _.lastIndexOf(fileName, path.sep);
    const [ name, suffix ] = fileName.substring(index + 1).split('.');

    const meta = `<?xml version="1.0" encoding="UTF-8"?>
<StaticResource xmlns="http://soap.sforce.com/2006/04/metadata">
    <cacheControl>Private</cacheControl>
    <contentType>text/${suffix}</contentType>
</StaticResource>`;

    return new Promise((resolve, reject) => {
        fs.readFile(fileName, 'utf8', (error, src) => {
            if(error) {
                reject(error);
            }

            Promise.all([
                writeToFile(`${name}.resource`, src, config)
                    .then(() => log(`Built ${config.fileDestDir + name}.resource`, config)),
                writeToFile(`${name}.resource-meta.xml`, meta, config)
                    .then(() => log(`Built ${config.fileDestDir + name}.resource-meta.xml`, config)),
            ]).then(resolve);
        });
    });
};

const build = config => {
    if(!config.fileSrcDir) {
        console.error('Build stage is skipped because fileSrcDir is not set.');
        return;
    }
    if(!config.fileDestDir) {
        console.error('Build stage is skipped because fileDestDir is not set.');
        return;
    }

    config.fileSrcDir = normalize(config.fileSrcDir);

    if(!fs.existsSync(config.fileDestDir)) {
        fs.mkdirSync(config.fileDestDir);
    }

    config.fileDestDir = normalize(config.fileDestDir);

    return Promise.all(
        _.chain(fs.readdirSync(config.fileSrcDir))
            .map(name => buildFile(config.fileSrcDir + name, config))
            .value()
    );
};

module.exports = build;
