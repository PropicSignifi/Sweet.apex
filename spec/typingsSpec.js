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

    it('should check types', function() {
        const expr1 = AST.parseExpression('1 + 2 * 3');
        const type1 = Typings.checkType(expr1, config);
        expect(type1).toEqual('Integer');

        const expr2 = AST.parseExpression('1.0 + 2 * 3');
        const type2 = Typings.checkType(expr2, config);
        expect(type2).toEqual('Double');

        const expr3 = AST.parseExpression('2 > 3');
        const type3 = Typings.checkType(expr3, config);
        expect(type3).toEqual('Boolean');

        const expr4 = AST.parseExpression("'a' instanceof String");
        const type4 = Typings.checkType(expr4, config);
        expect(type4).toEqual('Boolean');

        const expr5 = AST.parseExpression("1 < 2 ? 'a' : 'b'");
        const type5 = Typings.checkType(expr5, config);
        expect(type5).toEqual('String');

        const expr6 = AST.parseExpression("(String s) -> { return s; }");
        const type6 = Typings.checkType(expr6, config);
        expect(type6).toEqual('Func');

        const expr7 = AST.parseExpression("Math.PI");
        const type7 = Typings.checkType(expr7, config);
        expect(type7).toEqual('Double');

        const expr8 = AST.parseExpression("Math.abs(-4)");
        const type8 = Typings.checkType(expr8, config);
        expect(type8).toEqual('Integer');

        config.variableContext = {
            a: 'String',
        };
        const expr9 = AST.parseExpression("a");
        const type9 = Typings.checkType(expr9, config);
        expect(type9).toEqual('String');
    });
});
