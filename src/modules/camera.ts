import * as THREE from "three";

export default class Camera {
  static create(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1
    );
    camera.position.set(0, 30, 0);

    return camera;
  }
}
