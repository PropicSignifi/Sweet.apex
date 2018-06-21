const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'ArrayCreation';
const config = {
    features: ['array_creation'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("array_creation feature", function() {
    it("should convert simplified array creations", function() {
        const content = fs.readFileSync(joinPath(['resources', 'array_creation', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
