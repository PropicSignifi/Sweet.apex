const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'DestructureDemo';
const config = {
    features: ['destructure'],
    libraryDir: __dirname + '/../library',
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("destructure feature", function() {
    it("should convert destructure", function() {
        const content = fs.readFileSync(joinPath(['resources', 'destructure', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
