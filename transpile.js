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
const transpile = require('./src/transpiler');
const setUp = require('./src/setUp');
const finalize = require('./src/finalizer');
const build = require('./src/builder');
const { time, timeEnd, normalize, log, writeToFile, getName, } = require('./src/utils');
const FileUpdates = require('./src/utils/fileUpdates');
const Typings = require('./src/typings');

const [ , currentFileName, ...args ] = process.argv;

// Default source file suffix
const suffix = '.apex';

// Load options
const options = {};
const items = [];
while(true) {
    const arg = _.first(args);
    if(!arg) {
        break;
    }
    if(arg.startsWith('-')) {
        options[_.trimStart(arg, '-')] = true;
    }
    else {
        items.push(arg);
    }

    _.pullAt(args, 0);
    if(_.isEmpty(args)) {
        break;
    }
}

// Print debug information, mainly for parsed AST node structure
let isDebugEnabled = options.v;

// Print performance tracing information
let isPerfEnabled = options.perf;

// Whether all printing is disabled
let silent = options.s;

// Ignore file update check and trigger a new transpilation every time
let clean = options.c;

// Whether to continue transpilation despite of single failures
let ignoreErrors = options.i;

// Whether to print CLI help
let showHelp = options.h;

// Whether to empty generated class comment
let emptyGeneratedClassComment = options.e;

// The source directory, where your '.apex' files reside
let srcDir = _.nth(items, 0);

// The destination directory, where your '.cls' files reside
let destDir = _.nth(items, 1);

// Specify features to run with
let features = _.nth(items, 2);

const help = `Sweet Apex Transpilation Usage:

Usage: node ${_.chain(currentFileName).split(path.sep).last().value()} [-options] [srcDir] [destDir] [features]

Where:
    srcDir     -> The source directory or the single source file, using './resources' by default
    destDir    -> The destination diretory where the Apex classes reside, using './build' by default
    features   -> The list of features enabled, separated by comma, using all features by default

Options:
    -v         -> Show debug information, false by default
    --perf     -> Show performance information, false by default
    -s         -> Silent mode, disabling all prints, false by default
    -c         -> Clean mode, removing all cache files, false by default
    -i         -> Ignore errors, continuing even if there are errors, false by default
    -e         -> Empty generated class comment, false by default
    -h         -> Show this help message

Note:
    All these can be configured in 'config.json'.
`;

if(showHelp) {
    console.log(help);
    return;
}

const usage = () => {
    console.error(`Usage: node ${_.chain(currentFileName).split(path.sep).last().value()} [-options] [srcDir] [destDir] [features]`);
};

const config = {
};

// Apply options from command line with highest priorities
_.assign(config, JSON.parse(fs.readFileSync(__dirname + path.sep + 'config.json', 'utf8')), {
    isDebugEnabled,
    isPerfEnabled,
    silent,
    clean,
    ignoreErrors,
});

if(features) {
    config.features = _.split(features, ',');
}

if(emptyGeneratedClassComment) {
    config.generatedClassComment = '';
}

if(srcDir) {
    config.srcDir = srcDir;
}

if(destDir) {
    config.destDir = destDir;
}

if(!config.srcDir || !config.destDir) {
    usage();
    return;
}

// Set up directories
config.srcDir = normalize(config.srcDir);

if(!fs.existsSync(config.destDir)) {
    fs.mkdirSync(config.destDir);
}

config.destDir = normalize(config.destDir);

config.cwd = __dirname;

if(config.templateDir) {
    config.templateDir = config.cwd + path.sep + normalize(config.templateDir);
}

config.cacheDir = config.cwd + path.sep  + normalize('cache');
if(!fs.existsSync(config.cacheDir)) {
    fs.mkdirSync(config.cacheDir);
}

config.libraryDir = config.cwd + path.sep  + normalize('library');

if(config.clean) {
    _.each(fs.readdirSync(config.cacheDir), file => {
        fs.unlinkSync(config.cacheDir + path.sep + file);
    });

    log('Cleaned cache', config);
}

// Meta content for apex class files
const meta = `<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>${config.apiVersion}</apiVersion>
    <status>Active</status>
</ApexClass>
`;

