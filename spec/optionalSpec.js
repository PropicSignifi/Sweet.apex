const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'Optional';
const config = {
    features: ['optional'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("optional feature", function() {
    it("should generate optional methods", function() {
        const content = fs.readFileSync(joinPath(['resources', 'optional', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
