const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'FeatureOrder';
const config = {
    features: [
        'not_null',
        'default_value',
        'function',
    ],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("Feature orders", function() {
    it("should be followed", function() {
        const content = fs.readFileSync(joinPath(['resources', 'feature_order', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
