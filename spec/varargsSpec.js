const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');
const Typings = require('../src/typings');
const { getFeature, } = require('../src/features');

const targetFile = 'VarargsDemo';
const config = {
    features: ['varargs'],
};

Typings.addTyping({
    "methodDeclarations": [
        {
            "modifiers": [
                "private",
                "static"
            ],
            "name": "run",
            "parameters": [
                {
                    "name": "num",
                    "type": "Integer"
                },
                {
                    "name": "args",
                    "type": "String",
                    "varargs": true
                }
            ],
            "returnType": "void"
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
    "name": "VarargsDemo",
    "type": "Class"
}, config);

function joinPath(items) {
    return items.join(path.sep);
}

describe("varargs feature", function() {
    it("should convert varargs", function() {
        getFeature('varargs').setUp(config);

        const content = fs.readFileSync(joinPath(['resources', 'varargs', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
