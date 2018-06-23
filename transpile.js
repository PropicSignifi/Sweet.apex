const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const transpile = require('./src/transpiler');
const { time, timeEnd, } = require('./src/utils');

const [ , currentFileName, ...args ] = process.argv;

let isDebugEnabled = false;
let isPerfEnabled = false;
let srcDir = null;
let destDir = null;
const suffix = '.apex';

while(true) {
    const arg = _.first(args);
    if(arg === '-v') {
        isDebugEnabled = true;
        _.pullAt(args, 0);
    }
    if(arg === '--perf') {
        isPerfEnabled = true;
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

if(!srcDir || !destDir) {
    usage();
    return;
}

if(!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
}

const config = {
    apiVersion: "42.0",
    isDebugEnabled,
    isPerfEnabled,
    features: null,
};

try {
    _.assign(config, JSON.parse(fs.readFileSync(__dirname + path.sep + 'config.json', 'utf8')));
}
catch(e) {
}

const meta = `<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>${config.apiVersion}</apiVersion>
    <status>Active</status>
</ApexClass>
`;

_.each(_.filter(fs.readdirSync(srcDir), name => name.endsWith(suffix)), fileName => {
    try {
        console.log(`Compiling ${fileName} ...`);

        const name = fileName.substring(0, fileName.length - suffix.length);

        time(`Read file ${fileName}`, config);
        fs.readFile(srcDir + path.sep + fileName, 'utf8', (error, src) => {
            timeEnd(`Read file ${fileName}`, config);
            if(error) {
                console.error(error);
                return;
            }

            time(`Transpile`, config);
            const apexClass = transpile(src, config);
            timeEnd(`Transpile`, config);

            time(`Write File ${name}.cls`, config);
            fs.writeFile(destDir + path.sep + name + '.cls', apexClass, (error, data) => {
                timeEnd(`Write File ${name}.cls`, config);
                if(error) {
                    console.error(error);
                    return;
                }

                console.log(`Compiled ${name}.cls`);
            });

            time(`Write File ${name}.cls-meta.xml`, config);
            fs.writeFile(destDir + path.sep + name + '.cls-meta.xml', meta, (error, data) => {
                timeEnd(`Write File ${name}.cls-meta.xml`, config);
                if(error) {
                    console.error(error);
                    return;
                }

                console.log(`Compiled ${name}.cls-meta.xml`);
            });
        });
    }
    catch(e) {
        console.log(e);
    }
});
