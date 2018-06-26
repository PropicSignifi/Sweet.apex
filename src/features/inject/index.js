const _ = require('lodash');
const AST = require('../../ast');
const getValue = require('../../valueProvider');

const Inject = {
    accept: ({ current, parent, }) => {
        const accepted =
            (current.node === 'VariableDeclarationStatement' || current.node === 'FieldDeclaration') &&
            AST.hasAnnotation(current.modifiers, 'inject');
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        const variableDeclarationStatement = current;
        const annotation = AST.findAnnotation(variableDeclarationStatement.modifiers, 'inject');
        const annotationValue = AST.getAnnotationValue(annotation);
        let beanName = null;
        let beanType = getValue(variableDeclarationStatement.type);
        if(annotationValue) {
            beanName = _.isPlainObject(annotationValue) ? annotationValue.name : annotationValue;
            beanName = _.trim(beanName, "'\" ");
        }

        const key = beanName ? `'${beanName}'` : `${beanType}.class`;
        const newNode = AST.parseExpression(`(${beanType})Sweet.getBean(${key})`);

        AST.removeChild(variableDeclarationStatement, 'modifiers', annotation);

        _.each(variableDeclarationStatement.fragments, fragment => {
            AST.setChild(fragment, 'initializer', _.cloneDeep(newNode));
        });
    },
};

module.exports = Inject;
