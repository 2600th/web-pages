import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import ffmpegPath from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import sharp from 'sharp';
import config from './career-media.config.mjs';

const execFileAsync = promisify(execFile);
const MAX_PUBLIC_BYTES = 2_200_000;

export function validateConfig(mediaConfig) {
  const errors = [];
  const seen = new Set();

  for (const recipe of mediaConfig.recipes) {
    if (['internal-reference-only', 'excluded'].includes(recipe.status) && recipe.outputs.length > 0) {
      errors.push(`${recipe.key}: excluded media cannot define public outputs`);
    }
    if (seen.has(recipe.key)) {
      errors.push(`${recipe.key}: media key is duplicated`);
    }
    seen.add(recipe.key);
  }

  return errors;
}

export function buildVideoArgs(recipe, inputPath, outputPath) {
  return [
    '-y', '-ss', String(recipe.startSeconds), '-i', inputPath, '-t', String(recipe.durationSeconds),
    '-vf', `scale='min(${recipe.width},iw)':'min(${recipe.height},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2`,
    '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-movflags', '+faststart', outputPath,
  ];
}

export function buildWebmArgs(recipe, inputPath, outputPath) {
  return [
    '-y', '-ss', String(recipe.startSeconds), '-i', inputPath, '-t', String(recipe.durationSeconds),
    '-vf', `scale='min(${recipe.width},iw)':'min(${recipe.height},ih)':force_original_aspect_ratio=decrease:force_divisible_by=2`,
    '-an', '-c:v', 'libvpx-vp9', '-crf', '35', '-b:v', '0', '-row-mt', '1', outputPath,
  ];
}

async function checksum(filePath) {
  const contents = await readFile(filePath);
  return createHash('sha256').update(contents).digest('hex');
}

async function run(binary, args) {
  const result = await execFileAsync(binary, args, { windowsHide: true, maxBuffer: 10 * 1024 * 1024 });
  return result.stdout;
}

async function inspectSource(recipe, inputPath) {
  const inputStat = await stat(inputPath);
  const base = {
    key: recipe.key,
    kind: recipe.kind,
    status: recipe.status,
    sourceFile: recipe.sourceFile,
    sourceBytes: inputStat.size,
    sourceSha256: await checksum(inputPath),
  };

  if (recipe.kind === 'image') {
    const metadata = await sharp(inputPath).metadata();
    if (!metadata.width || !metadata.height) throw new Error(`${recipe.key}: image dimensions are unavailable`);
    return { ...base, width: metadata.width, height: metadata.height };
  }

  const probe = JSON.parse(await run(ffprobeStatic.path, [
    '-v', 'error', '-show_entries', 'stream=codec_name,width,height,duration:format=duration,size', '-of', 'json', inputPath,
  ]));
  const video = probe.streams?.find((stream) => stream.width && stream.height);
  const duration = Number(probe.format?.duration ?? video?.duration);
  if (!video || !Number.isFinite(duration) || duration <= 0) {
    throw new Error(`${recipe.key}: video is corrupt or has no measurable duration`);
  }
  if (recipe.startSeconds + recipe.durationSeconds > duration) {
    throw new Error(`${recipe.key}: configured excerpt exceeds the ${duration.toFixed(2)} second source`);
  }
  return { ...base, width: video.width, height: video.height, duration };
}

async function writeImageOutputs(recipe, inputPath, outputDir) {
  const outputs = [];
  const jobs = [
    ['poster-640.webp', 640, 'webp'],
    ['poster-1280.webp', 1280, 'webp'],
    ['poster-1280.avif', 1280, 'avif'],
  ].filter(([name]) => recipe.outputs.includes(name));

  for (const [name, width, format] of jobs) {
    const outputPath = join(outputDir, name);
    let pipeline = sharp(inputPath).rotate().resize({ width, withoutEnlargement: true });
    pipeline = format === 'avif'
      ? pipeline.avif({ quality: 56, effort: 6 })
      : pipeline.webp({ quality: 78, effort: 5 });
    await pipeline.toFile(outputPath);
    outputs.push(outputPath);
  }
  return outputs;
}

async function writeVideoOutputs(recipe, inputPath, outputDir) {
  const framePath = join(outputDir, '_poster.png');
  await run(ffmpegPath, [
    '-y', '-ss', String(recipe.startSeconds + Math.min(1.5, recipe.durationSeconds / 2)),
    '-i', inputPath, '-frames:v', '1', framePath,
  ]);

  const outputs = await writeImageOutputs(
    { ...recipe, outputs: recipe.outputs.filter((name) => /\.(webp|avif)$/.test(name)) },
    framePath,
    outputDir,
  );
  await rm(framePath, { force: true });

  if (recipe.outputs.includes('clip.mp4')) {
    const mp4Path = join(outputDir, 'clip.mp4');
    await run(ffmpegPath, buildVideoArgs(recipe, inputPath, mp4Path));
    outputs.push(mp4Path);
  }

  if (recipe.outputs.includes('clip.webm')) {
    const webmPath = join(outputDir, 'clip.webm');
    await run(ffmpegPath, buildWebmArgs(recipe, inputPath, webmPath));
    const mp4Path = join(outputDir, 'clip.mp4');
    const [webmStat, mp4Stat] = await Promise.all([stat(webmPath), stat(mp4Path)]);
    if (webmStat.size <= mp4Stat.size * 0.9) outputs.push(webmPath);
    else await rm(webmPath, { force: true });
  }
  return outputs;
}

async function describeOutput(root, filePath) {
  const outputStat = await stat(filePath);
  if (outputStat.size > MAX_PUBLIC_BYTES) {
    throw new Error(`${filePath}: ${outputStat.size} bytes exceeds the ${MAX_PUBLIC_BYTES} byte public-media limit`);
  }
  return {
    path: filePath.slice(root.length + 1).replaceAll('\\', '/'),
    bytes: outputStat.size,
    sha256: await checksum(filePath),
  };
}

async function main() {
  const mode = process.argv.includes('--build') ? 'build' : 'inspect';
  const validationErrors = validateConfig(config);
  if (validationErrors.length) throw new Error(validationErrors.join('\n'));
  if (!ffmpegPath || !ffprobeStatic.path) throw new Error('Project-local FFmpeg or FFprobe binary is unavailable');

  const root = resolve(import.meta.dirname, '..');
  const report = { mode, generatedAt: new Date().toISOString(), entries: [] };

  for (const recipe of config.recipes) {
    const inputPath = join(root, config.sourceRoot, recipe.sourceFile);
    const inspection = await inspectSource(recipe, inputPath);
    const entry = { ...inspection, sourceUrl: recipe.sourceUrl, outputs: [] };

    if (mode === 'build' && recipe.outputs.length > 0) {
      const outputDir = join(root, config.outputRoot, recipe.key);
      await mkdir(outputDir, { recursive: true });
      const paths = recipe.kind === 'video'
        ? await writeVideoOutputs(recipe, inputPath, outputDir)
        : await writeImageOutputs(recipe, inputPath, outputDir);
      entry.outputs = await Promise.all(paths.map((filePath) => describeOutput(root, filePath)));
    }
    report.entries.push(entry);
  }

  const reportPath = join(root, 'test-results', 'career-media-report.json');
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isDirectRun) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
