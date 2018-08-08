const Typings = require('../src/typings');

const config = {
    libraryDir: __dirname + '/../library',
};

describe("Sweet.apex", function() {
    it("should load library typings", function() {
        const typings = Typings.getLibraryTypings(config);
        expect(typings.System.String).not.toBeUndefined();
    });

    it("should look up typings", function() {
        const typing1 = Typings.lookup('String', 'CustomTyping', config);
        expect(typing1).not.toBeUndefined();

        const typing2 = Typings.lookup('System.String', null, config);
        expect(typing2).not.toBeUndefined();

        const typing3 = Typings.lookup('String', null, config);
        expect(typing3).not.toBeUndefined();
    });

    it('should get variable type', function() {
        const typing = Typings.lookup('Math', null, config);
        expect(Typings.getVariableType(typing, 'PI')).toEqual('Double');
    });

    it('should get method return type', function() {
        const typing = Typings.lookup('Math', null, config);
        expect(Typings.getMethodType(typing, 'abs', ['Integer'])).toEqual('Integer');
        expect(Typings.getMethodType(typing, 'abs', ['Double'])).toEqual('Double');
    });
});
