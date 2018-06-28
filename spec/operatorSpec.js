const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');
const Typings = require('../src/typings');

const targetFile = 'OperatorDemo';
const config = {
    cacheDir: __dirname + '/../cache',
    features: ['operator'],
};

Typings.addTyping({
    "methodDeclarations": [
        {
            "annotations": [
                {
                    "typeName": "operator"
                }
            ],
            "modifiers": [
                "public",
                "static"
            ],
            "name": "add",
            "parameters": [
                {
                    "name": "a",
                    "type": "Integer"
                },
                {
                    "name": "b",
                    "type": "Integer"
                }
            ],
            "returnType": "Integer"
        },
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
    "name": "OperatorDemo",
    "type": "Class"
}, config);

function joinPath(items) {
    return items.join(path.sep);
}

describe("operator feature", function() {
    it("should convert custom operators", function() {
        const content = fs.readFileSync(joinPath(['resources', 'operator', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
