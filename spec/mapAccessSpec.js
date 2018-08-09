const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'MapAccess';
const config = {
    features: ['map_access'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("map access feature", function() {
    it("should convert map access", function() {
        const content = fs.readFileSync(joinPath(['resources', 'map_access', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
