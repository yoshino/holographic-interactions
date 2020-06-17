import * as THREE from "three";

export default class RotationGeometry {
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
