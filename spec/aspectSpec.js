const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');
const Typings = require('../src/typings');

const targetFile = 'AspectDemo';
const config = {
    cacheDir: __dirname + '/../cache',
    features: ['aspect'],
};

Typings.addTyping({
    "methodDeclarations": [
        {
            "annotations": [
                {
                    "typeName": "afterMethod",
                    "value": "'AspectDemo.version'"
                }
            ],
            "modifiers": [
                "public",
                "static"
            ],
            "name": "afterVersion",
            "parameters": [
                {
                    "name": "targetType",
                    "type": "Type"
                },
                {
                    "name": "base",
                    "type": "Integer"
                },
                {
                    "name": "result",
                    "type": "Integer"
                }
            ],
            "returnType": "Integer"
        },
        {
            "annotations": [
                {
                    "typeName": "beforeMethod",
                    "value": "'AspectDemo.run'"
                }
            ],
            "modifiers": [
                "public",
                "static"
            ],
            "name": "beforeRun",
            "parameters": [
                {
                    "name": "target",
                    "type": "AspectDemo"
                }
            ],
            "returnType": "void"
        },
        {
            "modifiers": [
                "public"
            ],
            "name": "run",
            "returnType": "void"
        },
        {
            "modifiers": [
                "public",
                "static"
            ],
            "name": "version",
            "parameters": [
                {
                    "name": "base",
                    "type": "Integer"
                }
            ],
            "returnType": "Integer"
        }
    ],
    "modifiers": [
        "public"
    ],
    "name": "AspectDemo",
    "type": "Class"
}, config);

function joinPath(items) {
    return items.join(path.sep);
}

describe("aspect feature", function() {
    it("should convert aspects", function() {
        const content = fs.readFileSync(joinPath(['resources', 'aspect', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