// Compile each single source file
const compileFile = (fileName, config) => {
    log(`Compiling ${fileName} ...`, config);

    const name = getName(fileName);

    time(`Read file ${fileName}`, config);

    return new Promise((resolve, reject) => {
        if(!FileUpdates.hasChanged(fileName, config)) {
            log(`Skipped ${fileName}`, config);
            resolve(null);
        }
        else {
            fs.readFile(fileName, 'utf8', (error, src) => {
                timeEnd(`Read file ${fileName}`, config);
                if(error) {
                    reject(error);
                }

                try {
                    time(`Transpile`, config);
                    const apexClass = transpile(src, config);
                    timeEnd(`Transpile`, config);

                    Promise.all([
                        writeToFile(`${name}.cls`, apexClass, config)
                            .then(() => log(`Compiled ${config.destDir + name}.cls`, config)),
                        writeToFile(`${name}.cls-meta.xml`, meta, config)
                            .then(() => log(`Compiled ${config.destDir + name}.cls-meta.xml`, config)),
                    ])
                    .then(() => FileUpdates.change(fileName, config))
                    .then(resolve);
                }
                catch(e) {
                    if(config.ignoreErrors) {
                        console.error(new Error(`Failed to compile ${fileName}:\n${e}`));
                        resolve(null);
                    }
                    else {
                        reject(new Error(`Failed to compile ${fileName}:\n${e}`));
                        console.error(`Failed to compile ${fileName}`);
                        throw e;
                    }
                }
            });
        }
    });
};

const start = Date.now();

let srcFiles = [];
if(config.srcDir.endsWith(path.sep)) {
    // Load files from the source directory
    srcFiles = _.chain(fs.readdirSync(config.srcDir))
        .filter(name => name.endsWith(suffix))
        .map(name => config.srcDir + name)
        .value();
}
else {
    // Load single input file
    if(config.srcDir.endsWith(suffix)) {
        srcFiles = [ config.srcDir ];
    }
    else {
        console.error('Source file should have suffix: ' + suffix);
        return;
    }
}

// Exclude certain files
const isFileExcluded = (file, config) => {
    return _.some(config.scanExcludePatterns, pattern => new RegExp(pattern).test(file));
};

// The main process of transpilation
Promise.resolve(srcFiles)
    .then(files => {
        // Stage 1 Scanning
        // Scan all the files to build typings information

        // Include .cls files from destination directory
        const names = _.map(files, getName);
        const destFiles = _.chain(fs.readdirSync(config.destDir))
            .filter(name => name.endsWith('.cls') && !_.includes(names, getName(name)))
            .map(name => config.destDir + name)
            .value();

        return Promise.resolve([ ...files, ...destFiles, ])
            .then(files => {
                return Promise.all(
                    _.chain(files)
                        .reject(file => isFileExcluded(file, config)) // exclude some files
                        .reject(file => !FileUpdates.hasChanged(file, config)) // exclude unchanged files
                        .map(file =>
                            Typings.scan(file, config) // Scan files for typings
                                .then(() => log(`Scanned ${file}`, config))
                                .then(() => {
                                    if(_.includes(destFiles, file)) {
                                        FileUpdates.change(file, config); // Mark files as touched
                                    }
                                })
                        )
                        .value()
                );
            })
            .then(data => {
                log(`Scanned ${_.size(data)} files`, config);
                return files;
            });
    })
    // Stage 2 Set up
    // Run the setup
    .then(files => {
        setUp(config);
        return files;
    })
    // Stage 3 Transpiling
    // Transpile all the source files
    .then(files => Promise.all(_.map(files, file => compileFile(file, config)))) // Compile files
    // Stage 4 Finalizing
    // Run the finalization
    .then(() => finalize(config)) // Run finalize
    // Stage 5 Building
    // Build other files
    .then(() => build(config)) // Run build
    // Stage 6 Finishing
    // Persist tracking information and finish the process
    .then(() => FileUpdates.flush(config)) // Flush file update infos to local storage
    .then(() => Typings.flush(config)) // Flush typings info to local storage
    .then(
        () => {
            const end = Date.now();
            log(`Completed after ${end - start} ms`, config);
        },
        error => console.error(error)
    );
