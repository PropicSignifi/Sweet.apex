const fs = require('fs');
const path = require('path');
const AST = require('../../ast');
const getValue = require('../../valueProvider');
const buildDoc = require('../../typings/builder');
const { log, } = require('../../utils');

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

                log(`Generated apex doc to ${fileName}`, config);
            });
        }
        else if(config.generateDoc === 'sync') {
            fs.writeFileSync(filePath, content);
            log(`Generated apex doc to ${fileName}`, config);
        }
    }
};

const ApexDoc = {
    accept: ({ current, parent, root, }) => {
        const accepted =
            (current.node === 'TypeDeclaration' ||
            current.node === 'EnumDeclaration') &&
            current === AST.getTopLevelType(root);
        return accepted;
    },

    run: ({ current, parent, root, config, }) => {
        const fileName = getValue(current.name);

        const docs = buildDoc(current, {
            includeComments: true,
        });

        writeToDoc(`${fileName}.json`, JSON.stringify(docs, null, 4), config);
    },
};

module.exports = ApexDoc;
