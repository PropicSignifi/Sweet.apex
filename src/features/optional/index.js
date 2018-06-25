const _ = require('lodash');
const AST = require('../../ast');
const getValue = require('../../valueProvider');

const Optional = {
    accept: ({ current, parent, root, }) => {
        const methodDeclaration = AST.getParent(root, parent);

        const passed = parent.node === 'SingleVariableDeclaration' &&
            current.node === 'Annotation' &&
            getValue(current.typeName) === 'optional' &&
            methodDeclaration !== null &&
            methodDeclaration.node === 'MethodDeclaration' &&
            (!!methodDeclaration.body);

        return passed;
    },

    groupBy: ({ parent, root, }) => {
        const methodDeclaration = AST.getParent(root, parent);
        return AST.getMethodSignature(methodDeclaration);
    },

    runGroup: group => {
        const newStatements = [];
        const { parent, root, } = group[0];
        const methodDeclaration = AST.getParent(root, parent);
        const typeDeclaration = AST.getParent(root, methodDeclaration);
        const totalOptional = _.size(group);
        const hasReturn = 'void' !== getValue(methodDeclaration.returnType2);

        const index = _.findIndex(methodDeclaration.parameters, param => AST.hasAnnotation(param.modifiers, 'optional'));
        const restParameters = _.slice(methodDeclaration.parameters, index);
        if(!_.every(restParameters, param => AST.hasAnnotation(param.modifiers, 'optional'))) {
            throw new Error('@optional should be used at rear parameters');
        }

        _.each(group, ({ current, parent, root, }) => {
            AST.removeChild(parent, 'modifiers', current);
        });

        let delegator = methodDeclaration;

        for(let index = 0; index < totalOptional; index++) {
            delegator = _.cloneDeep(delegator);
            const initialParams = _.initial(delegator.parameters);
            delegator.parameters = initialParams;
            const params = _.map(initialParams, param => {
                return {
                    name: getValue(param.name),
                    type: getValue(param.type),
                };
            });
            params.push({
                name: 'null',
                type: null,
            });
            const line = `${hasReturn ? 'return ': ''}${getValue(delegator.name)}(${_.map(params, param => param.name).join(', ')});`;
            delegator.body.statements = [ AST.parseBlockStatement(line), ];

            newStatements.push(AST.parseEmptyLine());
            newStatements.push(delegator);
        }

        AST.appendChildren(typeDeclaration, 'bodyDeclarations', newStatements);
    },
};

module.exports = Optional;
