const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'ReflectDemo';
const config = {
    features: ['reflect'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("reflect feature", function() {
    it("should create reflection code", function() {
        const content = fs.readFileSync(joinPath(['resources', 'reflect', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
