import * as THREE from './build/three.module.js';

import Stats from './jsm/stats.module.js';

// import { OrbitControls } from './jsm/OrbitControls.js';
import { GLTFLoader } from './jsm/GLTFLoader.js';
// import { DRACOLoader } from './jsm/DRACOLoader.js';

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
    1,
    90
  );
  camera.position.set(15, 14, 16);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  // scene.fog = new THREE.Fog(0xffffff, 15, 52);
  scene.fog = new THREE.FogExp2(0xffffff, 0.025);

  // let light = new THREE.HemisphereLight(0xff3f4f, 0x0080a0, 1.9); // sky color, ground color, intensity
  // light.position.set(0, 8, 0);
  // scene.add(light);

  let light = new THREE.DirectionalLight(0xe04f40, 10);
  light.position.set(8, 25, -9);
  light.target.position.set(0, 0, 0);
  // light.castShadow = true;

  // light.shadow.bias = -0.004;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 50;
  // light.shadow.radius = 10;
  // light.shadow.radius = 10;

  scene.add(light);

  // let newMat = new THREE.MeshLambertMaterial({
  //   color: 0x1a548a,
  //   metalness: 0,
  //   roughness: 1
  // });

  // ground
  // let ground = new THREE.Mesh(new THREE.PlaneBufferGeometry(150, 150), newMat);
  // ground.rotation.x = -Math.PI / 2;
  // ground.position.y = -1.0;
  // scene.add(ground);
  // ground.receiveShadow = true;

  let gltfLoader = new GLTFLoader();

  gltfLoader.load('cubewithplatform-3.glb', gltf => {
    let model = gltf.scene;
    scene.add(model);

    // model.scale.set(1, 1, 1);
    // model.traverse(obj => {
    //   if (obj.castShadow !== undefined) {
    //     obj.castShadow = true;
    //     obj.receiveShadow = true;
    //   }
    //   if (obj.isMesh) obj.material = newMat;
    // });

    mixer = new THREE.AnimationMixer(model);
    let clip1 = gltf.animations[0];
    let action1 = mixer.clipAction(clip1);
    action1.play();
    // mixer.clipAction(gltf.animations[0]).play(); // this is the same as the above three lines
  });

  renderer.shadowMap.enabled = true;
  // renderer.shadowMap.type = THREE.VSMShadowMap;
  // renderer.shadowMap.type = THREE.PCFShadowMap;
  // renderer.shadowMapSoft = true;

  // for accurate colors
  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;

  renderer.physicallyCorrectLights = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  // controls = new OrbitControls(camera, renderer.domElement);
  // controls.target.set(0, 0, 0);
  // controls.update();

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
  // controls.update(delta);
  stats.update();

  renderer.render(scene, camera);
}
