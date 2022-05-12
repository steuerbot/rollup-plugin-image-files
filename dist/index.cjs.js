'use strict';

var fs = require('fs');
var path = require('path');
var rollupPluginutils = require('rollup-pluginutils');

const defaultExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];

function image(options = {}) {
	const extensions = options.extensions || defaultExtensions;
	const includes = extensions.map(e => `**/*${e}`);
	const filter = rollupPluginutils.createFilter(options.include || includes, options.exclude);
	let images = [];

	function generateBundle(outputOptions, rendered) {
		const dir =
			outputOptions.dir || path.dirname(outputOptions.dest || outputOptions.file);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
		images.forEach(id => {
			const base = path.basename(id);
			fs.writeFileSync(`${dir}/${base}`, fs.readFileSync(id));
			const parts = id.split('.');
			const extension = parts.pop();
			const idx2 = `${parts.join('.')}@2.${extension}`;
			const idx3 = `${parts.join('.')}@3.${extension}`;
			if (fs.existsSync(idx2)) {
				fs.writeFileSync(`${dir}/${base}@2`, fs.readFileSync(idx2));
			}
			if (fs.existsSync(idx3)) {
				fs.writeFileSync(`${dir}/${base}@3`, fs.readFileSync(idx3));
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
			return `const img = require('./${path.basename(id)}'); export default img;`;
		},
		generateBundle,
		ongenerate: generateBundle
	};
}

module.exports = image;
