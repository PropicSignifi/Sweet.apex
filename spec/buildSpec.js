const fs = require('fs');
const path = require('path');
const build = require('../src/builder');

const targetFile = 'beans';
const config = {
    silent: true,
    fileSrcDir: "files/",
    fileDestDir: "build/staticresources/",
};

function joinPath(items) {
    return items.join(path.sep);
}

describe("Sweet compile", function() {
    it("should build files", function() {
        build(config).then(() => {
            const content = fs.readFileSync(joinPath([config.fileSrcDir, targetFile + '.json']), 'utf8');
            const benchmark = fs.readFileSync(joinPath([config.fileDestDir, targetFile + '.resource']), 'utf8');

            expect(content).toEqual(benchmark);
        });
    });
});
