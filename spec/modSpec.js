const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'Mod';
const config = {
    features: ['mod'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("mod feature", function() {
    it("should convert % operator", function() {
        const content = fs.readFileSync(joinPath(['resources', 'mod', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
