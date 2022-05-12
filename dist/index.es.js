import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, dirname } from 'path';
import { createFilter } from 'rollup-pluginutils';

const defaultExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];

function image(options = {}) {
	const extensions = options.extensions || defaultExtensions;
	const includes = extensions.map(e => `**/*${e}`);
	const filter = createFilter(options.include || includes, options.exclude);
	let images = [];

	function generateBundle(outputOptions, rendered) {
		const dir =
			outputOptions.dir || dirname(outputOptions.dest || outputOptions.file);
		if (!existsSync(dir)) {
			mkdirSync(dir);
		}
		images.forEach(id => {
			const base = basename(id);
			writeFileSync(`${dir}/${base}`, readFileSync(id));
			const parts = id.split('.');
			const extension = parts.pop();
			const idx2 = `${parts.join('.')}@2.${extension}`;
			const idx3 = `${parts.join('.')}@3.${extension}`;
			if (existsSync(idx2)) {
				writeFileSync(`${dir}/${base}@2`, readFileSync(idx2));
			}
			if (existsSync(idx3)) {
				writeFileSync(`${dir}/${base}@3`, readFileSync(idx3));
			}
		});
	}

	return {
		name: 'image-file',
		load(id) {
			if ('string' !== typeof id || !filter(id)) {
				return null;
			}

			if (images.indexOf(id) < 0) {
				images.push(id);
			}
			return `const img = require('./${basename(id)}'); export default img;`;
		},
		generateBundle,
		ongenerate: generateBundle
	};
}

export default image;
