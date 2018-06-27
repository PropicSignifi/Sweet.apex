const Typings = require('../src/typings');

const config = {
    libraryDir: __dirname + '/../library',
};

describe("Sweet.apex", function() {
    it("should load library typings", function() {
        const typings = Typings.getAllTypings(config);
        expect(typings.System.String).not.toBeNull();
    });
});
