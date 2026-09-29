// Builds web-sized derivatives of the 2600th character scan.
// Source master stays in the gitignored _media-source/ directory; only the
// optimized derivatives are committed under public/models/.
import { mkdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  dequantize, weld, simplify, textureCompress, quantize, meshopt, prune, dedup,
} from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '../../../_media-source/2600th-character-source.glb');
const outDir = resolve(here, '../src/assets/models');

const variants = [
  // Desktop hero: ~200k triangles, 2K albedo.
  { name: '2600th-hi.glb', ratio: 0.1, error: 0.0005, albedo: 2048, orm: 1024 },
  // Phones and point-cloud sampling: ~60k triangles, 1K albedo.
  { name: '2600th-lo.glb', ratio: 0.03, error: 0.002, albedo: 1024, orm: 512 },
];

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

// Smooth, area-weighted normals welded by position only, so UV seams in the
// generated scan do not show up as hard lighting creases.
function smoothNormals() {
  return (document) => {
    for (const mesh of document.getRoot().listMeshes()) {
      for (const prim of mesh.listPrimitives()) {
        const pos = prim.getAttribute('POSITION').getArray();
        const idx = prim.getIndices().getArray();
        const count = pos.length / 3;
        const key = new Map();
        const group = new Uint32Array(count);
        const q = 1e5;
        for (let i = 0; i < count; i++) {
          const k = `${Math.round(pos[i * 3] * q)},${Math.round(pos[i * 3 + 1] * q)},${Math.round(pos[i * 3 + 2] * q)}`;
          let g = key.get(k);
          if (g === undefined) { g = key.size; key.set(k, g); }
          group[i] = g;
        }
        const acc = new Float32Array(key.size * 3);
        for (let t = 0; t < idx.length; t += 3) {
          const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
          const e1x = pos[b] - pos[a], e1y = pos[b + 1] - pos[a + 1], e1z = pos[b + 2] - pos[a + 2];
          const e2x = pos[c] - pos[a], e2y = pos[c + 1] - pos[a + 1], e2z = pos[c + 2] - pos[a + 2];
          const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
          for (const v of [idx[t], idx[t + 1], idx[t + 2]]) {
            const g = group[v] * 3;
            acc[g] += nx; acc[g + 1] += ny; acc[g + 2] += nz;
          }
        }
        const normals = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          const g = group[i] * 3;
          const l = Math.hypot(acc[g], acc[g + 1], acc[g + 2]) || 1;
          normals[i * 3] = acc[g] / l; normals[i * 3 + 1] = acc[g + 1] / l; normals[i * 3 + 2] = acc[g + 2] / l;
        }
        prim.setAttribute('NORMAL', document.createAccessor().setType('VEC3').setArray(normals)
          .setBuffer(document.getRoot().listBuffers()[0]));
      }
    }
  };
}

await mkdir(outDir, { recursive: true });
for (const v of variants) {
  const doc = await io.read(source);
  const tris = () => doc.getRoot().listMeshes().flatMap((m) => m.listPrimitives())
    .reduce((n, p) => n + p.getIndices().getCount() / 3, 0);
  const before = tris();
  const [albedo, orm] = doc.getRoot().listTextures();
  await doc.transform(
    dequantize(),
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: v.ratio, error: v.error }),
    smoothNormals(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 86, resize: [v.albedo, v.albedo], pattern: /.*/, slots: /baseColor/ }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 80, resize: [v.orm, v.orm], slots: /metallicRoughness/ }),
    quantize({ quantizeNormal: 10, quantizePosition: 14, quantizeTexcoord: 12 }),
    prune(),
    dedup(),
    meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
  );
  void albedo; void orm;
  const file = resolve(outDir, v.name);
  await io.write(file, doc);
  const { size } = await stat(file);
  console.log(`${v.name}: ${before.toLocaleString()} → ${tris().toLocaleString()} triangles, ${(size / 1e6).toFixed(2)} MB`);
}
