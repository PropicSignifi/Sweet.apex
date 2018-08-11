const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');
const Typings = require('../src/typings');
const { getFeature, } = require('../src/features');

const targetFile = 'PatchDemo';
const config = {
    features: ['patch'],
};

Typings.addTyping({
    "methodDeclarations": [
        {
            "annotations": [
                {
                    "typeName": "patch",
                    "value": "String"
                }
            ],
            "modifiers": [
                "public",
                "static"
            ],
            "name": "prefix",
            "parameters": [
                {
                    "name": "s",
                    "type": "String"
                },
                {
                    "name": "prefix",
                    "type": "String"
                }
            ],
            "returnType": "String"
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
    "name": "PatchDemo",
    "type": "Class"
}, config);

function joinPath(items) {
    return items.join(path.sep);
}

describe("patch feature", function() {
    it("should convert method patch", function() {
        getFeature('patch').setUp(config);

        const content = fs.readFileSync(joinPath(['resources', 'patch', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
