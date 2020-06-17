import * as THREE from "three";
import * as dat from "dat.gui";
import RotationGeometry from "./rotationGeometry";
import Utils from "@/modules/utils.ts";

export default class GeometryGrid {
  scene: THREE.Scene;
  gui: dat.GUI;
  grid: { cols: number; rows: number };
  gutter: { size: number };
  groupMesh: THREE.Object3D;
  meshes: THREE.Mesh[][];
  initialRotation: { x: number; y: number; z: number };
  geometries: RotationGeometry[];

  constructor({
    scene,
    gui,
    grid,
    gutter
  }: {
    scene: THREE.Scene;
    gui: dat.GUI;
    grid: { cols: number; rows: number };
    gutter: { size: number };
  }) {
    this.scene = scene;
    this.gui = gui;
    this.grid = grid;
    this.gutter = gutter;
    this.groupMesh = new THREE.Object3D(); // add scene
    this.meshes = []; // to access each mesh when drawing
    this.initialRotation = { x: 0, y: 0, z: 0 };
    this.geometries = [
      new RotationGeometry(new THREE.BoxBufferGeometry(0.5, 0.5, 0.5), 0, 0, 0),
      new RotationGeometry(
        new THREE.TorusBufferGeometry(0.3, 0.12, 30, 200),
        Utils.radians(90),
        0,
        0
      ),
      new RotationGeometry(
        new THREE.ConeBufferGeometry(0.3, 0.5, 32),
        0,
        0,
        Utils.radians(-180)
      )
    ];
  }

  setup(control = true) {
    const meshParams = {
      color: "#ff00ff",
      metalness: 0.58,
      emissive: "#000000",
      roughness: 0.18
    };

    const material = new THREE.MeshPhysicalMaterial(meshParams);

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

    if (control) {
      this.setupMeshControl(material);
    }
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

  setupMeshControl(material: THREE.MeshPhysicalMaterial) {
    const meshParams = {
      color: "#ff00ff",
      metalness: 0.58,
      emissive: "#000000",
      roughness: 0.18
    };

    this.gui.addColor(meshParams, "color").onChange(color => {
      const rgb = Utils.hexToTreeRGBColor(color);
      if (rgb) {
        material.color = rgb;
      }
    });
    this.gui.add(meshParams, "metalness", 0.1, 1).onChange(val => {
      material.metalness = val;
    });
    this.gui.add(meshParams, "roughness", 0.1, 1).onChange(val => {
      material.roughness = val;
    });
  }
}
