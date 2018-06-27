const _ = require('lodash');
const fs = require('fs');
const path = require('path');

let fileUpdates = null;

const getFileUpdates = config => {
    if(!fileUpdates) {
        const fileUpdatesPath = config.cacheDir + path.sep + 'fileUpdates.json';
        if(fs.existsSync(fileUpdatesPath)) {
            try {
                fileUpdates = JSON.parse(fs.readFileSync(fileUpdatesPath, 'utf8'));
            }
            catch(e) {
                console.error('Failed to load file updates', e);
            }
        }
    }

    if(!fileUpdates) {
        fileUpdates = {};
    }

    return fileUpdates;
};

const getName = fileName => {
    const startIndex = _.lastIndexOf(fileName, path.sep);
    const endIndex = _.lastIndexOf(fileName, '.');
    const name = fileName.substring(startIndex + 1, endIndex);
    return name;
};

const hasChanged = (fileName, config) => {
    const name = getName(fileName);
    const lastUpdated = fs.statSync(fileName).mtimeMs;
    const fileUpdates = getFileUpdates(config);

    return config.clean || !fileUpdates[name] || fileUpdates[name] < lastUpdated;
};

const change = (fileName, config) => {
    const name = getName(fileName);
    const fileUpdates = getFileUpdates(config);
    fileUpdates[name] = Date.now();
};

const flush = (config) => {
    const fileUpdatesPath = config.cacheDir + path.sep + 'fileUpdates.json';
    const fileUpdates = getFileUpdates(config);
    fs.writeFileSync(fileUpdatesPath, JSON.stringify(fileUpdates));
};

const FileUpdates = {
    getFileUpdates,
    hasChanged,
    change,
    flush,
};

module.exports = FileUpdates;
