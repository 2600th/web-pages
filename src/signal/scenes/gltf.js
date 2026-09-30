// Shared loader for the site's glTF models: meshopt-compressed geometry, WebP textures.
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

let loader = null;
export function loadModel(url) {
  loader ??= new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  return loader.loadAsync(url);
}
