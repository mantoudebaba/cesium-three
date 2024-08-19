import * as bmgl from "cesium";

const divLabel = class {
  constructor(val) {
    this.viewer = val.viewer;
    this.height = val.height;
    this.position = bmgl.Cartesian3.fromDegrees(
      val.position[0],
      val.position[1],
      val.height
    );
    this.vmInstance = val.dom;
    this.bmgl = bmgl;
    this.dId = val.id ? val.id : undefined;
    this.className = val.className ? val.className : undefined;
    this.offset = val.offset;
    this.widget = val.viewer.BMWidget ?? val.viewer.cesiumWidget;
    if (!this.bmgl) {
      throw "no bmgl init function";
    }
    if (!(this.vmInstance instanceof HTMLElement)) {
      var el = document.createElement("div");
      el.innerHTML = this.vmInstance;
      this.vmInstance = el;
    }
    if (!this.vmInstance || !this.vmInstance.style) {
      throw "Not passing available Dom";
    }
    this.initDom();
    this.show = true;
    this.widget.container.appendChild(this.vmInstance);
    this.addPostRender();
  }
  setOffset(arr) {
    this.offset = arr;
  }
  initDom() {
    if (this.className) {
      this.vmInstance.classList.add(this.className);
    }
    if (this.dId) this.vmInstance.id = "divLabel" + this.dId;
    this.vmInstance.style.position = "absolute";
    this.vmInstance.style.zIndex = 5;
    this.vmInstance.NativeRemove = this.vmInstance.remove;
    this.vmInstance.remove = this.remove.bind(this, this.vmInstance);
    if (!this.vmInstance.classList.contains("bmgl-divLabel"))
      this.vmInstance.classList.add("bmgl-divLabel");
  }
  setDom(dom) {
    if (dom instanceof HTMLElement) {
      this.vmInstance.remove();
      this.vmInstance = dom;
      this.initDom();
    } else {
      this.vmInstance.innerHTML = dom;
    }
  }
  addPostRender() {
    this.viewer.scene.postRender.addEventListener(this.postRender, this);
    this._render = this.postRender;
  }
  postRender() {
    if (!this.vmInstance || !this.vmInstance.style) return;
    if (this.vmInstance.style.zIndex === -1) return;
    var p_2d = this.viewer.scene.cartesianToCanvasCoordinates(this.position);
    if (bmgl.defined(p_2d)) {
      if (this.offset) {
        this.vmInstance.style.top = p_2d.y + this.offset[1] + "px";
        const elWidth = this.vmInstance.offsetWidth;
        this.vmInstance.style.left =
          p_2d.x - elWidth / 2 + this.offset[0] + "px";
      } else {
        this.vmInstance.style.top = p_2d.y + "px";
        const elWidth = this.vmInstance.offsetWidth;
        this.vmInstance.style.left = p_2d.x - elWidth / 2 + "px";
      }
      const camerPosition = this.viewer.camera.position;
      let height =
        this.viewer.scene.globe.ellipsoid.cartesianToCartographic(
          camerPosition
        ).height;
      height += this.viewer.scene.globe.ellipsoid.maximumRadius;
      if (
        !(
          this.bmgl.Cartesian3.distance(camerPosition, this.position) > height
        ) &&
        this.viewer.camera.positionCartographic.height < 5e7
      ) {
        this.vmInstance.style.display = "block";
      } else {
        this.vmInstance.style.display = "none";
      }
    } else {
      this.vmInstance.style.display = "none";
    }
  }
  remove() {
    this.vmInstance.NativeRemove && this.vmInstance.NativeRemove();
    this.viewer.scene.postRender.removeEventListener(this.postRender, this);
  }
  isShow() {
    return this.show;
  }
  toggleShow(isShow) {
    this.show = isShow ?? !this.show;
    this.vmInstance.style.zIndex = this.show ? 10 : -1;
    return this;
  }
  changePosition(position) {
    if (position instanceof bmgl.Cartesian3) {
      this.position = position;
    } else if (position instanceof Array && position.length == 2) {
      this.position = bmgl.Cartesian3.fromDegrees(
        position[0],
        position[1],
        this.height
      );
    } else if (position instanceof Array && position.length == 3) {
      this.position = bmgl.Cartesian3.fromDegrees(
        position[0],
        position[1],
        position[2]
      );
      this.height = position[2];
    }
    return this;
  }
  removeAllDiv() {
    document.querySelectorAll(".bmgl-divLabel").forEach((A) => A.remove());
  }
};
export default divLabel;
