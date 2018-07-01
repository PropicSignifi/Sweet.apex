const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'PlainScript';
const config = {
    features: [],
    generateJavaScript: true,
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("Sweet.apex compiler", function() {
    it("should support generate plain old apex to javascript", function() {
        const content = fs.readFileSync(joinPath(['resources', 'plainScript', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.js']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
