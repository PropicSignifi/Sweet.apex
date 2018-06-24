const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'Rethrow';
const config = {
    features: ['rethrow'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("rethrow feature", function() {
    it("should surround the body and rethrow the exception", function() {
        const content = fs.readFileSync(joinPath(['resources', 'rethrow', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
