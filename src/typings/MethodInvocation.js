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
const _ = require('lodash');
const Typings = require('./index.js');
const AST = require('../ast');
const getValue = require('../valueProvider');

const MethodInvocation = (node, config) => {
    const name = getValue(node.name);
    const expression = node.expression;
    const argTypes = _.map(node.arguments, arg => Typings.checkType(arg, config));

    let expressionType = null;
    if(expression) {
        expressionType = Typings.checkType(expression, config);
    }
    else {
        const type = AST.getEnclosingType(node);
        expressionType = getValue(type.name);
    }

    const typing = Typings.lookup(expressionType, AST.getRootTypeName(node), config);
    const result = Typings.getMethodType(typing, name, argTypes, config);
    if(!result) {
        let varargsMethod = Typings.findVarargsMethod(node, config);
        if(varargsMethod) {
            return varargsMethod.returnType;
        }
        else {
            throw new Error(`Failed to resolve: ${name}(${argTypes.join(', ')})`);
        }
    }
    else {
        return result;
    }
};

module.exports = MethodInvocation;
