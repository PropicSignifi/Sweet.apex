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
const normalize = require('../template');
const parse = require('../parser');
const { rebuild, } = require('../features');
const compile = require('../compiler');
const { time, timeEnd, log, } = require('../utils');

// Run the transpilation process
const transpile = (src, config) => {
    // Stage 1 Normalizing
    // Search and replace template texts
    time('Normalize', config);
    src = normalize(src, config);
    timeEnd('Normalize', config);

    // Stage 2 Parsing
    // Parse the text into AST nodes
    time('Parse', config);
    const result = parse(src);
    timeEnd('Parse', config);
    if(config.isDebugEnabled) {
        log(JSON.stringify(result, null, 4), config);
    }

    // Stage 3 Rebuilding
    // Rebuild the AST nodes
    time('Rebuild', config);
    rebuild(result, config);
    timeEnd('Rebuild', config);
    if(config.isDebugEnabled) {
        log('--------- After Rebuild ----------', config);
        log(JSON.stringify(result, null, 4), config);
    }

    // Stage 4 Compiling
    // Compile AST nodes into string representation
    time('Compile', config);
    const apexClass = compile(result);
    timeEnd('Compile', config);

    return apexClass;
};

module.exports = transpile;
