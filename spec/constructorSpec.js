const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'ConstructorDemo';
const config = {
    features: ['constructor'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("constructor feature", function() {
    it("should generate constructors", function() {
        const content = fs.readFileSync(joinPath(['resources', 'constructor', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
