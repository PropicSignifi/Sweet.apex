const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'ImportAsDemo';
const config = {
    features: ['import_as'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("import_as feature", function() {
    it("should convert type aliases", function() {
        const content = fs.readFileSync(joinPath(['resources', 'import_as', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
