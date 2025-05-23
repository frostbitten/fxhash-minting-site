import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: [
		vitePreprocess(),
		mdsvex(),
	],
	kit: { 
		adapter: adapter({
			strict: false, //- pass `strict: false` to `adapter-static` to ignore this error. Only do this if you are sure you don't need the routes in question in your final app, as they will be unavailable. See https://github.com/sveltejs/kit/tree/main/packages/adapter-static#strict for more info.
		}),
		prerender: {
		  handleMissingId: 'ignore', // Other options: 'fail', 'warn'
		},
	 },
	extensions: ['.svelte', '.svx']
	
};

export default config;
