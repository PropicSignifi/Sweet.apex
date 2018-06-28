const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');

const targetFile = 'CastDemo';
const config = {
    features: ['cast'],
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("cast feature", function() {
    it("should convert cast expressions", function() {
        const content = fs.readFileSync(joinPath(['resources', 'cast', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);

        const castUtilsContent = fs.readFileSync(joinPath(['resources', 'benchmark', 'cast_Utils.cls']), 'utf8');
        const castUtilsExpect = fs.readFileSync(joinPath(['resources', 'benchmark', 'cast_Utils.cls.expect']), 'utf8');

        expect(castUtilsContent).toEqual(castUtilsExpect);
    });
});
