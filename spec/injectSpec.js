const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'Inject';
const config = {
    features: ['inject'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("inject feature", function() {
    it("should convert @inject", function() {
        const content = fs.readFileSync(joinPath(['resources', 'inject', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
