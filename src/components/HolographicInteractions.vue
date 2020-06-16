<template>
  <div class="holographic-interactions">
    <h1>Holographic Interactions</h1>
    <div id="stats-output"></div>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-use-before-define */

import { Component, Vue } from "vue-property-decorator";
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import { TweenMax, Expo } from "gsap";

const radians = (degrees: number) => {
  return (degrees * Math.PI) / 180;
};

const distance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

const map = (
  value: number,
  start1: number,
  stop1: number,
  start2: number,
  stop2: number
) => {
  return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
};

const hexToRgbTreeJs = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (result) {
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    return new THREE.Color(`rgb(${r}, ${g}, ${b})`);
  }
  return null;
};

class BackgroundGeometry {
  geom: THREE.BufferGeometry;
  rotationX: number;
  rotationY: number;
  rotationZ: number;

  constructor(
    geom: THREE.BufferGeometry,
    rotationX: number,
    rotationY: number,
    rotationZ: number
  ) {
    this.geom = geom;
    this.rotationX = rotationX;
    this.rotationY = rotationY;
    this.rotationZ = rotationZ;
  }
}

interface Position {
  x: number;
  y: number;
  z: number;
}

@Component
export default class HolographicInteractions extends Vue {
  stats = Stats();
  gui = new dat.GUI();

  raycaster = new THREE.Raycaster();
  backgroundColor = "#1b1b1b";
  gutter = { size: 1.2 };
  meshes: THREE.Mesh[][] = [];
  grid = { cols: 15, rows: 7 };
  width = window.innerWidth;
  height = window.innerHeight;
  mouse3D = new THREE.Vector2();
  repulsion = 1;

