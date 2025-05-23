import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { processProjectFiles } from './scripts/processProjectFiles';

import path from 'path';
import fs from 'fs';

const $project = path.resolve('./project');

export default defineConfig({
	plugins: [
		{
		  name: 'build-script',
		  buildStart() {
		//   handleHotUpdate() {
			console.log(`buildStart`);
			ensureBasicProjectExamplesReady();
			processProjectFiles();
		  },
		},
		{
		  name: 'hot-update',
		  handleHotUpdate() {
			ensureBasicProjectExamplesReady();
		  },
		},
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	],
	define: { global: 'globalThis' },      // beacon-sdk expects `global`
	resolve: {
		alias: {
			// buffer: 'buffer',
			process: 'process/browser',
			stream:  'stream-browserify',
			util:    'util',
			$project,
		}
	},

	optimizeDeps: { include: ['buffer','process','stream-browserify','util'] },
	server: {
		fs: {
			allow: [
				$project,
			]
		}
	},
});


function ensureBasicProjectExamplesReady() {

	const projectFolderPath = path.resolve('./project');
	if (!fs.existsSync(projectFolderPath)) {
		fs.mkdirSync(projectFolderPath, { recursive: true });
	}

	const projectPath = path.resolve('./project/fxhash-project.json');
	if (!fs.existsSync(projectPath)) {
		fs.writeFileSync(projectPath, JSON.stringify({}));
	}
	const projectCssPath = path.resolve('./project/styles.css');
	if (!fs.existsSync(projectCssPath)) {
		fs.writeFileSync(projectCssPath, stylesCssExample);
	}

	const examplesPath = path.resolve('./examples');
	const configFinalPath = path.resolve('./project/config.ts');
	const configExamplePath = path.resolve('./examples/config.ts');
	if (!fs.existsSync(configFinalPath)) {
		fs.copyFileSync(configExamplePath, configFinalPath);
	}
}

const stylesCssExample = `@import "tailwindcss";

@theme {
    
}

#body {
    
}`;