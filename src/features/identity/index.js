const _ = require('lodash');
const AST = require('../../ast');
const getValue = require('../../valueProvider');

const Identity = {
    accept: ({ current, parent, root, }) => {
        const accepted =
            current.node === 'TypeDeclaration' &&
            AST.hasAnnotation(current.modifiers, 'identity');
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        const typeDeclaration = current;
        const annotation = AST.findAnnotation(typeDeclaration.modifiers, 'identity');
        let fields = [];
        const annotationValue = AST.getAnnotationValue(annotation);
        if(annotationValue) {
            const fieldsString = _.isPlainObject(annotationValue) ? annotationValue.fields : annotationValue;
            fields = _.chain(fieldsString)
                .trim('{} ')
                .split(',')
                .map(s => _.trim(s, "'' "))
                .value();
        }
        else {
            fields = _.chain(typeDeclaration.bodyDeclarations)
                .filter(n => n.node === 'FieldDeclaration' && !AST.hasModifier(n.modifiers, 'static'))
                .flatMap(n => _.map(n.fragments, f => getValue(f.name)))
                .value();
        }
        AST.removeChild(typeDeclaration, 'modifiers', annotation);

        const typeName = getValue(typeDeclaration.name);
        const fieldEqualCode = _.map(fields, f => `this.${f} == target.${f}`).join(' && ');
        const fieldHashCodeCode = _.map(fields, f => `data.put('${f}', this.${f});`).join('\n');

        const newCodes = [
            '\n',
            `public Boolean equals(Object other) {
                if(other instanceof ${typeName}) {
                    ${typeName} target = (${typeName})other;
                    return ${fieldEqualCode};
                }

                return false;
            }`,
            '\n',
            `public Integer hashCode() {
                Map<String, Object> data = new Map<String, Object>();
                ${fieldHashCodeCode}
                return Sweet.generateHashCode(data);
            }`,
        ];

        const newStatements = _.map(newCodes, AST.parseClassBodyDeclaration);
        AST.appendChildren(typeDeclaration, 'bodyDeclarations', newStatements);
    },
};

module.exports = Identity;
