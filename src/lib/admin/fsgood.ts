//fs-good


import fs from 'fs/promises';
import fsSync from 'fs';

import path from 'path';

export async function rmrf(_path) {
    console.log('rmrf', _path);
    //recursive function to remove a directory and all its contents
    // so as to prevent: Error: ENOTEMPTY: directory not empty, rmdir
    if (fsSync.existsSync(_path)) {
        const contents = fsSync.readdirSync(_path);
        for (const content of contents) {
            const contentPath = path.join(_path, content);
            if (fsSync.lstatSync(contentPath).isDirectory()) {
                await rmrf(contentPath);
            } else {
                console.log('rm', contentPath);
                await fs.unlink(contentPath);
            }
        }
        console.log('rmdir', _path);
        await fs.rmdir(_path);
    }
}