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
const peg = require('pegjs');
const pegUtil = require('pegjs-util');
const fs = require('fs');
const path = require('path');

// The peg file name that defines the grammar
const pegFileName = 'apex.pegjs';

// The content of the grammar file
const pegContent = fs.readFileSync(__dirname + path.sep + pegFileName, 'utf8');

// Only these entries are allowed in the grammar file
const allowedStartRules = [
    'CompilationUnit',
    'TypeDeclaration',
    'ClassBodyDeclaration',
    'BlockStatement',
    'Expression',
    'Type',
];

// The generated peg parser
// Use cache to improve performance
const parser = peg.generate(pegContent, {
    cache: true,
    allowedStartRules,
});

// Parse the source code into AST nodes
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
