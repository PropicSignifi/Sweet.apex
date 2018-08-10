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
const getValue = require('../valueProvider');
const AST = require('../ast');
const Typings = require('../typings');
const _ = require('lodash');

const SimpleName = (node, config) => {
    const name = getValue(node);
    if(AST.maybeVariable(node)) {
        const variableContext = config.variableContext || AST.getScope(node);
        const rootTypeName = AST.getRootTypeName(node);

        if(variableContext && variableContext[name]) {
            return variableContext[name];
        }
        else {
            const typing = Typings.lookup(name, rootTypeName, config);
            if(typing) {
                return name;
            }
            else if(_.includes(config.reservedIdentifiers, name)) {
                return name;
            }
            else {
                throw new Error('Failed to resolve identifier: ' + name);
            }
        }
    }
    else {
        return name;
    }
};

module.exports = SimpleName;
