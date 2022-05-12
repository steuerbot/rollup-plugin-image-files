'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = require('fs');
var fs__default = _interopDefault(fs);
var path = require('path');
var path__default = _interopDefault(path);
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
			const base = path__default.basename(id);
			fs__default.writeFileSync(`${dir}/${base}`, fs__default.readFileSync(id));
			const parts = id.split('.');
			const extension = parts.pop();
			const idx2 = `${parts.join('.')}@2x.${extension}`;
			const idx3 = `${parts.join('.')}@3x.${extension}`;
			const baseName = base.split('.').slice(0, -1).join('.');
			if (fs__default.existsSync(idx2)) {
				fs__default.writeFileSync(`${dir}/${baseName}@2x.${extension}`, fs__default.readFileSync(idx2));
			}
			if (fs__default.existsSync(idx3)) {
				fs__default.writeFileSync(`${dir}/${baseName}@3x.${extension}`, fs__default.readFileSync(idx3));
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
