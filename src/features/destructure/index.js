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
const Typings = require('../../typings');

const getReassign = (name, collectionType, initializer) => {
    return {
        node: "VariableDeclarationStatement",
        fragments: [
            {
                node: "VariableDeclarationFragment",
                name: {
                    identifier: name,
                    node: "SimpleName"
                },
                extraDimensions: 0,
                initializer: {
                    node: "CastExpression",
                    type: collectionType,
                    expression: initializer,
                },
                accessor: null
            }
        ],
        modifiers: [],
        type: collectionType,
    };
};

const Destructure = {
    accept: ({ current, parent, }) => {
        const accepted =
            current.node === 'DestructureStatement';
        return accepted;
    },

    run: ({ current, parent, root, config, }) => {
        const destrutureName = 'destructure_' + AST.getOffsetInSiblings(current);
        const globalType = current.type ? getValue(current.type) : null;
        const initializer = current.initializer;

        let collectionType = null;
        let isList = false;
        const returnType = Typings.checkType(initializer, config);
        if(returnType && _.toUpper(returnType).startsWith('LIST<')) {
            collectionType = AST.parseType('List<Object>');
            isList = true;
        }
        else if(_.toUpper(returnType).startsWith('MAP<')){
            collectionType = AST.parseType('Map<String, Object>');
        }
        else {
            collectionType = AST.parseType('SObject');
        }

        const pairs = [];
        _.forEach(current.variables.expressions, expr => {
            const pair = {
                name: getValue(expr.name),
            };
            if(expr.rename) {
                if(expr.rename.type) {
                    pair.type = getValue(expr.rename.type);
                }

                if(expr.rename.name) {
                    pair.newName = getValue(expr.rename.name);
                }
            }

            if(pair.name === '_' && !isList) {
                return;
            }

            pairs.push(pair);
        });

        const reassign = getReassign(destrutureName, collectionType, initializer);
        const newNodes = [ reassign ];
        _.forEach(pairs, (pair, index) => {
            let name = pair.newName ? pair.newName : pair.name;
            let type = pair.type ? pair.type : globalType;
            if(!type) {
                throw new Error('No destructuring type could be found');
            }
            let line = null;
            if(isList) {
                line = `${type} ${name} = (${type})${destrutureName}.get(${index});`;
            }
            else {
                line = `${type} ${name} = (${type})${destrutureName}.get('${pair.name}');`;
            }
            newNodes.push(AST.parseBlockStatement(line));
        });

        AST.insertChildrenAfter(parent, 'statements', current, newNodes);
        AST.removeChild(parent, 'statements', current);
    },
};

module.exports = Destructure;
