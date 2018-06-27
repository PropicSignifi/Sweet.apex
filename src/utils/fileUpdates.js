const fs = require('fs');
const path = require('path');
const { getName, } = require('./index');

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
