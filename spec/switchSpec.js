const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'SwitchTest';
const config = {
    features: ["switch"],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("Sweet.apex compiler", function() {
    it("should support switch syntax", function() {
        const content = fs.readFileSync(joinPath(['resources', 'switch', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
