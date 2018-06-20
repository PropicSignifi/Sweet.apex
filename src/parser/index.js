const peg = require('pegjs');
const fs = require('fs');
const path = require('path');

const pegFileName = 'apex.pegjs';
const pegContent = fs.readFileSync(__dirname + path.sep + pegFileName, 'utf8');
const parser = peg.generate(pegContent);

const parse = src => {
    try {
        return parser.parse(src);
    }
    catch(e) {
        if(e instanceof parser.SyntaxError) {
            throw new Error(`Error found at line ${e.location.start.line}, column ${e.location.start.column}:\n${e.message}`);
        }
        else {
            throw e;
        }
    }
};

module.exports = parse;
