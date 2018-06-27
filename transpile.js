const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const transpile = require('./src/transpiler');
const finalize = require('./src/finalizer');
const build = require('./src/builder');
const { time, timeEnd, normalize, log, writeToFile, getName, } = require('./src/utils');
const FileUpdates = require('./src/utils/fileUpdates');
const Typings = require('./src/typings');

const [ , currentFileName, ...args ] = process.argv;

const suffix = '.apex';

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

let isDebugEnabled = options.v;
let isPerfEnabled = options.perf;
let silent = options.s;
let clean = options.c;
let ignoreErrors = options.i;
let srcDir = _.nth(items, 0);
let destDir = _.nth(items, 1);

const usage = () => {
    console.error(`Usage: node ${_.chain(currentFileName).split(path.sep).last().value()} <srcDir> <destDir>`);
};

const config = {
};

_.assign(config, JSON.parse(fs.readFileSync(__dirname + path.sep + 'config.json', 'utf8')), {
    isDebugEnabled,
    isPerfEnabled,
    silent,
    clean,
    ignoreErrors,
});

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

const meta = `<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>${config.apiVersion}</apiVersion>
    <status>Active</status>
</ApexClass>
`;

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
    srcFiles = _.chain(fs.readdirSync(config.srcDir))
        .filter(name => name.endsWith(suffix))
        .map(name => config.srcDir + name)
        .value();
}
else {
    if(config.srcDir.endsWith(suffix)) {
        srcFiles = [ config.srcDir ];
    }
    else {
        console.error('Source file should have suffix: ' + suffix);
        return;
    }
}

const isFileExcluded = (file, config) => {
    return _.some(config.scanExcludePatterns, pattern => new RegExp(pattern).test(file));
};

Promise.resolve(srcFiles)
    .then(files => {
        const names = _.map(files, getName);
        const destFiles = _.chain(fs.readdirSync(config.destDir))
            .filter(name => name.endsWith('.cls') && !_.includes(names, getName(name)))
            .map(name => config.destDir + name)
            .value();

        return Promise.resolve([ ...files, ...destFiles, ])
            .then(files => {
                return Promise.all(
                    _.chain(files)
                        .reject(file => isFileExcluded(file, config))
                        .reject(file => !FileUpdates.hasChanged(file, config))
                        .map(file =>
                            Typings.scan(file, config)
                                .then(() => log(`Scanned ${file}`, config))
                                .then(() => FileUpdates.change(file, config))
                        )
                        .value()
                );
            })
            .then(data => {
                log(`Scanned ${_.size(data)} files`, config);
                return files;
            });
    })
    .then(files => Promise.all(_.map(files, file => compileFile(file, config))))
    .then(() => finalize(config))
    .then(() => build(config))
    .then(() => FileUpdates.flush(config))
    .then(() => Typings.flush(config))
    .then(
        () => {
            const end = Date.now();
            log(`Completed after ${end - start} ms`, config);
        },
        error => console.error(error)
    );
