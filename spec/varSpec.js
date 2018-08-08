const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'VarDemo';
const config = {
    features: ['var'],
    libraryDir: __dirname + '/../library',
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("var feature", function() {
    it("should infer variable type", function() {
        const content = fs.readFileSync(joinPath(['resources', 'var', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
