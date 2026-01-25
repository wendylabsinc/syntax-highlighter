const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Copy index.html to dist
fs.copyFileSync('src/index.html', 'dist/index.html');

// Copy CSInterface library
if (!fs.existsSync('dist/lib')) {
  fs.mkdirSync('dist/lib', { recursive: true });
}
if (fs.existsSync('src/lib/CSInterface.js')) {
  fs.copyFileSync('src/lib/CSInterface.js', 'dist/lib/CSInterface.js');
}

// Copy icons if they exist
if (fs.existsSync('icons')) {
  if (!fs.existsSync('dist/../icons')) {
    fs.mkdirSync('icons', { recursive: true });
  }
}

const buildOptions = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'dist/main.js',
  format: 'iife',
  target: ['es2015'],
  minify: !isWatch,
  sourcemap: isWatch,
};

async function build() {
  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('Watching for changes...');
  } else {
    await esbuild.build(buildOptions);
    console.log('Build complete!');
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
