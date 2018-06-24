const _ = require('lodash');
const AST = require('../../ast');
const getValue = require('../../valueProvider');

const Enum = {
    accept: ({ current, parent, }) => {
        const accepted =
            current.node === 'EnumDeclaration';
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        const enumDeclaration = current;
        const enumConstants = enumDeclaration.enumConstants;

        const typeName = getValue(enumDeclaration.name);

        const helperMethods = [
            `public static List<${typeName}> values() {
                return instances.values();
            }`,
            `public static ${typeName} valueOf(String name) {
                return instances.get(name);
            }`,
        ];

        const helperStatements = _.flatMap(helperMethods, helperMethod => [AST.parseClassBodyDeclaration(helperMethod), AST.parseEmptyLine()]);

        const enumStatements = [];
        _.each(enumConstants, (enumConstant, index) => {
            enumStatements.push(AST.parseClassBodyDeclaration(`public static final ${typeName} ${getValue(enumConstant.name)} = (${typeName})new ${typeName}(${_.map(enumConstant.arguments, getValue).join(', ')}).setName('${getValue(enumConstant.name)}').setOrdinal(${index});`));
        });

        let line = `private static final Map<String, ${typeName}> instances = new Map<String, ${typeName}>{`;
        _.each(enumConstants, (enumConstant, index) => {
            line += `'${getValue(enumConstant.name)}' => ${getValue(enumConstant.name)}${index === _.size(enumConstants) - 1 ? '' : ', '}`;
        });
        line += '};';

        const instancesStatement = AST.parseClassBodyDeclaration(line);

        const classDeclaration = {
            node: 'TypeDeclaration',
            name: enumDeclaration.name,
            superInterfaceTypes: enumDeclaration.superInterfaceTypes,
            superclassType: {
                node: 'SimpleType',
                name: {
                    node: 'QualifiedName',
                    qualifier: {
                        identifier: 'Sweet',
                        node: 'SimpleName',
                    },
                    name: {
                        identifier: 'BaseEnum',
                        node: 'SimpleName',
                    },
                },
            },
            bodyDeclarations: [
                ...enumStatements,
                AST.parseEmptyLine(),
                instancesStatement,
                AST.parseEmptyLine(),
                ...helperStatements,
                ...enumDeclaration.bodyDeclarations,
            ],
            typeParameters: [],
            interface: false,
            modifiers: enumDeclaration.modifiers,
            comments: enumDeclaration.comments,
        };

        AST.removeChild(classDeclaration, 'enumConstants', enumConstants);
        AST.transform(enumDeclaration, classDeclaration);
    },
};

module.exports = Enum;
