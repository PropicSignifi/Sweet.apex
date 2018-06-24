const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'TemplateString';
const config = {
    features: ['template_string'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("Template string feature", function() {
    it("should convert template string", function() {
        const content = fs.readFileSync(joinPath(['resources', 'template_string', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
