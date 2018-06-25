const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'FileDemo';
const config = {
    features: ['file'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("file feature", function() {
    it("should convert @file", function() {
        const content = fs.readFileSync(joinPath(['resources', 'file', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
