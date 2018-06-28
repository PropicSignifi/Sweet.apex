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
const _ = require('lodash');

// Compilers for each AST node
// A node compiler is used to compile the node into a specific string, usually multiple lines
let compilers = null;

// Load compilers
const loadCompilers = () => {
    const compilers = {};

    _.each(fs.readdirSync(__dirname), fileName => {
        if(fileName === 'index.js') {
            return;
        }

        const name = fileName.endsWith('.js') ? fileName.substring(0, fileName.length - 3) : fileName;
        const compiler = require('.' + path.sep + fileName);
        compilers[name] = compiler;
    });

    return compilers;
};

// Compile the AST node
const compile = (node, context) => {
    if(!node) {
        throw new Error('Node does not exist');
    }

    if(!compilers) {
        compilers = loadCompilers();
    }

    if(!context) {
        context = {
            lines: [],
            indent: '',
            toString: true,
        };
    }

    const c = compilers[node.node];
    if(c) {
        c(node, context);
    }
    else {
        throw new Error(`Failed to find compiler for ${node.node}`);
    }

    if(toString && node.node === 'CompilationUnit') {
        const apexClass = _.chain(context.lines)
            .flatMap(line => _.split(line, '\n'))
            .map(line =>  _.trim(line) === '' ? '' : line)
            .join('\n')
            .value();
        return apexClass;
    }
    else {
        return context.lines;
    }
};

module.exports = compile;
