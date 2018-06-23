const fs = require('fs');
const path = require('path');
const parse = require('../src/parser');

const targetFile = 'Error';

function joinPath(items) {
    return items.join(path.sep);
}

describe("Sweet.apex compiler", function() {
    it("should catch errors", function() {
        const content = fs.readFileSync(joinPath(['resources', 'failure', targetFile + '.apex']), 'utf8');
        try {
            parse(content);
            fail('Should fail here');
        }
        catch(e) {
        }
    });
});
