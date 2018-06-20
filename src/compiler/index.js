const fs = require('fs');
const path = require('path');
const _ = require('lodash');

let compilers = null;

const loadCompilers = () => {
    const compilers = {};

    _.each(fs.readdirSync(__dirname), fileName => {
        if(fileName === 'index.js') {
            return;
        }

        const name = fileName.endsWith('.js') ? fileName.substring(0, fileName.length - 3) : fileName;
        const compiler = require('.' + path.sep + fileName);
        compilers[name] = compiler;
    });

    return compilers;
};

const compile = (node, context) => {
    if(!node) {
        throw new Error('Node does not exist');
    }

    if(!compilers) {
        compilers = loadCompilers();
    }

    if(!context) {
        context = {
            lines: [],
            indent: '',
            toString: true,
        };
    }

    const c = compilers[node.node];
    if(c) {
        c(node, context);
    }
    else {
        throw new Error(`Failed to find compiler for ${node.node}`);
    }

    if(toString && node.node === 'CompilationUnit') {
        const apexClass = _.chain(context.lines)
            .flatMap(line => _.split(line, '\n'))
            .map(line =>  _.trim(line) === '' ? '' : line)
            .join('\n')
            .value();
        return apexClass;
    }
    else {
        return context.lines;
    }
};

module.exports = compile;
