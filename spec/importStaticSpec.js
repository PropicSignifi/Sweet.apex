const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');
const Typings = require('../src/typings');

const targetFile = 'ImportStaticDemo';
const config = {
    features: ['import_static'],
    libraryDir: __dirname + '/../library',
};

Typings.addTyping({
    "methodDeclarations": [
        {
            "modifiers": [
                "public",
                "static"
            ],
            "name": "main",
            "returnType": "void"
        }
    ],
    "modifiers": [
        "public"
    ],
    "name": "ImportStaticDemo",
    "type": "Class"
}, config);

function joinPath(items) {
    return items.join(path.sep);
}

describe("import static feature", function() {
    it("should import static classes", function() {
        const content = fs.readFileSync(joinPath(['resources', 'import_static', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
