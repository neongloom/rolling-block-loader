import * as THREE from './three.module.js';

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
  scene.background = new THREE.Color(0xaaaaaa);

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
      side: THREE.DoubleSide,
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

  function addLineGeometry(x, y, geometry) {
    const material = new THREE.LineBasicMaterial({ color: 0x000000 });
    const mesh = new THREE.LineSegments(geometry, material);
    addObject(x, y, mesh);
  }

  {
    const width = 8;
    const height = 8;
    const depth = 8;
    addSolidGeometry(-2, 2, new THREE.BoxBufferGeometry(width, height, depth));
  }
  {
    const radius = 7;
    const segments = 24;
    addSolidGeometry(-1, 2, new THREE.CircleBufferGeometry(radius, segments));
  }
  {
    const radius = 6;
    const height = 8;
    const segments = 16;
    addSolidGeometry(
      0,
      2,
      new THREE.ConeBufferGeometry(radius, height, segments),
    );
  }
  {
    const radiusTop = 4;
    const radiusBottom = 4;
    const height = 8;
    const radialSegments = 12;
    addSolidGeometry(
      1,
      2,
      new THREE.CylinderBufferGeometry(
        radiusTop,
        radiusBottom,
        height,
        radialSegments,
      ),
    );
  }
  {
    const radius = 7;
    addSolidGeometry(2, 2, new THREE.DodecahedronBufferGeometry(radius));
  }
  {
    const shape = new THREE.Shape();
    const x = -2.5;
    const y = -5;
    shape.moveTo(x + 2.5, y + 2.5);
    shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
    shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
    shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
    shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
    shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
    shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

    const extrudeSettings = {
      steps: 2,
      depth: 2,
      bevelEnabled: true,
      bevelThickness: 1,
      bevelSize: 1,
      bevelSegments: 2,
    };

    addSolidGeometry(
      -2,
      1,
      new THREE.ExtrudeBufferGeometry(shape, extrudeSettings),
    );
  }
  {
    const radius = 7;
    addSolidGeometry(-1, 1, new THREE.IcosahedronBufferGeometry(radius));
  }
  {
    const points = [];
    for (let i = 0; i < 10; ++i) {
      points.push(new THREE.Vector2(Math.sin(1 * 0.2) * 3 + 3, (i - 5) * 0.8));
    }
    addSolidGeometry(0, 1, new THREE.LatheBufferGeometry(points));
  }
  {
    const radius = 7;
    addSolidGeometry(1, 1, new THREE.OctahedronBufferGeometry(radius));
  }
  {
    function klein(v, u, target) {
      u *= Math.PI;
      v *= 2 * Math.PI;
      u = u * 2;

      let x;
      let z;

      if (u < Math.PI) {
        x =
          3 * Math.cos(u) * (1 + Math.sin(u)) +
          2 * (1 - Math.cos(u) / 2) * Math.cos(u) * Math.cos(v);
        z =
          -8 * Math.sin(u) -
          2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
      } else {
        x =
          3 * Math.cos(u) * (1 + Math.sin(u)) +
          2 * (1 - Math.cos(u) / 2) * Math.cos(v + Math.PI);
        z = -8 * Math.sin(u);
      }
      const y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v);

      target.set(x, y, z).multiplyScalar(0.75);
    }

    const slices = 25;
    const stacks = 25;
    addSolidGeometry(
      2,
      1,
      new THREE.ParametricBufferGeometry(klein, slices, stacks),
    );
  }
  {
    const width = 9;
    const height = 9;
    const widthSegments = 2;
    const heightSegments = 2;
    addSolidGeometry(
      -2,
      0,
      new THREE.PlaneBufferGeometry(
        width,
        height,
        widthSegments,
        heightSegments,
      ),
    );
  }
  {
    // prettier-ignore
    const verticesOfCube = [
      -1,-1,-1,   1, -1, -1,   1, 1, -1,   -1, 1, -1,
      -1, -1, 1,  1, -1, 1,    1, 1, 1,    -1, 1, 1,
    ];

    // prettier-ignore
    const indicesOfFaces = [
      2, 1, 0,    0, 3, 2,
      0, 4, 7,    7, 3, 0,
      0, 1, 5,    5, 4, 0,
      1, 2, 6,    6, 5, 1,
      2, 3, 7,    7, 6, 2,
      4, 5, 6,    6, 7, 4,
    ];
    const radius = 7;
    const detail = 2;
    addSolidGeometry(
      -1,
      0,
      new THREE.PolyhedronBufferGeometry(
        verticesOfCube,
        indicesOfFaces,
        radius,
        detail,
      ),
    );
  }
  {
    const innerRadius = 2;
    const outerRadius = 7;
    const segments = 18;
    addSolidGeometry(
      0,
      0,
      new THREE.RingBufferGeometry(innerRadius, outerRadius, segments),
    );
  }
  {
    const shape = new THREE.Shape();
    const x = -2.5;
    const y = -5;
    shape.moveTo(x + 2.5, y + 2.5);
    shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
    shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
    shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
    shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
    shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
    shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);
    addSolidGeometry(1, 0, new THREE.ShapeBufferGeometry(shape));
  }
  {
    const radius = 7;
    const widthSegments = 12;
    const heightSegments = 8;
    addSolidGeometry(
      2,
      0,
      new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments),
    );
  }
  {
    const radius = 7;
    addSolidGeometry(-2, -1, new THREE.TetrahedronBufferGeometry(radius));
  }
  {
    const loader = new THREE.FontLoader();
    // promisify font loading
    function loadFont(url) {
      return new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });
    }

    async function doit() {
      const font = await loadFont(
        'https://threejsfundamentals.org/threejs/resources/threejs/fonts/helvetiker_regular.typeface.json',
      );
      const geometry = new THREE.TextBufferGeometry('three.js', {
        font: font,
        size: 3.0,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.15,
        bevelSize: 0.3,
        bevelSegments: 5,
      });
      const mesh = new THREE.Mesh(geometry, createMaterial());
      geometry.computeBoundingBox();
      geometry.boundingBox.getCenter(mesh.position).multiplyScalar(-1);

      const parent = new THREE.Object3D();
      parent.add(mesh);

      addObject(-1, -1, parent);
    }
    doit();
  }
  {
    const radius = 5;
    const tubeRadius = 2;
    const radialSegments = 8;
    const tubularSegments = 24;
    addSolidGeometry(
      0,
      -1,
      new THREE.TorusBufferGeometry(
        radius,
        tubeRadius,
        radialSegments,
        tubularSegments,
      ),
    );
  }
  {
    const radius = 3.5;
    const tube = 1.5;
    const radialSegments = 8;
    const tubularSegments = 64;
    const p = 2;
    const q = 3;
    addSolidGeometry(
      1,
      -1,
      new THREE.TorusKnotBufferGeometry(
        radius,
        tube,
        tubularSegments,
        radialSegments,
        p,
        q,
      ),
    );
  }
  {
    class CustomSinCurve extends THREE.Curve {
      constructor(scale) {
        super();
        this.scale = scale;
      }
      getPoint(t) {
        const tx = t * 3 - 1.5;
        const ty = Math.sin(2 * Math.PI * t);
        const tz = 0;
        return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
      }
    }
    const path = new CustomSinCurve(4);
    const tubularSegments = 20;
    const radius = 1;
    const radialSegments = 8;
    const closed = false;
    addSolidGeometry(
      2,
      -1,
      new THREE.TubeBufferGeometry(
        path,
        tubularSegments,
        radius,
        radialSegments,
        closed,
      ),
    );
  }
  {
    const width = 8;
    const height = 8;
    const depth = 8;
    const thresholdAngle = 15;
    addLineGeometry(
      -1,
      -2,
      new THREE.EdgesGeometry(
        new THREE.BoxBufferGeometry(width, height, depth),
        thresholdAngle,
      ),
    );
  }
  {
    const width = 8;
    const height = 8;
    const depth = 8;
    addLineGeometry(
      1,
      -2,
      new THREE.WireframeGeometry(
        new THREE.BoxBufferGeometry(width, height, depth),
      ),
    );
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

main();
