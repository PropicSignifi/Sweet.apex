const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');
const Typings = require('../src/typings');
const { getFeature, } = require('../src/features');

const targetFile = 'TaggedStringDemo';
const config = {
    features: ['tagged_string'],
};

Typings.addTyping({
    "methodDeclarations": [
        {
            "annotations": [
                {
                    "typeName": "tag"
                }
            ],
            "modifiers": [
                "public",
                "static"
            ],
            "name": "n",
            "parameters": [
                {
                    "name": "items",
                    "type": "List<String>"
                },
                {
                    "name": "values",
                    "type": "List<Object>"
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
    "name": "TaggedStringDemo",
    "type": "Class"
}, config);

function joinPath(items) {
    return items.join(path.sep);
}

describe("Tagged string feature", function() {
    it("should convert tagged strings", function() {
        getFeature('tagged_string').setUp(config);

        const content = fs.readFileSync(joinPath(['resources', 'tagged_string', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
