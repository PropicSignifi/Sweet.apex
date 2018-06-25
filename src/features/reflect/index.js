const _ = require('lodash');
const AST = require('../../ast');
const getValue = require('../../valueProvider');

const getInvokeMethodParams = method => {
    return _.map(method.parameters, (param, index) => `(${param.type})args.get(${index})`).join(', ');
};

const getInvokeMethod = method => {
    if(method.returnType === 'void') {
        return `this.${method.name}(${getInvokeMethodParams(method)});`;
    }
    else {
        return `return this.${method.name}(${getInvokeMethodParams(method)});`;
    }
};

const ReflectFeature = {
    accept: ({ current, parent, }) => {
        const accepted =
            current.node === 'TypeDeclaration' &&
            AST.hasAnnotation(current.modifiers, 'reflect');
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        const typeDeclaration = current;
        const annotation = _.find(typeDeclaration.modifiers, modifier => modifier.node === 'Annotation' && getValue(modifier.typeName) === 'reflect');
        AST.removeChild(typeDeclaration, 'modifiers', annotation);

        typeDeclaration.superInterfaceTypes = typeDeclaration.superInterfaceTypes || [];
        typeDeclaration.superInterfaceTypes.push({
            node: 'SimpleType',
            name: {
                identifier: 'Sweet.Reflectable',
                node: 'SimpleName',
            },
        });

        const fields = [];
        const methods = [];

        _.each(typeDeclaration.bodyDeclarations, bodyDeclaration => {
            if(bodyDeclaration.node === 'FieldDeclaration' && !AST.hasModifier(bodyDeclaration.modifiers, 'static')) {
                const type = getValue(bodyDeclaration.type);
                _.each(bodyDeclaration.fragments, fragment => {
                    const name = getValue(fragment.name);
                    fields.push({
                        name,
                        type,
                    });
                });
            }
            else if(bodyDeclaration.node === 'MethodDeclaration' && !AST.hasModifier(bodyDeclaration.modifiers, 'static') && !bodyDeclaration.constructor) {
                const name = getValue(bodyDeclaration.name);
                const parameters = _.map(bodyDeclaration.parameters, param => {
                    return {
                        name: getValue(param.name),
                        type: getValue(param.type),
                    };
                });
                const returnType = getValue(bodyDeclaration.returnType2);
                methods.push({
                    name,
                    parameters,
                    returnType,
                });
            }
        });

        const newNodes = [];

        newNodes.push(AST.parseEmptyLine());
        newNodes.push(AST.parseClassBodyDeclaration(`public List<String> reflect_getFieldNames() {
            return new List<String>{ ${_.map(fields, field => "'" + field.name + "'").join(', ')} };
        }`));

        const getFieldValueCodes = [];
        _.each(fields, (field, index) => {
            getFieldValueCodes.push(`${index === 0 ? '' : 'else '}if(name == '${field.name}') {
                return this.${field.name};
            }`);
        });
        getFieldValueCodes.push(`else {
            throw new Sweet.SweetException('Field ' + name + ' does not exist');
        }`);
        newNodes.push(AST.parseEmptyLine());
        newNodes.push(AST.parseClassBodyDeclaration(`public Object reflect_getFieldValue(String name) {
            ${getFieldValueCodes.join('\n')}
        }`));

        const setFieldValueCodes = [];
        _.each(fields, (field, index) => {
            setFieldValueCodes.push(`${index === 0 ? '' : 'else '}if(name == '${field.name}') {
                this.${field.name} = (${field.type})value;
            }`);
        });
        setFieldValueCodes.push(`else {
            throw new Sweet.SweetException('Field ' + name + ' does not exist');
        }`);
        newNodes.push(AST.parseEmptyLine());
        newNodes.push(AST.parseClassBodyDeclaration(`public void reflect_setFieldValue(String name, Object value) {
            ${setFieldValueCodes.join('\n')}
        }`));

        newNodes.push(AST.parseEmptyLine());
        newNodes.push(AST.parseClassBodyDeclaration(`public List<String> reflect_getMethodNames() {
            return new List<String>{ ${_.map(methods, method => "'" + method.name + "'").join(', ')} };
        }`));

        const invokeMethodCodes = [];
        _.each(methods, (method, index) => {
            invokeMethodCodes.push(`${index === 0 ? '' : 'else '}if(name == '${method.name}') {
                ${getInvokeMethod(method)}
            }`);
        });
        invokeMethodCodes.push(`else {
            throw new Sweet.SweetException('Method ' + name + ' does not exist');
        }`);
        invokeMethodCodes.push(`return null;`);
        newNodes.push(AST.parseEmptyLine());
        newNodes.push(AST.parseClassBodyDeclaration(`public Object reflect_invokeMethod(String name, List<Object> args) {
            ${invokeMethodCodes.join('\n')}
        }`));

        AST.appendChildren(typeDeclaration, 'bodyDeclarations', newNodes);
    },
};

module.exports = ReflectFeature;
