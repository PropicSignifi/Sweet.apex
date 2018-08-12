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

const aliases = {};

const ImportAs = {
    accept: ({ current, parent, }) => {
        const accepted =
            current.node === 'CompilationUnit' ||
            current.node === 'SimpleName';
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        if(current.node === 'CompilationUnit') {
            _.chain(current.imports)
                .filter(i => !i.static && !!i.alias)
                .each(i => {
                    if(i.alias.node !== 'SimpleName') {
                        throw new Error('Import as can only use simple names');
                    }

                    aliases[i.alias.identifier] = _.cloneDeep(i.name);
                })
                .value();
        }
        else {
            if(aliases.hasOwnProperty(current.identifier)) {
                const newNode = _.cloneDeep(aliases[current.identifier]);
                AST.transform(current, newNode);
            }
        }
    },
};

module.exports = ImportAs;
