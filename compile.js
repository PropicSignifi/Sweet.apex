const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const parse = require('./src/parser');
const compile = require('./src/compiler');

const [ , , ...args ] = process.argv;

let isDebugEnabled = false;
let srcDir = null;
let destDir = null;
const suffix = '.apex';

while(true) {
    const arg = _.first(args);
    if(arg === '-v') {
        isDebugEnabled = true;
        _.pullAt(args, 0);
    }
    else {
        break;
    }
}

srcDir = _.nth(args, 0) || __dirname + path.sep + 'resources';
destDir = _.nth(args, 1) || __dirname + path.sep + 'build';

if(!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
}

const config = {
    apiVersion: "42.0",
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

        const src = fs.readFileSync(srcDir + path.sep + fileName, 'utf8');

        const result = parse(src);
        if(isDebugEnabled) {
            console.log(JSON.stringify(result, null, 4));
        }

        const apexClass = compile(result);

        fs.writeFileSync(destDir + path.sep + name + '.cls', apexClass);

        fs.writeFileSync(destDir + path.sep + name + '.cls-meta.xml', meta);
    }
    catch(e) {
        console.log(e);
    }
});

console.log('Compilation Success');
