const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const transpile = require('./src/transpiler');
const build = require('./src/builder');
const { time, timeEnd, normalize, log, } = require('./src/utils');

const [ , currentFileName, ...args ] = process.argv;

let isDebugEnabled = false;
let isPerfEnabled = false;
let silent = false;
let srcDir = null;
let destDir = null;
const suffix = '.apex';

while(true) {
    const arg = _.first(args);
    if(arg === '-v') {
        isDebugEnabled = true;
        _.pullAt(args, 0);
    }
    else if(arg === '--perf') {
        isPerfEnabled = true;
        _.pullAt(args, 0);
    }
    else if(arg === '-s') {
        silent = true;
        _.pullAt(args, 0);
    }
    else {
        break;
    }
}

srcDir = _.nth(args, 0);
destDir = _.nth(args, 1);

const usage = () => {
    console.error(`Usage: node ${_.chain(currentFileName).split(path.sep).last().value()} <srcDir> <destDir>`);
};

const config = {
};

_.assign(config, JSON.parse(fs.readFileSync(__dirname + path.sep + 'config.json', 'utf8')), {
    isDebugEnabled,
    isPerfEnabled,
    silent,
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

const meta = `<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>${config.apiVersion}</apiVersion>
    <status>Active</status>
</ApexClass>
`;

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

const compileFile = (fileName, config) => {
    log(`Compiling ${fileName} ...`, config);

    const index = _.lastIndexOf(fileName, path.sep);
    const name = fileName.substring(index + 1, fileName.length - suffix.length);

    time(`Read file ${fileName}`, config);

    return new Promise((resolve, reject) => {
        fs.readFile(fileName, 'utf8', (error, src) => {
            timeEnd(`Read file ${fileName}`, config);
            if(error) {
                reject(error);
            }

            time(`Transpile`, config);
            const apexClass = transpile(src, config);
            timeEnd(`Transpile`, config);

            Promise.all([
                writeToFile(`${name}.cls`, apexClass, config)
                    .then(() => log(`Compiled ${config.destDir + name}.cls`, config)),
                writeToFile(`${name}.cls-meta.xml`, meta, config)
                    .then(() => log(`Compiled ${config.destDir + name}.cls-meta.xml`, config)),
            ]).then(resolve);
        });
    });
};

const start = Date.now();

let p = null;
if(config.srcDir.endsWith(path.sep)) {
    p = Promise.all(
        _.chain(fs.readdirSync(config.srcDir))
            .filter(name => name.endsWith(suffix))
            .map(name => compileFile(config.srcDir + name, config))
            .value()
    );
}
else {
    if(config.srcDir.endsWith(suffix)) {
        p = compileFile(config.srcDir, config);
    }
    else {
        console.error('Source file should have suffix: ' + suffix);
        return;
    }
}

p.then(() => build(config))
.then(
    () => {
        const end = Date.now();
        log(`Completed after ${end - start} ms`, config);
    },
    error => console.error(error)
);
