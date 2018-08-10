const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'PipelineDemo';
const config = {
    features: ['pipeline'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("pipeline feature", function() {
    it("should convert pipeline", function() {
        const content = fs.readFileSync(joinPath(['resources', 'pipeline', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
