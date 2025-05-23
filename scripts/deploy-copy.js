import fs from 'fs';
import path from 'path';

const buildDir = 'build';
const deployDir = 'deploy';

function deleteContentsExceptGit(dir) {
	const items = fs.readdirSync(dir);
	for (const item of items) {
		if (item === '.git') continue;
		const fullPath = path.join(dir, item);
		fs.rmSync(fullPath, { recursive: true, force: true });
	}
}

function copyDir(src, dest) {
	const items = fs.readdirSync(src);
	for (const item of items) {
		const srcPath = path.join(src, item);
		const destPath = path.join(dest, item);
		if (fs.lstatSync(srcPath).isDirectory()) {
			fs.mkdirSync(destPath, { recursive: true });
			copyDir(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

deleteContentsExceptGit(deployDir);
copyDir(buildDir, deployDir);
console.log('✅ Deploy directory updated.');
