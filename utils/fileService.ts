import fs from 'fs';
import path from 'path';
const unzipper = require('unzipper')

export const extractZip = async (filePath: string, destination: string) => {
    await fs.createReadStream(filePath)
        .pipe(unzipper.Extract({ path: destination }))
        .promise();
};

export const readYamlFile = (yamlPath: string) => {
    const yamlContent = fs.readFileSync(yamlPath, 'utf-8');
    return yamlContent;
};
