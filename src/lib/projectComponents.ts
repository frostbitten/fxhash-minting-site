// src/lib/projectComponents.ts
const modules = import.meta.glob('../../project/*.svelte', { eager: true });

const components: Record<string, unknown> = {};
for (const path in modules) {
	const name = path.split('/').pop()?.replace('.svelte', '');
	if (name) components[name] = modules[path].default;
}

export default components;
