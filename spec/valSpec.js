const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'ValDemo';
const config = {
    features: ['val'],
    libraryDir: __dirname + '/../library',
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("val feature", function() {
    it("should infer variable type", function() {
        const content = fs.readFileSync(joinPath(['resources', 'val', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
