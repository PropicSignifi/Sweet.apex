const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'LogDemo';
const config = {
    features: ['log'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("log feature", function() {
    it("should add logger statement", function() {
        const content = fs.readFileSync(joinPath(['resources', 'log', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
