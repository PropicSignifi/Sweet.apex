const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'Lambda';
const config = {
    features: ['lambda'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("lambda feature", function() {
    it("should convert lambda Funcs", function() {
        const content = fs.readFileSync(joinPath(['resources', 'lambda', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
