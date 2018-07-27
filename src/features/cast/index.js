/**
 * MIT License
 *
 * Copyright (c) 2018 Click to Cloud Pty Ltd
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 **/
const _ = require('lodash');
const AST = require('../../ast');
const getValue = require('../../valueProvider');
const { log, writeToFile, } = require('../../utils');

const castRequests = {};

const isValid = type => type && type.node === 'ParameterizedType' && _.includes(['List', 'Set', 'Map'], getValue(type.type));

const getTypeNameInMethod = type => {
    let typeName = null;
    if(type.node === 'ParameterizedType') {
        typeName = `${getValue(type.type)}_${_.map(type.typeArguments, getTypeNameInMethod).join('_')}`;
    }
    else {
        typeName = getValue(type.name);
    }

    typeName = typeName.replace('__', '_');
    return typeName;
};

const getCastMethodName = (fromType, toType) => `cast_${getTypeNameInMethod(fromType)}_to_${getTypeNameInMethod(toType)}`;

const getMetaContent = config => `<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>${config.apiVersion}</apiVersion>
    <status>Active</status>
</ApexClass>
`;

const isListLike = type => isValid(type) && (getValue(type.type) === 'List' || getValue(type.type) === 'Set');

const isMapLike = type => isValid(type) && getValue(type.type) === 'Map';

const getCastListLikeMethod = castRequest => {
    const fromTypeName = getValue(castRequest.fromType);
    const toTypeName = getValue(castRequest.toType);

    const fromTypeArg = castRequest.fromType.typeArguments[0];
    const toTypeArg = castRequest.toType.typeArguments[0];

    const fromTypeArgName = getValue(fromTypeArg);
    const toTypeArgName = getValue(toTypeArg);

    const castLine = fromTypeArg.node === 'ParameterizedType' && toTypeArg.node === 'ParameterizedType' ?
        `${toTypeArgName} r = ${getCastMethodName(fromTypeArg, toTypeArg)}(i);` :
        `${toTypeArgName} r = (${toTypeArgName})i;`

    return `
    public static ${toTypeName} ${castRequest.name}(Object other) {
        ${fromTypeName} target = (${fromTypeName})other;
        ${toTypeName} ret = new ${toTypeName}();
        for(${fromTypeArgName} i : target) {
            ${castLine}
            ret.add(r);
        }

        return ret;
    }`;
};

const getCastMapLikeMethod = castRequest => {
    const fromTypeName = getValue(castRequest.fromType);
    const toTypeName = getValue(castRequest.toType);

    const fromTypeArg1 = castRequest.fromType.typeArguments[0];
    const toTypeArg1 = castRequest.toType.typeArguments[0];
    const fromTypeArg2 = castRequest.fromType.typeArguments[1];
    const toTypeArg2 = castRequest.toType.typeArguments[1];

    const fromTypeArgName1 = getValue(fromTypeArg1);
    const toTypeArgName1 = getValue(toTypeArg1);
    const fromTypeArgName2 = getValue(fromTypeArg2);
    const toTypeArgName2 = getValue(toTypeArg2);

    const castLine1 = fromTypeArg1.node === 'ParameterizedType' && toTypeArg1.node === 'ParameterizedType' ?
        `${toTypeArgName1} k = ${getCastMethodName(fromTypeArg1, toTypeArg1)}(key);` :
        `${toTypeArgName1} k = (${toTypeArgName1})key;`
    const castLine2 = fromTypeArg2.node === 'ParameterizedType' && toTypeArg2.node === 'ParameterizedType' ?
        `${toTypeArgName2} v = ${getCastMethodName(fromTypeArg2, toTypeArg2)}(value);` :
        `${toTypeArgName2} v = (${toTypeArgName2})value;`

    return `
    public static ${toTypeName} ${castRequest.name}(Object other) {
        ${fromTypeName} target = (${fromTypeName})other;
        ${toTypeName} ret = new ${toTypeName}();
        for(${fromTypeArgName1} key : target.keySet()) {
            ${fromTypeArgName2} value = target.get(key);
            ${castLine1}
            ${castLine2}
            ret.put(k, v);
        }

        return ret;
    }`;
};

