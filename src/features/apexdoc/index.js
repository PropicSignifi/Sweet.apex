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
const AST = require('../../ast');
const getValue = require('../../valueProvider');
const buildDoc = require('../../typings/builder');
const { log, } = require('../../utils');

const writeToDoc = (fileName, content, config) => {
    if(config.docDir) {
        if(!fs.existsSync(config.docDir)) {
            fs.mkdirSync(config.docDir);
        }

        const filePath = config.cwd + path.sep + config.docDir + path.sep + fileName;

        if(config.generateDoc === 'async') {
            fs.writeFile(filePath, content, (error, data) =>{
                if(error) {
                    console.error(error);
                    return;
                }

                log(`Generated apex doc to ${fileName}`, config);
            });
        }
        else if(config.generateDoc === 'sync') {
            fs.writeFileSync(filePath, content);
            log(`Generated apex doc to ${fileName}`, config);
        }
    }
};

const ApexDoc = {
    accept: ({ current, parent, root, }) => {
        const accepted =
            current.node === 'CompilationUnit';
        return accepted;
    },

    run: ({ current, parent, root, config, }) => {
        const topLevelType = AST.getTopLevelType(current);
        const fileName = getValue(topLevelType.name);

        const docs = buildDoc(current, {
            includeComments: true,
        });

        writeToDoc(`${fileName}.json`, JSON.stringify(docs, null, 4), config);
    },
};

module.exports = ApexDoc;
