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

// Value providers for AST nodes
// A value provider is used to provide inline string representations of the AST nodes
let valueProviders = null;

// Load value providers
const loadValueProviders = () => {
    const providers = {};

    _.each(fs.readdirSync(__dirname), fileName => {
        if(fileName === 'index.js') {
            return;
        }

        const name = fileName.endsWith('.js') ? fileName.substring(0, fileName.length - 3) : fileName;
        const provider = require('.' + path.sep + fileName);
        providers[name] = provider;
    });

    return providers;
};

// Get the value of the AST node
const getValue = node => {
    if(!node) {
        throw new Error('Node does not exist');
    }

    if(!valueProviders) {
        valueProviders = loadValueProviders();
    }

    const valueProvider = valueProviders[node.node];
    if(valueProvider) {
        return valueProvider(node);
    }
    else {
        throw new Error(`Failed to get value for ${node.node}`);
    }
};

module.exports = getValue;
