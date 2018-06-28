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
const AST = require('../../ast');
const getValue = require('../../valueProvider');

const Rethrow = {
    accept: ({ current, parent, }) => {
        const accepted =
            current.node === 'MethodDeclaration' &&
            AST.hasAnnotation(current.modifiers, 'rethrow');
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        const annotation = AST.findAnnotation(current.modifiers, 'rethrow');
        if(!annotation.value) {
            throw new Error('value is required for @rethrow');
        }

        const rethrowException = getValue(annotation.value);

        const newCode = `try {
        }
        catch(Exception e) {
            System.debug(LoggingLevel.Error, e.getStackTraceString());
            throw new ${rethrowException}(e.getMessage());
        }`;

        const newNode = AST.parseBlockStatement(newCode);
        newNode.body.statements = [
            ...current.body.statements
        ];

        AST.removeChildren(current.body, 'statements');
        AST.appendChild(current.body, 'statements', newNode);
        AST.removeChild(current, 'modifiers', annotation);
    },
};

module.exports = Rethrow;
