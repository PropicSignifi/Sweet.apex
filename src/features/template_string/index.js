const _ = require('lodash');
const AST = require('../../ast');

const TemplateString = {
    accept: ({ current, parent, }) => {
        const accepted =
            current.node === 'TemplateStringLiteral';
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        let templateString = current.escapedValue.substring(1, current.escapedValue.length - 1);
        templateString = templateString.replace(/(?:\r\n|\r|\n)/g, '\\n');
        const items = [];
        let startIndex = 0;
        let endIndex = 0;
        while(true) {
            startIndex = templateString.indexOf('${', endIndex);
            if(startIndex < 0) {
                items.push("'" + templateString.substring(endIndex, templateString.length) + "'");
                break;
            }

            items.push("'" + templateString.substring(endIndex, startIndex) + "'");

            endIndex = templateString.indexOf('}', startIndex);
            if(endIndex < 0) {
                throw new Error('Invalid template string');
            }

            items.push(templateString.substring(startIndex + 2, endIndex));

            endIndex += 1;
        }

        const line = _.join(items, ' + ');
        const newNode = AST.parseExpression(line);
        AST.transform(current, newNode);
    },
};

module.exports = TemplateString;
