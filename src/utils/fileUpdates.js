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
const { getName, } = require('./index');

// Used to track the file update infos, so that only changes after last tracked file updates
// will actually run the transpilation
let fileUpdates = null;

// Get all file update infos
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

// Check if the file has changed since last file update checkpoint
const hasChanged = (fileName, config) => {
    const name = getName(fileName);
    const lastUpdated = fs.statSync(fileName).mtimeMs;
    const fileUpdates = getFileUpdates(config);

    return config.clean || !fileUpdates[name] || fileUpdates[name] < lastUpdated;
};

// Mark the file has been changed
const change = (fileName, config) => {
    const name = getName(fileName);
    const fileUpdates = getFileUpdates(config);
    fileUpdates[name] = Date.now();
};

// Flush the file update info to local storage
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
