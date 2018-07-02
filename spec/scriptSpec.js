const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'ScriptDemo';
const config = {
    cwd: __dirname + path.sep + '..',
    features: ['script'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("script feature", function() {
    it("should generate exported javascript functions", function() {
        const content = fs.readFileSync(joinPath(['resources', 'script', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
