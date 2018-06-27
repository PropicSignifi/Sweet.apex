const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const getValue = require('../valueProvider');
const compile = require('../compiler');

const addIndent = (content, indent) => {
    const lines = _.split(content, '\n');
    return _.map(lines, line => indent + line).join('\n');
};

const addComments = (lines, indent, comments) => {
    if(!_.isEmpty(comments)) {
        _.each(comments, comment => {
            lines.push(addIndent(comment.value, indent));
        });
    }
};

const addBodyDeclarations = (lines, indent, bodyDeclarations) => {
    _.each(bodyDeclarations, bodyDeclaration => {
        compile(bodyDeclaration, {
            lines,
            indent: indent + '    ',
        });
    });
};

const addAnnotations = (lines, indent, annotations) => {
    _.each(_.filter(annotations, ann => ann.node === 'Annotation'), ann => {
        compile(ann, {
            lines,
            indent,
        });
    });
};

const getAnnotations = modifiers => {
    const ret = _.map(_.filter(modifiers, modifier => modifier.node === 'Annotation'), getValue).join(' ');
    return _.isEmpty(ret) ? '' : ret + ' ';
};

const getModifiers = modifiers => {
    const ret = _.map(_.filter(modifiers, modifier => modifier.node === 'Modifier'), getValue).join(' ');
    return _.isEmpty(ret) ? '' : ret + ' ';
};

const getTypeParameters = typeParameters =>
    _.isEmpty(typeParameters) ?
        '' :
        '<' + _.map(typeParameters, getValue).join(', ') + '>';

const getExtendsSuperClass = superclassType =>
    superclassType ? ' extends ' + getValue(superclassType) : '';

const getImplementsInterfaces = superInterfaceTypes =>
    _.isEmpty(superInterfaceTypes) ? '' : ' implements ' + _.map(superInterfaceTypes, getValue).join(', ');

const perfCounters = {};

const time = (message, config) => {
    if(config.isPerfEnabled) {
        perfCounters[message] = {
            message,
            start: Date.now(),
        };
    }
};

const timeEnd = (message, config) => {
    if(config.isPerfEnabled) {
        const counter = perfCounters[message];
        counter.end = Date.now();
        counter.duration = counter.end - counter.start;

        log(`${message}: ${counter.duration}`, config);
    }
};

const isDirectory = dir => {
    try {
        return fs.lstatSync(dir).isDirectory();
    }
    catch(e) {
        return false;
    }
};

const normalize = file => {
    if(isDirectory(file)) {
        file = file.endsWith(path.sep) ? file : file + path.sep;
    }

    return file;
};

const log = (message, config) => {
    if(!config) {
        throw new Error('Config is not passed in');
    }

    if(!config.silent) {
        console.log(message);
    }
};

const writeToFile = (fileName, content, config) => {
    time(`Write File ${fileName}`, config);

    return new Promise((resolve, reject) => {
        fs.writeFile(config.destDir + fileName, content, (error, data) => {
            timeEnd(`Write File ${fileName}`, config);
            if(error) {
                reject(error);
            }

            resolve(null);
        });
    });
};

const getName = fileName => {
    const startIndex = _.lastIndexOf(fileName, path.sep);
    const endIndex = _.lastIndexOf(fileName, '.');
    const name = fileName.substring(startIndex + 1, endIndex);
    return name;
};

module.exports = {
    addIndent,
    addComments,
    addBodyDeclarations,
    addAnnotations,
    getModifiers,
    getAnnotations,
    getTypeParameters,
    getExtendsSuperClass,
    getImplementsInterfaces,
    time,
    timeEnd,
    normalize,
    log,
    writeToFile,
    getName,
};
