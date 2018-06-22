const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'Function';
const config = {
    features: ['function'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("function feature", function() {
    it("should convert 'func' methods into Funcs", function() {
        const content = fs.readFileSync(joinPath(['resources', 'function', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
