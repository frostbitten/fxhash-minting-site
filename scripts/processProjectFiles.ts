//processProjectFiles.ts

import fs from 'fs';
import fsSync from 'fs';
import path from 'path';

export function processProjectFiles() {

    console.log('processProjectFiles');

    const projectPath = path.join(process.cwd(), 'project');
    const staticPath = path.join(process.cwd(), 'static');
    const previewsPath = path.join(projectPath, 'previews');
    const mediaPath = path.join(projectPath, 'media');
    const previewsStaticPath = path.join(staticPath, 'previews');

    //create previews and media folders if they don't exist
    if (!fsSync.existsSync(previewsStaticPath)) {
        fsSync.mkdirSync(previewsStaticPath, { recursive: true });
    }
    if (!fsSync.existsSync(previewsPath)) {
        fsSync.mkdirSync(previewsPath, { recursive: true });
    }
    if (!fsSync.existsSync(mediaPath)) {
        fsSync.mkdirSync(mediaPath, { recursive: true });
    }

    //get all the previews
    const previewsDir = fsSync.readdirSync(previewsPath);
    const previews = [];
    for (const preview of previewsDir) {
        previews.push(preview);
        //copy the preview to the static folder
        const previewPath = path.join(previewsPath, preview);
        const previewStaticPath = path.join(previewsStaticPath, preview);
        if(!fsSync.existsSync(previewStaticPath)) {
            fsSync.copyFileSync(previewPath, previewStaticPath);
        }
    }

    //export previews list to json
    const previewsJson = JSON.stringify(previews, null, '\t');
    fs.writeFileSync(path.join(projectPath, 'previews.json'), previewsJson);


    //copy media folder to static
    const mediaFiles = readPathRecursive(mediaPath).map((file) => {
        let fileRelative = file.replace(projectPath, '');
        if(fileRelative.startsWith(path.sep)) {
            fileRelative = fileRelative.slice(1);
        }
        const folderPath = path.dirname(fileRelative);
        fsSync.mkdirSync(path.join(staticPath, folderPath), { recursive: true });
        fsSync.copyFileSync(file, path.join(staticPath, fileRelative));
    });

    //create a list of all the files in static
    const allFiles = readPathRecursive(staticPath).map((file) => {
        let filePath = file.replace(staticPath, '');
        if(filePath.startsWith(path.sep)) {
            filePath = filePath.slice(1);
        }
        return filePath.replaceAll(path.sep, '/');
    });
    const allFilesJson = JSON.stringify(allFiles, null, '\t');
    fs.writeFileSync(path.join(projectPath, 'allFiles.json'), allFilesJson);

}

function readPathRecursive(_path) {
    const files = fsSync.readdirSync(_path);
    const allFiles = [];
    for (const file of files) {
        const filePath = path.join(_path, file);
        if (fsSync.lstatSync(filePath).isDirectory()) {
            allFiles.push(...readPathRecursive(filePath));
        } else {
            allFiles.push(filePath);
        }
    }
    return allFiles;
}