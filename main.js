import * as THREE from './build/three.module.js';

import Stats from './jsm/stats.module.js';

import { OrbitControls } from './jsm/OrbitControls.js';
import { GLTFLoader } from './jsm/GLTFLoader.js';
import { DRACOLoader } from './jsm/DRACOLoader.js';

let stats, controls;
let renderer, scene, camera;
let clock = new THREE.Clock();

let mixer;

init();
animate();

function init() {
  const container = document.querySelector('#container');
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  stats = new Stats();
  container.appendChild(stats.dom);

  // camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
  );
  camera.position.set(11, 8, 12);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  // scene.fog = new THREE.Fog(0xffffff, 10, 22);
  scene.fog = new THREE.FogExp2(0xffffff, 0.022);

  let light = new THREE.HemisphereLight(0xffffff, 0x000000, 0.1); // sky color, ground color, intensity
  light.position.set(0, 8, 0);
  scene.add(light);

  light = new THREE.DirectionalLight(0xd0dfdf, 0.8);
  light.position.set(8, 25, -9);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;

  // light.shadow.bias = -0.004;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 120;
  light.shadow.radius = 10;
  scene.add(light);
  scene.add(light.target);

  let newMat = new THREE.MeshStandardMaterial({
    color: 0x390f19,
    emissive: 0x2e6677,
    emissiveIntensity: 0.4,
    metalness: 1,
    roughness: 1
  });

  // ground
  let ground = new THREE.Mesh(new THREE.PlaneBufferGeometry(200, 200), newMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -5;
  scene.add(ground);
  ground.receiveShadow = true;

  // let grid = new THREE.GridHelper(2000, 20, 0xf00000, 0x0000f0); // size, divisions, colorCenterLine, colorGrid
  // grid.material.opacity = 0.8;
  // grid.material.transparent = true;
  // scene.add(grid);

  // let dracoLoader = new DRACOLoader();
  // dracoLoader.setDecoderPath('jsm')
  let gltfLoader = new GLTFLoader();

  gltfLoader.load('cubewithplatform.glb', gltf => {
    let model = gltf.scene;
    scene.add(model);

    // model.scale.set(1, 1, 1);
    model.traverse(obj => {
      if (obj.castShadow !== undefined) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
      if (obj.isMesh) obj.material = newMat;
    });

    mixer = new THREE.AnimationMixer(model);
    let clip1 = gltf.animations[0];
    let action1 = mixer.clipAction(clip1);
    action1.play();
    // mixer.clipAction(gltf.animations[0]).play(); // this is the same as the above three lines
  });

  // platform // for fbx loader
  // loader.load('platform.fbx', object => {
  //   object.castShadow = true;
  //   object.receiveShadow = true;
  //   scene.add(object);
  // });

  renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.VSMShadowMap;
  // renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.type = 1;
  renderer.shadowMapSoft = true;

  // for accurate colors
  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;

  renderer.physicallyCorrectLights = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  let delta = clock.getDelta();

  if (mixer) mixer.update(delta);
  controls.update(delta);
  stats.update();

  renderer.render(scene, camera);
}
