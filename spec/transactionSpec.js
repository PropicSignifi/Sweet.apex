const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'TransactionDemo';
const config = {
    features: ['transaction'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("transaction feature", function() {
    it("should generate transactional methods", function() {
        const content = fs.readFileSync(joinPath(['resources', 'transaction', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
