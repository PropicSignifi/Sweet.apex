const fs = require('fs');
const path = require('path');
const transpile = require('../src/transpiler');
const Typings = require('../src/typings');
const { getFeature, } = require('../src/features');

const targetFile = 'AnnotationDemo';
const config = {
    features: ['annotation'],
};

Typings.addTyping({
    "annotationDeclarations": [
        {
            "fieldDeclarations": [
                {
                    "modifiers": [
                        "public"
                    ],
                    "name": "name",
                    "type": "String"
                },
                {
                    "default": "10",
                    "modifiers": [
                        "public"
                    ],
                    "name": "number",
                    "type": "Integer"
                }
            ],
            "modifiers": [
                "public"
            ],
            "name": "MyAnnotation",
            "type": "Annotation"
        }
    ],
    "annotations": [
        {
            "typeName": "MyAnnotation",
            "values": [
                {
                    "name": "name",
                    "value": "'Test'"
                }
            ]
        }
    ],
    "modifiers": [
        "public"
    ],
    "name": "AnnotationDemo",
    "type": "Class"
}, config);

function joinPath(items) {
    return items.join(path.sep);
}

describe("annotation feature", function() {
    it("should support custom annotation", function() {
        getFeature('annotation').setUp(config);

        const content = fs.readFileSync(joinPath(['resources', 'annotation', targetFile + '.apex']), 'utf8');
        const result = transpile(content, config);
        const benchmark = fs.readFileSync(joinPath(['resources', 'benchmark', targetFile + '.cls']), 'utf8');

        expect(result).toEqual(benchmark);
    });
});
