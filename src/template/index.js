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

// All the templates
let templates = null;

// Load the templates
const loadTemplates = config => {
    const templates = {};

    if(config.templateDir) {
        const templateDir = config.templateDir;
        _.each(fs.readdirSync(templateDir), fileName => {
            const name = fileName.endsWith('.js') ? fileName.substring(0, fileName.length - 3) : fileName;
            const template = require(templateDir + path.sep + fileName);
            templates[name] = template;
        });
    }
    else if(config.templates) {
        _.assign(templates, config.templates);
    }

    return templates;
};

// Normalize the text, searching and replacing all the templates
const normalize = (text, config) => {
    if(_.isEmpty(templates)) {
        templates = loadTemplates(config);
    }

    let startIndex = -1;
    let endIndex = -1;
    let items = [];
    while(true) {
        startIndex = _.indexOf(text, '#', endIndex + 1);
        while(text.substring(startIndex - 1, startIndex) === '\\') {
            startIndex = _.indexOf(text, '#', startIndex + 1);
        }
        if(startIndex < 0) {
            items.push(text.substring(endIndex + 1));
            break;
        }

        items.push(text.substring(endIndex + 1, startIndex));

        endIndex = _.indexOf(text, ')', startIndex + 1);
        while(text.substring(endIndex - 1, endIndex) === '\\') {
            endIndex = _.indexOf(text, ')', endIndex + 1);
        }

        const templateText = text.substring(startIndex, endIndex + 1);
        const leftParPos = _.indexOf(templateText, '(');
        const templateName = templateText.substring(1, leftParPos);
        let templateParamsString = templateText.substring(leftParPos + 1, templateText.length - 1);
        templateParamsString = _.replace(templateParamsString, /\\,/g, '&#44;');
        const templateParams = _.split(templateParamsString, ',').map(_.trim).map(s => _.replace(s, /&#44;/g, ','));
        const template = templates[templateName];
        if(!template) {
            throw new Error(`Cound not found template for ${templateName}`);
        }

        const newString = template.apply(null, templateParams);
        items.push(newString);
    }

    return items.join('');
};

module.exports = normalize;
