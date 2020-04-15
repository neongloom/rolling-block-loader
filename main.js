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
  const canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  // create camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
  );
  camera.position.set(9, 6, 12);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  scene = new THREE.Scene();
  // scene.background = new THREE.Color(0xb9efff);
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xffffff, 10, 22);

  let light = new THREE.HemisphereLight(0xffffff, 0x000000, 0.6); // sky color, ground color, intensity
  light.position.set(0, 8, 0);
  scene.add(light);

  light = new THREE.DirectionalLight(0xd0dfdf, 1.0);
  light.position.set(-2, 30, 5);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;

  // light.shadow.bias = -0.004;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 120;
  // light.shadow.camera.top = 1200;
  // light.shadow.camera.bottom = -1000;
  // light.shadow.camera.left = -1200;
  // light.shadow.camera.right = 1200;
  light.shadow.radius = 10;
  scene.add(light);
  scene.add(light.target);

  // scene.add(new CameraHelper(light.shadow.camera));

  let newMat = new THREE.MeshStandardMaterial({
    color: 0xb94f69,
    // emissive: 0xee6677,
    metalness: 0,
    roughness: 1
  });

  // ground
  let ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(100, 100),
    newMat
    // new THREE.MeshStandardMaterial({ color: 0x69afb9, depthWrite: true })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -5;
  scene.add(ground);
  ground.receiveShadow = true;

  // grid
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

  // platform
  // loader.load('platform.fbx', object => {
  //   object.castShadow = true;
  //   object.receiveShadow = true;
  //   scene.add(object);
  // });

  // renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;

  renderer.shadowCameraNear = 1;
  renderer.shadowCameraFar = camera.far;
  renderer.shadowCameraFov = 95;

  renderer.shadowMapBias = 0.0039;
  renderer.shadowMapDarkness = 0.5;
  renderer.shadowMapWidth = 1024;

  // for accurate colors
  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;

  renderer.physicallyCorrectLights = true;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  window.addEventListener('resize', onWindowResize, false);

  // stats
  stats = new Stats();
  // container.appendChild(stats.dom);
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

  // stats.update();

  renderer.render(scene, camera);
}

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ canvas });

  // camera
  const fov = 40;
  const aspect = 2; // canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 120;

  function createMaterial() {
    const material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide
    });

    const hue = Math.random();
    const saturation = 1;
    const luminance = 0.5;
    material.color.setHSL(hue, saturation, luminance);

    return material;
  }

  function addSolidGeometry(x, y, geometry) {
    const mesh = new THREE.Mesh(geometry, createMaterial());
    addObject(x, y, mesh);
  }

  {
    const width = 8;
    const height = 8;
    const depth = 8;
    addSolidGeometry(-2, 2, new THREE.BoxBufferGeometry(width, height, depth));
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize; // returns true if resized
  }

  function render(time) {
    time *= 0.001; // convert time to seconds

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    objects.forEach((obj, ndx) => {
      const speed = 0.1 + ndx * 0.1;
      const rot = time * speed;
      obj.rotation.x = rot;
      obj.rotation.y = rot;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
