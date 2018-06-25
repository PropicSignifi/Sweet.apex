const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'ApexDoc';
const config = {
    features: ['apexdoc'],
    generateDoc: 'sync',
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("apexdoc feature", function() {
    it("should generate apex doc", function() {
        const content = fs.readFileSync(joinPath(['resources', 'apexdoc', targetFile + '.apex']), 'utf8');
        transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.json']), 'utf8');
        const result = fs.readFileSync(joinPath(['docs', targetFile + '.json']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
