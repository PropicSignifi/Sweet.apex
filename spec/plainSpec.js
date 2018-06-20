const fs = require('fs');
const path = require('path');
const parse = require('../src/parser');
const compile = require('../src/compiler');

const targetFile = 'Plain';

function joinPath(items) {
    return items.join(path.sep);
}

describe("Sweet.apex compiler", function() {
    it("should support plain old apex", function() {
        const content = fs.readFileSync(joinPath(['resources', targetFile + '.apex']), 'utf8');
        const node = parse(content);
        const result = compile(node);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
