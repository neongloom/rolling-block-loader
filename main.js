import * as THREE from './build/three.module.js';

import Stats from './jsm/stats.module.js';

import { OrbitControls } from './jsm/OrbitControls.js';
import { FBXLoader } from './jsm/FBXLoader.js';
import { GLTFLoader } from './jsm/GLTFLoader.js';
import { DRACOLoader } from './jsm/DRACOLoader.js';

var container, stats, controls;
let renderer, scene, camera;
let clock = new THREE.Clock();

let mixer;

init();
animate();
// main();

function init() {
  const canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  container = document.createElement('div');

  // create camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
  );
  camera.position.set(900, 600, 1200);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x69afb9);
  // scene.fog = new THREE.Fog(0x008000, 1200, 2000);

  let light = new THREE.HemisphereLight(0xffffff, 0x444444, 0.1); // sky color, ground color, intensity
  light.position.set(0, 200, 0);
  // scene.add(light);

  light = new THREE.DirectionalLight(0xd0dfdf, 9.9);
  light.position.set(400, 200, -600);
  light.castShadow = true;
  light.shadow.camera.top = 180;
  light.shadow.camera.bottom = -100;
  light.shadow.camera.left = -120;
  light.shadow.camera.right = 120;
  scene.add(light);

  // scene.add(new CameraHelper(light.shadow.camera));

  // ground
  let ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(9000, 9000),
    new THREE.MeshLambertMaterial({ color: 0x69afb9, depthWrite: true })
  );
  ground.rotation.x = -Math.PI / 2;
  // mesh.rotation.z = Math.PI / 4;
  ground.position.y = -100;
  ground.receiveShadow = true;
  ground.castShadow = true;
  scene.add(ground);

  let box = new THREE.Mesh(
    new THREE.BoxBufferGeometry(200, 200, 200),
    new THREE.MeshLambertMaterial({ color: 0x69afb9 })
  );
  box.receiveShadow = true;
  box.castShadow = true;
  box.position.y = 300;
  // scene.add(box);

  // grid
  let grid = new THREE.GridHelper(2000, 20, 0xf00000, 0x0000f0); // size, divisions, colorCenterLine, colorGrid
  grid.material.opacity = 0.8;
  grid.material.transparent = true;
  // scene.add(grid);

  // model
  let loader = new FBXLoader();
  // let dracoLoader = new DRACOLoader();
  // dracoLoader.setDecoderPath('jsm')
  let gltfLoader = new GLTFLoader();

  gltfLoader.load('cube.glb', function (gltf) {
    let model = gltf.scene;
    scene.add(model);

    model.scale.set(100, 100, 100);
    model.traverse(obj => {
      if (obj.castShadow !== undefined) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    // let material = new THREE.MeshLambertMaterial({ color: 0x55b663 });
    // mesh = new THREE.MESH(model, material);

    mixer = new THREE.AnimationMixer(model);
    let clip1 = gltf.animations[0];
    let action1 = mixer.clipAction(clip1);
    action1.play();
    // mixer.clipAction(gltf.animations[0]).play(); // this is the same as the above three lines

    // let action = mixer.clipAction(object.animations[0]);
    // action.play();
  });

  // scene.add(model);
  gltfLoader.load('platform.glb', function (gltf) {
    let model = gltf.scene;
    scene.add(model);

    model.scale.set(100, 100, 100);
    model.traverse(obj => {
      if (obj.castShadow !== undefined) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
  });

  // platform
  // loader.load('platform.fbx', function (object) {
  //   object.castShadow = true;
  //   object.receiveShadow = true;
  //   scene.add(object);
  // });

  // renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;

  renderer.shadowCameraNear = 0.1;
  renderer.shadowCameraFar = camera.far;
  renderer.shadowCameraFov = 50;

  renderer.shadowMapBias = 0.0039;
  renderer.shadowMapDarkness = 0.5;
  renderer.shadowMapWidth = 1024;

  // for accurate colors
  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;

  renderer.physicallyCorrectLights = true;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 100, 0);
  controls.update();

  window.addEventListener('resize', onWindowResize, false);

  // stats
  stats = new Stats();
  container.appendChild(stats.dom);
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

  // new scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x325688);

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }
  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(1, -2, -4);
    scene.add(light);
  }

  // add a light
  const objects = [];
  const spread = 15;

  function addObject(x, y, obj) {
    obj.position.x = x * spread;
    obj.position.y = y * spread;

    scene.add(obj);
    objects.push(obj);
  }

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

// main();
