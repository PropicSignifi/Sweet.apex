const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'ActionDemo';
const config = {
    features: ['action'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("action feature", function() {
    it("should generate action subclasses", function() {
        const content = fs.readFileSync(joinPath(['resources', 'action', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
