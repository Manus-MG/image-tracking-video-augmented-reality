#!/usr/bin/env node
/**
 * Compile thf.jpeg into targets.mind for MindAR image tracking.
 * Uses @napi-rs/canvas as a drop-in replacement for the native canvas module.
 * 
 * Usage: node tools/compile.mjs
 */

import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// We need to manually implement the compiler since mind-ar's offline compiler
// imports from 'canvas' which has broken native bindings. 
// Instead, we'll use the mind-ar compiler-base with our own canvas creation.

// Import the compiler base and dependencies
import { CompilerBase } from 'mind-ar/src/image-target/compiler-base.js';
import { buildTrackingImageList } from 'mind-ar/src/image-target/image-list.js';
import { extractTrackingFeatures } from 'mind-ar/src/image-target/tracker/extract-utils.js';
import 'mind-ar/src/image-target/detector/kernels/cpu/index.js';

// Create our own offline compiler using @napi-rs/canvas
class CustomOfflineCompiler extends CompilerBase {
  createProcessCanvas(img) {
    return createCanvas(img.width, img.height);
  }

  compileTrack({progressCallback, targetImages, basePercent}) {
    return new Promise((resolve, reject) => {
      const percentPerImage = (100-basePercent) / targetImages.length;
      let percent = 0;
      const list = [];
      for (let i = 0; i < targetImages.length; i++) {
        const targetImage = targetImages[i];
        const imageList = buildTrackingImageList(targetImage);
        const percentPerAction = percentPerImage / imageList.length;
        const trackingData = extractTrackingFeatures(imageList, (index) => {
          percent += percentPerAction;
          progressCallback(basePercent + percent);
        });
        list.push(trackingData);
      }
      resolve(list);
    });
  }
}

async function main() {
  console.log('📷 Loading image...');
  const imagePath = resolve(__dirname, '../assets/ventimg2.JPG');
  const img = await loadImage(readFileSync(imagePath));
  console.log(`   Image loaded: ${img.width}x${img.height}`);

  console.log('🔧 Compiling target...');
  const compiler = new CustomOfflineCompiler();
  await compiler.compileImageTargets([img], (progress) => {
    process.stdout.write(`\r   Progress: ${Math.round(progress)}%`);
  });
  console.log('');

  console.log('💾 Exporting data...');
  const buffer = compiler.exportData();
  const outputPath = resolve(__dirname, '../assets/targets.mind');
  writeFileSync(outputPath, Buffer.from(buffer));
  console.log(`✅ Saved to ${outputPath} (${buffer.byteLength} bytes)`);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
