const Typings = require('../src/typings');
const AST = require('../src/ast');

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

    it('should parse type', function() {
        const content = 'Map<String, Object>';
        const type = AST.parseType(content);
        expect(type).not.toBeUndefined();
    });

    it('should get method return type', function() {
        const typing = Typings.lookup('Math', null, config);
        expect(Typings.getMethodType(typing, 'abs', ['Integer'])).toEqual('Integer');
        expect(Typings.getMethodType(typing, 'abs', ['Double'])).toEqual('Double');
    });

    it('should look up generic types', function() {
        const typing = Typings.lookup('Map<String, String>', null, config);
        expect(typing.genericTypes.length).toEqual(2);
    });

    it('should get generic method return type', function() {
        const typing1 = Typings.lookup('Map<String, String>', null, config);
        expect(Typings.getMethodType(typing1, 'get', ['String'])).toEqual('String');

        const typing2 = Typings.lookup('List<String>', null, config);
        expect(Typings.getMethodType(typing2, 'get', ['Integer'])).toEqual('String');
    });
});
