import * as THREE from "three";
import * as dat from "dat.gui";

import { Position } from "@/types/position";
import { HexColor } from "@/types/hexColor";

export default class Light {
  scene: THREE.Scene;
  gui: dat.GUI;

  constructor(scene: THREE.Scene, gui: dat.GUI) {
    this.scene = scene;
    this.gui = gui;
  }

  setup() {
    this.addAmbientLight();
    this.addSpotLight();
    this.addRectLight();
    this.addPointLight(0xfff000, { x: 0, y: 10, z: -100 });
    this.addPointLight(0xfff000, { x: 100, y: 10, z: 0 });
    this.addPointLight(0x00ff00, { x: 20, y: 5, z: 20 });
  }

  addAmbientLight(control = true) {
    const obj: HexColor = { color: "#2900af" };
    const light = new THREE.AmbientLight(obj.color, 1);

    this.scene.add(light);
    if (control) {
      this.addAmbientLightControl(light, obj);
    }
  }

  addSpotLight(control = true) {
    const obj: HexColor = { color: "#e000ff" };
    const light = new THREE.SpotLight(obj.color, 1, 1000);

    light.position.set(0, 27, 0);
    light.castShadow = true;

    this.scene.add(light);
    if (control) {
      this.addSpotLightControl(light, obj);
    }
  }

  addRectLight(control = true) {
    const obj = { color: "#0077ff" };
    const rectLight = new THREE.RectAreaLight(obj.color, 1, 2000, 2000);

    rectLight.position.set(5, 50, 50);
    rectLight.lookAt(0, 0, 0);

    this.scene.add(rectLight);
    if (control) {
      this.addRectLightControl(rectLight, obj);
    }
  }

  addPointLight(color: number, position: Position) {
    const pointLight = new THREE.PointLight(color, 1, 1000, 1);
    pointLight.position.set(position.x, position.y, position.z);

    this.scene.add(pointLight);
  }

  addAmbientLightControl(light: THREE.AmbientLight, hexColor: HexColor) {
    const gui = this.gui.addFolder("Ambient Light");

    gui.addColor(hexColor, "color").onChange(color => {
      const threeColor = this.hexToTreeRGBColor(color);
      if (threeColor) {
        light.color = threeColor;
      }
    });
  }

  addSpotLightControl(light: THREE.SpotLight, hexColor: HexColor) {
    const gui = this.gui.addFolder("Spot Light");

    gui.addColor(hexColor, "color").onChange(color => {
      const threeColor = this.hexToTreeRGBColor(color);
      if (threeColor) {
        light.color = threeColor;
      }
    });
  }

  addRectLightControl(light: THREE.RectAreaLight, hexColor: HexColor) {
    const gui = this.gui.addFolder("Rect Light");

    gui.addColor(hexColor, "color").onChange(color => {
      const threeColor = this.hexToTreeRGBColor(color);
      if (threeColor) {
        light.color = threeColor;
      }
    });
  }

  hexToTreeRGBColor(hex: string) {
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
}
