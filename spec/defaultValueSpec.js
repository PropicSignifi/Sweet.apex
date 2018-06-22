const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'DefaultValue';
const config = {
    features: ['default_value'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("default_value feature", function() {
    it("should convert @defaultValue", function() {
        const content = fs.readFileSync(joinPath(['resources', 'default_value', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
