import { defineConfig } from 'tsup';

/**
 * Build configuration.
 *
 * Emits both ESM (`.js`) and CommonJS (`.cjs`) bundles alongside TypeScript
 * declaration files so the package can be consumed from `import` and
 * `require` call sites without a compatibility shim.
 */
export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	dts: true,
	sourcemap: true,
	clean: true,
	minify: false,
	treeshake: true,
	target: 'es2022',
	outExtension({ format }) {
		return { js: format === 'cjs' ? '.cjs' : '.js' };
	},
});