const getCastMethod = castRequest => {
    if(isListLike(castRequest.fromType) && isListLike(castRequest.toType)) {
        return getCastListLikeMethod(castRequest);
    }
    else if(isMapLike(castRequest.fromType) && isMapLike(castRequest.toType)) {
        return getCastMapLikeMethod(castRequest);
    }
    else {
        throw new Error(`Invalid arrow cast from ${getValue(castRequest.fromType)} to ${getValue(castRequest.toType)}`);
    }
};

const getCastClass = (name) => `public class ${name} {
    ${_.map(Object.values(castRequests), castRequest => getCastMethod(castRequest)).join('\n')}
}`

const rollOut = castRequest => {
    if(isListLike(castRequest.fromType) && isListLike(castRequest.toType)) {
        const fromTypeArg = castRequest.fromType.typeArguments[0];
        const toTypeArg = castRequest.toType.typeArguments[0];
        const castMethodName = getCastMethodName(fromTypeArg, toTypeArg);

        const newCastRequest = {
            name: castMethodName,
            fromType: fromTypeArg,
            toType: toTypeArg,
        };

        rollOut(newCastRequest);
    }
    else if(isMapLike(castRequest.fromType) && isMapLike(castRequest.toType)) {
        const fromTypeArg1 = castRequest.fromType.typeArguments[0];
        const toTypeArg1 = castRequest.toType.typeArguments[0];
        const castMethodName1 = getCastMethodName(fromTypeArg1, toTypeArg1);

        const newCastRequest1 = {
            name: castMethodName1,
            fromType: fromTypeArg1,
            toType: toTypeArg1,
        };

        rollOut(newCastRequest1);

        const fromTypeArg2 = castRequest.fromType.typeArguments[1];
        const toTypeArg2 = castRequest.toType.typeArguments[1];
        const castMethodName2 = getCastMethodName(fromTypeArg2, toTypeArg2);

        const newCastRequest2 = {
            name: castMethodName2,
            fromType: fromTypeArg2,
            toType: toTypeArg2,
        };

        rollOut(newCastRequest2);
    }
    else {
        return;
    }

    if(!castRequests[castRequest.name]) {
        castRequests[castRequest.name] = castRequest;
    }
};

const Cast = {
    accept: ({ current, parent, }) => {
        const accepted =
            current.node === 'ArrowCastExpression';
        return accepted;
    },

    run: ({ current, parent, root, }) => {
        const {
            fromType,
            toType,
        } = current;

        if(!isValid(fromType) || !isValid(toType)) {
            throw new Error('Arrow cast can only be used between List, Set and Map');
        }

        const castMethodName = getCastMethodName(fromType, toType);
        castRequests[castMethodName] = {
            name: castMethodName,
            fromType,
            toType,
        };

        const newExpression = {
            name: {
                identifier: castMethodName,
                node: "SimpleName",
            },
            expression: {
                identifier: "cast_Utils",
                node: "SimpleName",
            },
            node: "MethodInvocation",
            "arguments": [
                current.expression,
            ],
            typeArguments: [],
        };

        AST.transform(current, newExpression);
    },

    finalize: config => {
        _.each(castRequests, castRequest => rollOut(castRequest));

        const name = 'cast_Utils';
        const newCode = getCastClass(name);

        return Promise.all([
            writeToFile(`${name}.cls`, newCode, config)
                .then(() => log(`Compiled ${config.destDir + name}.cls`, config)),
            writeToFile(`${name}.cls-meta.xml`, getMetaContent(config), config)
                .then(() => log(`Compiled ${config.destDir + name}.cls-meta.xml`, config)),
        ]);
    },
};

module.exports = Cast;
