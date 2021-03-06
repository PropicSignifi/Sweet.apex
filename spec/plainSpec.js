const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'Plain';
const config = {
    features: [],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("Sweet.apex compiler", function() {
    it("should support plain old apex", function() {
        const content = fs.readFileSync(joinPath(['resources', 'plain', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
