const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'EnumTest';
const config = {
    features: ['enum'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("enum feature", function() {
    it("should convert enum structure", function() {
        const content = fs.readFileSync(joinPath(['resources', 'enum', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
