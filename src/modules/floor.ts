import * as THREE from "three";

export default class Floor {
  static create(scene: THREE.Scene): THREE.Mesh {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 2000),
      new THREE.ShadowMaterial({ opacity: 0.3 })
    );
    floor.position.y = 0;
    floor.rotateX(-Math.PI / 2);
    floor.receiveShadow = true;

    scene.add(floor);
    return floor;
  }
}
