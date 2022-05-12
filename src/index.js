import fs, { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path, { basename, dirname } from 'path';
import { createFilter } from 'rollup-pluginutils';

const defaultExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];

export default function image(options = {}) {
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
			const base = path.basename(id);
			fs.writeFileSync(`${dir}/${base}`, fs.readFileSync(id));
			const parts = id.split('.');
			const extension = parts.pop();
			const idx2 = `${parts.join('.')}@2x.${extension}`;
			const idx3 = `${parts.join('.')}@3x.${extension}`;
			const baseName = base.split('.').slice(0, -1).join('.');
			if (fs.existsSync(idx2)) {
				fs.writeFileSync(`${dir}/${baseName}@2x.${extension}`, fs.readFileSync(idx2));
			}
			if (fs.existsSync(idx3)) {
				fs.writeFileSync(`${dir}/${baseName}@3x.${extension}`, fs.readFileSync(idx3));
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
