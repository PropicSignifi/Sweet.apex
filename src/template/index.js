const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const utils = require('../utils');

let templates = null;

const loadTemplates = config => {
    const templates = {};

    if(config.templateDir) {
        const templateDir = config.cwd ?
            config.cwd + path.sep + utils.normalize(config.templateDir) :
            utils.normalize(config.templateDir);
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

const normalize = (text, config) => {
    if(!templates) {
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