  geometries = [
    new BackgroundGeometry(new THREE.BoxBufferGeometry(0.5, 0.5, 0.5), 0, 0, 0),
    new BackgroundGeometry(
      new THREE.TorusBufferGeometry(0.3, 0.12, 30, 200),
      radians(90),
      0,
      0
    ),
    new BackgroundGeometry(
      new THREE.ConeBufferGeometry(0.3, 0.5, 32),
      0,
      0,
      radians(-180)
    )
  ];

  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1
  );
  controls = new OrbitControls(this.camera, this.renderer.domElement);
  groupMesh = new THREE.Object3D();
  floor = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.ShadowMaterial({ opacity: 0.3 })
  );

  initialRotation = {
    x: 0,
    y: 0,
    z: 0
  };

  mounted() {
    this.setup();
    this.setupScene();
    this.setupCamera();
    this.addAmbientLight();
    this.addSpotLight();
    this.addRectLight();
    this.createGrid();
    this.addFloor();
    this.animate();
    this.addPointLight(0xfff000, { x: 0, y: 10, z: -100 });
    this.addPointLight(0xfff000, { x: 100, y: 10, z: 0 });
    this.addPointLight(0x00ff00, { x: 20, y: 5, z: 20 });
  }

  setup() {
    const gui = this.gui.addFolder("Background");
    gui.addColor(this, "backgroundColor").onChange(color => {
      document.body.style.backgroundColor = color;
    });

    window.addEventListener("resize", this.onResize.bind(this), {
      passive: true
    });
    window.addEventListener("mousemove", this.onMouseMove.bind(this), {
      passive: true
    });
    this.onMouseMove({ clientX: 0, clientY: 0 });
  }

  onMouseMove({ clientX, clientY }: { clientX: number; clientY: number }) {
    this.mouse3D.x = (clientX / this.width) * 2 - 1;
    this.mouse3D.y = -(clientY / this.height) * 2 + 1;
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  setupScene() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(this.renderer.domElement);
  }

  setupCamera() {
    this.camera.position.set(0, 30, 0);
  }

  addAmbientLight() {
    const obj = { color: "#2900af" };
    const light = new THREE.AmbientLight(obj.color, 1);

    this.scene.add(light);

    const gui = this.gui.addFolder("Ambient Light");

    gui.addColor(obj, "color").onChange(color => {
      const rgb = hexToRgbTreeJs(color);
      if (rgb) {
        light.color = rgb;
      }
    });
  }

  addSpotLight() {
    const obj = { color: "#e000ff" };
    const light = new THREE.SpotLight(obj.color, 1, 1000);

    light.position.set(0, 27, 0);
    light.castShadow = true;

    this.scene.add(light);

    const gui = this.gui.addFolder("Spot Light");

    gui.addColor(obj, "color").onChange(color => {
      const rgb = hexToRgbTreeJs(color);
      if (rgb) {
        light.color = rgb;
      }
    });
  }

  addRectLight() {
    const obj = { color: "#0077ff" };
    const rectLight = new THREE.RectAreaLight(obj.color, 1, 2000, 2000);

    rectLight.position.set(5, 50, 50);
    rectLight.lookAt(0, 0, 0);

    this.scene.add(rectLight);

    const gui = this.gui.addFolder("Rect Light");

    gui.addColor(obj, "color").onChange(color => {
      const rgb = hexToRgbTreeJs(color);
      if (rgb) {
        rectLight.color = rgb;
      }
    });
  }

  addPointLight(color: number, position: Position) {
    const pointLight = new THREE.PointLight(color, 1, 1000, 1);
    pointLight.position.set(position.x, position.y, position.z);

    this.scene.add(pointLight);
  }

  getRandomGeometry() {
    return this.geometries[
      Math.floor(Math.random() * Math.floor(this.geometries.length))
    ];
  }

  getMesh(
    geometry: THREE.BufferGeometry,
    material: THREE.MeshPhysicalMaterial
  ) {
    const mesh = new THREE.Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  createGrid() {
    const meshParams = {
      color: "#ff00ff",
      metalness: 0.58,
      emissive: "#000000",
      roughness: 0.18
    };

    const material = new THREE.MeshPhysicalMaterial(meshParams);
    const gui = this.gui.addFolder("Mesh Material");

    gui.addColor(meshParams, "color").onChange(color => {
      const rgb = hexToRgbTreeJs(color);
      if (rgb) {
        material.color = rgb;
      }
    });
    gui.add(meshParams, "metalness", 0.1, 1).onChange(val => {
      material.metalness = val;
    });
    gui.add(meshParams, "roughness", 0.1, 1).onChange(val => {
      material.roughness = val;
    });

    for (let row = 0; row < this.grid.rows; row++) {
      this.meshes[row] = [];

      for (let col = 0; col < this.grid.cols; col++) {
        const geometry = this.getRandomGeometry();
        const mesh = this.getMesh(geometry.geom, material);

        mesh.position.set(
          col + col * this.gutter.size,
          0,
          row + row * this.gutter.size
        );
        mesh.rotation.x = geometry.rotationX;
        mesh.rotation.y = geometry.rotationY;
        mesh.rotation.z = geometry.rotationZ;

        this.initialRotation = {
          x: mesh.rotation.x,
          y: mesh.rotation.y,
          z: mesh.rotation.z
        };

        this.groupMesh.add(mesh);
        this.meshes[row][col] = mesh;
      }
    }

    const centerX =
      (this.grid.cols - 1 + (this.grid.cols - 1) * this.gutter.size) * 0.5;
    const centerZ =
      (this.grid.rows - 1 + (this.grid.rows - 1) * this.gutter.size) * 0.5;

    this.groupMesh.position.set(-centerX, 0, -centerZ);

    this.scene.add(this.groupMesh);
  }

  initStats() {
    this.stats.setMode(0); // 0: fps, 1: ms

    // Align top-left
    this.stats.domElement.style.position = "absolute";
    this.stats.domElement.style.left = "0px";
    this.stats.domElement.style.top = "0px";

    const statsOutput = document.getElementById("stats-output");
    if (statsOutput === null) return;
    statsOutput.appendChild(this.stats.domElement);
  }

  addFloor() {
    this.floor.position.y = 0;
    this.floor.rotateX(-Math.PI / 2);
    this.floor.receiveShadow = true;

    this.scene.add(this.floor);
  }

  draw() {
    this.raycaster.setFromCamera(this.mouse3D, this.camera);

    const intersects = this.raycaster.intersectObjects([this.floor]);

    if (intersects.length) {
      const { x, z } = intersects[0].point;

      for (let row = 0; row < this.grid.rows; row++) {
        for (let col = 0; col < this.grid.cols; col++) {
          const mesh = this.meshes[row][col];

          const mouseDistance = distance(
            x,
            z,
            mesh.position.x + this.groupMesh.position.x,
            mesh.position.z + this.groupMesh.position.z
          );

          const y = map(mouseDistance, 6, 0, 0, 10);
          TweenMax.to(mesh.position, 0.2, { y: y < 1 ? 1 : y });

          const scaleFactor = mesh.position.y / 2.5;
          const scale = scaleFactor < 1 ? 1 : scaleFactor;

          TweenMax.to(mesh.scale, 0.4, {
            ease: Expo.easeOut,
            x: scale,
            y: scale,
            z: scale
          });

          TweenMax.to(mesh.rotation, 0.5, {
            ease: Expo.easeOut,
            x: map(mesh.position.y, -1, 1, radians(45), this.initialRotation.x),
            z: map(
              mesh.position.y,
              -1,
              1,
              radians(-90),
              this.initialRotation.z
            ),
            y: map(mesh.position.y, -1, 1, radians(90), this.initialRotation.y)
          });
        }
      }
    }
  }

  animate() {
    this.controls.update();

    this.draw();

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.animate.bind(this));
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
canvas {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
