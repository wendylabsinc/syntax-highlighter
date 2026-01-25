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

// Copy icons if they exist
if (fs.existsSync('icons')) {
  if (!fs.existsSync('dist/icons')) {
    fs.mkdirSync('dist/icons', { recursive: true });
  }
  const icons = fs.readdirSync('icons');
  icons.forEach(icon => {
    fs.copyFileSync(path.join('icons', icon), path.join('dist/icons', icon));
  });
}

const buildOptions = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'dist/main.js',
  format: 'iife',
  target: ['es2015'],
  minify: !isWatch,
  sourcemap: isWatch,
  external: ['photoshop', 'illustrator', 'indesign', 'uxp'],
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
