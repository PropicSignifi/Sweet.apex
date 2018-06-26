const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'TemplateDemo';
const config = {
    templateDir: __dirname + '/../template',
    features: ['log'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("template feature", function() {
    it("should translate templates", function() {
        const content = fs.readFileSync(joinPath(['resources', 'template', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
