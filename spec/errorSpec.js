const fs = require('fs');
const path = require('path');
const parse = require('../src/parser');

const targetFile = 'Error';

function joinPath(items) {
    return items.join(path.sep);
}

describe("Sweet.apex compiler", function() {
    it("should support plain old apex", function() {
        const content = fs.readFileSync(joinPath(['resources', 'failure', targetFile + '.apex']), 'utf8');
        try {
            parse(content);
            fail('Should fail here');
        }
        catch(e) {
            expect(e.message).toContain('line 1 (column 1): public class');
        }
    });
});
