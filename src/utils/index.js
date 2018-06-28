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
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const getValue = require('../valueProvider');
const compile = require('../compiler');

// Add indent to the content
const addIndent = (content, indent) => {
    const lines = _.split(content, '\n');
    return _.map(lines, line => indent + line).join('\n');
};

// Add comments to the lines
const addComments = (lines, indent, comments) => {
    if(!_.isEmpty(comments)) {
        _.each(comments, comment => {
            lines.push(addIndent(comment.value, indent));
        });
    }
};

// Add body declarations
const addBodyDeclarations = (lines, indent, bodyDeclarations) => {
    _.each(bodyDeclarations, bodyDeclaration => {
        compile(bodyDeclaration, {
            lines,
            indent: indent + '    ',
        });
    });
};

// Add annotations
const addAnnotations = (lines, indent, annotations) => {
    _.each(_.filter(annotations, ann => ann.node === 'Annotation'), ann => {
        compile(ann, {
            lines,
            indent,
        });
    });
};

// Get the combined annotations as a string
const getAnnotations = modifiers => {
    const ret = _.map(_.filter(modifiers, modifier => modifier.node === 'Annotation'), getValue).join(' ');
    return _.isEmpty(ret) ? '' : ret + ' ';
};

// Get the combined modifiers as a string
const getModifiers = modifiers => {
    const ret = _.map(_.filter(modifiers, modifier => modifier.node === 'Modifier'), getValue).join(' ');
    return _.isEmpty(ret) ? '' : ret + ' ';
};

// Get the combined type parameters as a string
const getTypeParameters = typeParameters =>
    _.isEmpty(typeParameters) ?
        '' :
        '<' + _.map(typeParameters, getValue).join(', ') + '>';

// Get the extends super class as a string
const getExtendsSuperClass = superclassType =>
    superclassType ? ' extends ' + getValue(superclassType) : '';

// Get the implements interfaces as a string
const getImplementsInterfaces = superInterfaceTypes =>
    _.isEmpty(superInterfaceTypes) ? '' : ' implements ' + _.map(superInterfaceTypes, getValue).join(', ');

const perfCounters = {};

// Start the performance timing
const time = (message, config) => {
    if(config.isPerfEnabled) {
        perfCounters[message] = {
            message,
            start: Date.now(),
        };
    }
};

// Stop the performance timing
const timeEnd = (message, config) => {
    if(config.isPerfEnabled) {
        const counter = perfCounters[message];
        counter.end = Date.now();
        counter.duration = counter.end - counter.start;

        log(`${message}: ${counter.duration}`, config);
    }
};

// Check if the file is a directory
const isDirectory = dir => {
    try {
        return fs.lstatSync(dir).isDirectory();
    }
    catch(e) {
        return false;
    }
};

// Normalize the file name
const normalize = file => {
    if(isDirectory(file)) {
        file = file.endsWith(path.sep) ? file : file + path.sep;
    }

    return file;
};

// Log the message
const log = (message, config) => {
    if(!config) {
        throw new Error('Config is not passed in');
    }

    if(!config.silent) {
        console.log(message);
    }
};

// Write to the file into the destination directory
const writeToFile = (fileName, content, config) => {
    time(`Write File ${fileName}`, config);

    return new Promise((resolve, reject) => {
        fs.writeFile(config.destDir + fileName, content, (error, data) => {
            timeEnd(`Write File ${fileName}`, config);
            if(error) {
                reject(error);
            }

            resolve(null);
        });
    });
};

// Get the name(without suffix) from the filename
const getName = fileName => {
    const startIndex = _.lastIndexOf(fileName, path.sep);
    const endIndex = _.lastIndexOf(fileName, '.');
    const name = fileName.substring(startIndex + 1, endIndex);
    return name;
};

// Copy file from one location to another
const copyFile = (src, dest) => fs.createReadStream(src).pipe(fs.createWriteStream(dest));

module.exports = {
    addIndent,
    addComments,
    addBodyDeclarations,
    addAnnotations,
    getModifiers,
    getAnnotations,
    getTypeParameters,
    getExtendsSuperClass,
    getImplementsInterfaces,
    time,
    timeEnd,
    normalize,
    log,
    writeToFile,
    getName,
    copyFile,
};
