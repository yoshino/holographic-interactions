import * as THREE from "three";

export default class Utils {
  static hexToTreeRGBColor(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);

      console.log(r, g, b);

      return new THREE.Color(`rgb(${r}, ${g}, ${b})`);
    }
    return null;
  }

  static radians(degrees: number) {
    return (degrees * Math.PI) / 180;
  }
}
