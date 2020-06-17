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
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import { TweenMax, Expo } from "gsap";
import Light from "@/modules/light.ts";
import GeometryGrid from "@/modules/geometryGrid.ts";

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

@Component
export default class HolographicInteractions extends Vue {
  gui = new dat.GUI();

  raycaster = new THREE.Raycaster();
  backgroundColor = "#1b1b1b";
  width = window.innerWidth;
  height = window.innerHeight;
  mouse3D = new THREE.Vector2();
  repulsion = 1;

  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1
  );
  controls = new OrbitControls(this.camera, this.renderer.domElement);
  floor = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.ShadowMaterial({ opacity: 0.3 })
  );

  light = new Light(this.scene, this.gui);

  geometryGrid = new GeometryGrid({
    scene: this.scene,
    gui: this.gui,
    grid: { cols: 15, rows: 7 },
    gutter: { size: 1.2 }
  });

  mounted() {
    this.setup();
    this.setupScene();
    this.setupCamera();
    this.light.setup();
    this.geometryGrid.setup();
    this.addFloor();
    this.animate();
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

      for (let row = 0; row < this.geometryGrid.grid.rows; row++) {
        for (let col = 0; col < this.geometryGrid.grid.cols; col++) {
          const mesh = this.geometryGrid.meshes[row][col];

          const mouseDistance = distance(
            x,
            z,
            mesh.position.x + this.geometryGrid.groupMesh.position.x,
            mesh.position.z + this.geometryGrid.groupMesh.position.z
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
            x: map(
              mesh.position.y,
              -1,
              1,
              radians(45),
              this.geometryGrid.initialRotation.x
            ),
            z: map(
              mesh.position.y,
              -1,
              1,
              radians(-90),
              this.geometryGrid.initialRotation.z
            ),
            y: map(
              mesh.position.y,
              -1,
              1,
              radians(90),
              this.geometryGrid.initialRotation.y
            )
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
