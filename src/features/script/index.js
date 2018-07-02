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
const compileScript = require('../../compilerScript');
const getValue = require('../../valueProvider');
const { writeToScriptFile, } = require('../../utils');

const ScriptGenerator = {
    types: {},
};

const generateMethodsScript = config => {
    const lines = [];

    _.each(ScriptGenerator.types, (type, typeName) => {
        _.each(type, (method, methodName) => {
            if(method.comment) {
                lines.push(method.comment);
            }
            const script = `const ${typeName}_${methodName} = ${method.script}`;
            lines.push(
                _.chain(script)
                    .split('\n')
                    .map(line => '    ' + line)
                    .join('\n')
                    .value()
            );
        });
    });

    return lines.join('\n');
};

const generateTypeDeclarationsScript = config => {
    const lines = [];

    _.each(ScriptGenerator.types, (type, typeName) => {
        lines.push(`    const ${typeName} = {};`);
    });

    return lines.join('\n');
};

const generateTypesScript = config => {
    const lines = [];

    _.each(ScriptGenerator.types, (type, typeName) => {
        _.each(type, (method, methodName) => {
            lines.push(`    ${typeName}.${methodName} = ${typeName}_${methodName};`);
        });
    });

    return lines.join('\n');
};

const generateExportScript = config => {
    const scriptAppName = config.scriptAppName || '$SweetApp';

    const lines = [
        `    const ${scriptAppName} = {};`,
    ];

    _.each(ScriptGenerator.types, (type, typeName) => {
        lines.push(`    ${scriptAppName}.${typeName} = ${typeName};`);
    });

    lines.push(`    window.${scriptAppName} = ${scriptAppName};`);

    return lines.join('\n');
};

const generateScript = config => {
    return `;;
(function() {
    ${config.generatedClassComment ? config.generatedClassComment : ''}

${generateTypeDeclarationsScript(config)}

    ${generateMethodsScript(config)}

${generateTypesScript(config)}

${generateExportScript(config)}
})();`;
};

const Script = {
    accept: ({ current, parent, }) => {
        const passed = current.node === 'MethodDeclaration' &&
            AST.hasAnnotation(current.modifiers, 'script');

        return passed;
    },

    run: ({ current, parent, root, }) => {
        if(!AST.hasModifier(current.modifiers, 'public') && !AST.hasModifier(current.modifiers, 'global')) {
            throw new Error('Should be public/global method');
        }
        if(!AST.hasModifier(current.modifiers, 'static')) {
            throw new Error('Should be static method');
        }

        const annotation = AST.findAnnotation(current.modifiers, 'script');
        AST.removeChild(current, 'modifiers', annotation);

        const typeName = getValue(parent.name);
        const methodName = getValue(current.name);

        const method = {};

        const prevNode = AST.findPrev(parent, current);
        if(prevNode.node.endsWith('Comment')) {
            const comment = AST.getCompiled(prevNode).join('\n');
            method.comment = comment;
        }
        else {
            method.comment = '';
        }

        const firstChild = _.first(current.body.statements);
        let nativeScript = null;
        if(firstChild && firstChild.node.endsWith('Comment')) {
            const comment = AST.getCompiled(firstChild).join('\n');
            if(comment.startsWith('/* @script')) {
                const bodyScript = _.chain(comment)
                    .split('\n')
                    .slice(1, -1)
                    .map(line => '    ' + _.trimStart(line, '* '))
                    .join('\n')
                    .value();
                nativeScript = 'function ' + methodName + `(${_.map(current.parameters, param => getValue(param.name)).join(', ')}) {\n`;
                nativeScript +=  bodyScript + '\n';
                nativeScript += '}';
            }
        }

        if(!nativeScript) {
            const context = {
                lines: [],
                indent: '',
            };
            compileScript(current, context);
            nativeScript = context.lines.join('\n');
        }

        method.script = nativeScript;

        let type = ScriptGenerator.types[typeName];
        if(!type) {
            type = {};
        }
        type[methodName] = method;
        ScriptGenerator.types[typeName] = type;
    },

    finalize: config => {
        const scriptName = config.scriptName || 'sweetApp';
        const script = generateScript(config);

        writeToScriptFile(scriptName.endsWith('.js') ? scriptName : scriptName + '.js', script, config);
    },
};

module.exports = Script;
