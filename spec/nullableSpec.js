const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'NullableDemo';
const config = {
    features: ['nullable'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("nullable feature", function() {
    it("should convert nullable", function() {
        const content = fs.readFileSync(joinPath(['resources', 'nullable', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
