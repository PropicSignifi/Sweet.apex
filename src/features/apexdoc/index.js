const fs = require('fs');
const path = require('path');
const AST = require('../../ast');
const getValue = require('../../valueProvider');

const writeToDoc = (fileName, content, config) => {
    if(config.docDir) {
        if(!fs.existsSync(config.docDir)) {
            fs.mkdirSync(config.docDir);
        }

        const filePath = config.cwd + path.sep + config.docDir + path.sep + fileName;

        if(config.generateDoc === 'async') {
            fs.writeFile(filePath, content, (error, data) =>{
                if(error) {
                    console.error(error);
                    return;
                }

                console.log(`Generated apex doc to ${fileName}`);
            });
        }
        else if(config.generateDoc === 'sync') {
            fs.writeFileSync(filePath, content);
            console.log(`Generated apex doc to ${fileName}`);
        }
    }
};

const ApexDoc = {
    accept: ({ current, parent, root, }) => {
        const accepted =
            current.node === 'TypeDeclaration' ||
            current.node === 'EnumDeclaration';
        return accepted;
    },

    run: ({ current, parent, root, config, }) => {
        const topType = AST.getTopLevelType(root);
        const fileName = topType === current ? getValue(topType.name) : `${getValue(topType.name)}_${getValue(current.name)}`;

        const docs = {};
        // TODO

        writeToDoc(`${fileName}.json`, JSON.stringify(docs, null, 4), config);
    },
};

module.exports = ApexDoc;
