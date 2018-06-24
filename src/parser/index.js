const peg = require('pegjs');
const pegUtil = require('pegjs-util');
const fs = require('fs');
const path = require('path');

const pegFileName = 'apex.pegjs';
const pegContent = fs.readFileSync(__dirname + path.sep + pegFileName, 'utf8');

const allowedStartRules = [
    'CompilationUnit',
    'TypeDeclaration',
    'ClassBodyDeclaration',
    'BlockStatement',
    'Expression',
];
const parser = peg.generate(pegContent, {
    cache: true,
    allowedStartRules,
});

const parse = (src, options) => {
    const result = pegUtil.parse(parser, src, options);
    if(result.error) {
        throw new Error("ERROR: Parsing Failure:\n" +
        pegUtil.errorMessage(result.error, true).replace(/^/mg, "ERROR: "));
    }
    else {
        return result.ast;
    }
};

module.exports = parse;
