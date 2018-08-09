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

const Constructor = {
    accept: ({ current, parent, root, }) => {
        const accepted =
            current.node === 'TypeDeclaration' &&
            AST.hasAnnotation(current.modifiers, 'constructor');
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        const typeDeclaration = current;
        const annotation = AST.findAnnotation(typeDeclaration.modifiers, 'constructor');
        let fields = [];
        const annotationValue = AST.getAnnotationValue(annotation);
        if(annotationValue) {
            const fieldsString = _.isPlainObject(annotationValue) ? annotationValue.fields : annotationValue;
            fields = _.chain(fieldsString)
                .trim('{} ')
                .split(',')
                .map(s => _.trim(s, "'' "))
                .value();
        }
        else {
            fields = _.chain(typeDeclaration.bodyDeclarations)
                .filter(n => n.node === 'FieldDeclaration' && !AST.hasModifier(n.modifiers, 'static'))
                .flatMap(n => _.map(n.fragments, f => getValue(f.name)))
                .value();
        }
        const fieldTypes = {};
        _.chain(typeDeclaration.bodyDeclarations)
            .filter(n => n.node === 'FieldDeclaration' && !AST.hasModifier(n.modifiers, 'static'))
            .forEach(n => {
                _.map(n.fragments, f => {
                    fieldTypes[getValue(f.name)] = getValue(n.type);
                });
            })
            .value();
        AST.removeChild(typeDeclaration, 'modifiers', annotation);

        const typeName = getValue(typeDeclaration.name);
        const params = _.map(fields, f => `${fieldTypes[f]} ${f}`).join(', ');
        const assigns = _.map(fields, f => `this.${f} = ${f};`).join('\n');

        const newCodes = [
            '\n',
            `public ${typeName}() {
            }`,
            '\n',
            `public ${typeName}(${params}) {
                ${assigns}
            }`,
        ];

        const newStatements = _.map(newCodes, AST.parseClassBodyDeclaration);
        AST.appendChildren(typeDeclaration, 'bodyDeclarations', newStatements);
    },
};

module.exports = Constructor;
