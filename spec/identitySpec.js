const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'Identity';
const config = {
    features: ['identity'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("identity feature", function() {
    it("should generate hashCode and equals", function() {
        const content = fs.readFileSync(joinPath(['resources', 'identity', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
