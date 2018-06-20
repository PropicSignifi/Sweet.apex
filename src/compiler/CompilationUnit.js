const compile = require('./index.js');

const CompilationUnit = (node, context) => {
    const type = node.types[0]; // support only one type in one file
    compile(type, context);
};

module.exports = CompilationUnit;
