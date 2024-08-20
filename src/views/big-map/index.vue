<!--
 * @Author: LXL
 * @Date: 2024-06-14 16:15:38
 * @LastEditTime: 2024-08-20 09:30:27
 * @Description: 示例
 * @FastButton: ctrl+win+i, ctrl+win+t
-->
<template>
  <div class="container-integrate">
    <div id="cesium-container"></div>
    <div class="list-btn">
      <button v-for="item in btnList" @click="item.fun()">
        {{ item.text }}
      </button>
      <br />
      <div style="color: #fff">绘图 注：左键开始，点击鼠标滚轮结束</div>

      <button v-for="item in drawList" @click="item.fun()">
        {{ item.text }}
      </button>
    </div>
    <div id="mapModal">
      经度:{{ LngLat.longitude }}, 纬度:{{ LngLat.latitude }}
      <button
        @click="
          () => {
            CT.hideShowLayerModalCesium(mapData.mapModal, false);
          }
        "
      >
        关闭
      </button>
    </div>
  </div>
</template>
<script setup>
import { onMounted, reactive } from "vue";
import * as Cesium from "cesium";
import * as CT from "@/utils/cesium-three.js";
import Draw from "@/utils/draw-cesium.js";
import fill from "@/assets/fill.png";
import wall from "@/assets/wall.png";
import rain from "@/assets/rain.png";
import snow from "@/assets/snow.png";
let viewer = null;
let three = null;
let arr3DModal = [];
let draw = null;
const LngLat = reactive({
  longitude: 0,
  latitude: 0,
});
const mapData = {
  GDImageryProvider: null, //地图 其他图源
  LeftHandler: null, //点击事件
  Billboard: null, //图形
  Polygon: null, //图形
  Line: null, //图形
  Wall: null, //图形
  PolygonHoles: null, //图形
  Rain: null, //降雨
  Snow: null, //降雪
  mapModal: null, //弹窗
};

const btnList = [
  {
    text: "切换视角",
    fun: () => {
      CT.viewerCameraCesium(viewer, {
        longitude: 112.77232203811953,
        latitude: 28.061197706159664,
      });
    },
  },
  {
    text: "飞跃视角",
    fun: () => {
      CT.viewerCameraFlyToCesium(viewer, {
        longitude: 112.77232203811953,
        latitude: 28.061197706159664,
        height: 1000,
      });
    },
  },
  {
    text: "加载高德地图",
    fun: () => {
      mapData.GDImageryProvider = CT.initUrlTemplateCesium(viewer, {
        url: "https://webst{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&style=7",
      });
    },
  },
  {
    text: "删除高德地图",
    fun: () => {
      CT.removeImageryMapCesium(viewer, mapData.GDImageryProvider);
    },
  },
  {
    text: "左击查看经纬度",
    fun: () => {
      // eventLeftClickCesium，eventRightClickCesium，eventCenterClickCesium一样
      // eventMouseMoveCesium 移入移出，返回移入经纬度，二维坐标，移入经纬度 二维坐标
      mapData.LeftHandler = CT.eventLeftClickCesium(viewer, (e) => {
        LngLat.longitude = e.longitude;
        LngLat.latitude = e.latitude;

        mapData.mapModal = CT.addLayerModalCesium(viewer, {
          position: [e.longitude, e.latitude],
          offset: [0, 20],
          domId: "mapModal",
        });
        // alert(
        //   `经度：${e.longitude},纬度：${e.latitude}
        //   二维坐标:x-${e.position.x},y-${e.position.y}`
        // );
      });
    },
  },
  {
    text: "添加广告牌",
    fun: () => {
      mapData.Billboard = CT.addEntityBillboardCesium(
        viewer,
        { image: fill }, //广告牌配置
        { text: "我是广告牌" }, //文字配置
        {
          positions: [-94.2796076843326, 40.47465136950101],
          data: { name: "任意参数", age: "188" },
        } //实体对象配置
      );
      //   任意参数
      console.log(mapData.Billboard.data);
    },
  },
  {
    text: "添加多边形",
    fun: () => {
      mapData.Polygon = CT.addEntityPolygonCesium(viewer, {
        positions: [
          -104.44583395715667, 41.22017373826037, -95.76214386385325,
          41.8553937536503, -94.88829950200348, 35.88038223987908,
          -103.59556059849743, 35.34628124489838,
        ],
      });
    },
  },
  {
    text: "添加线",
    fun: () => {
      mapData.Line = CT.addEntityLineCesium(viewer, {
        positions: [
          -106.40886526265746, 37.67972275221243, -82.28169305307992,
          32.43268260385166, -99.77832896758429, 21.32940323740564,
          -85.92307008109772, 12.88555635151695,
        ],
      });
    },
  },
  {
    text: "添加围墙",
    fun: () => {
      mapData.Wall = CT.addEntityWallCesium(viewer, {
        wallImg: wall,
        positions: [
          -104.44583395715667, 41.22017373826037, -95.76214386385325,
          41.8553937536503, -94.88829950200348, 35.88038223987908,
          -103.59556059849743, 35.34628124489838,
        ],
        maximumHeights: 100000,
      });

      console.log(mapData.Wall);
    },
  },
  {
    text: "添加洞多边形",
    fun: () => {
      mapData.PolygonHoles = CT.addEntityPolygonHolesCesium(viewer, {
        material: Cesium.Color.DARKSLATEGRAY.withAlpha(0.8),
        hierarchyPositions: [
          -125.36713999731785, 43.94176698635193, -58.25864950050107,
          55.9704150622827, -55.596694287244475, 24.05842666657082,
          -107.72612752252512, 5.8703131629483165,
        ],
        holesPositions: [
          [
            -106.90106711666269, 41.670009664744704, -97.5850968239922,
            43.056927858600886, -96.45397355407029, 36.83247225217504,
          ],
        ],
      });
    },
  },
  {
    text: "清除图形",
    fun: () => {
      const entityData = [
        mapData.Billboard,
        mapData.Polygon,
        mapData.Line,
        mapData.Wall,
        mapData.PolygonHoles,
      ];
      // CT.removeEntitiesCesium(viewer,mapData.Billboard) //可以传单个  删除单个
      CT.removeEntitiesCesium(viewer, entityData); //也可以传数组 删除多个
      // CT.removeEntitiesCesium(viewer) //可以传空 删除所有
    },
  },
  {
    text: "隐藏图形",
    fun: () => {
      const entityData = [
        mapData.Billboard,
        mapData.Polygon,
        mapData.Line,
        mapData.Wall,
        mapData.PolygonHoles,
      ];
      // CT.hideShowEntitiesCesium(mapData.Billboard,false) //可以传单个  隐藏显示单个
      CT.hideShowEntitiesCesium(entityData, false); //也可以传数组隐藏显示多个
    },
  },
  {
    text: "显示图形",
    fun: () => {
      const entityData = [
        mapData.Billboard,
        mapData.Polygon,
        mapData.Line,
        mapData.Wall,
        mapData.PolygonHoles,
      ];
      // CT.hideShowEntitiesCesium(mapData.Billboard,true) //可以传单个  隐藏显示单个
      CT.hideShowEntitiesCesium(entityData, true); //也可以传数组 隐藏显示多个
    },
  },
  {
    text: "下雨",
    fun: () => {
      mapData.Rain = CT.addPrimitivesRainCesium(viewer, { image: rain });
    },
  },
  {
    text: "下雪",
    fun: () => {
      mapData.Snow = CT.addPrimitivesSnowCesium(viewer, { image: snow });
    },
  },
  {
    text: "清除雨/雪",
    fun: () => {
      CT.removePrimitivesCesium(viewer, [mapData.Snow, mapData.Rain]);
    },
  },
  {
    text: "加载模型",
    fun: () => {
      const monkey = new URL("@/assets/monkey.glb", import.meta.url).href;
      CT.addGLTFModelThree(three, {
        url: monkey,
        set: { x: 500, y: 500, z: 500 },
        position: { x: 0, y: 0, z: 100 },
        rotation: { x: Cesium.Math.PI / 2, y: 0, z: 0 },
        data: { name: "猴子", type: "猴子" },
        minWGS: [112.49906435282986, 28.245222057984655],
        maxWGS: [112.50194276815414, 28.249573397766703],
      }).then((res) => {
        arr3DModal.push(res.data);
        console.log("addGLTFModelThree", res);
        CT.viewerCameraCesium(viewer, {
          longitude: 112.49906435282986,
          latitude: 28.245222057984655,
          height: 5000,
        });
      });
    },
  },
];
const drawList = [
  {
    text: "开始绘图",
    fun: () => {
      draw = new Draw(viewer);
    },
  },
  {
    text: "点",
    fun: () => {
      draw.addEntity("point");
    },
  },
  {
    text: "线",
    fun: () => {
      draw.addEntity("line");
    },
  },
  {
    text: "多边形",
    fun: () => {
      draw.addEntity("polygon");
    },
  },
  {
    text: "圆",
    fun: () => {
      draw.addEntity("circle");
    },
  },
  {
    text: "矩形",
    fun: () => {
      draw.addEntity("rectangle");
    },
  },
  {
    text: "测距",
    fun: () => {
      draw.addEntity("range");
    },
  },
  {
    text: "面积",
    fun: () => {
      draw.addEntity("area");
    },
  },
  {
    text: "导出至控制台",
    fun: () => {
      draw.exportEntities();
    },
  },
  {
    text: "清空绘图",
    fun: () => {
      draw.removeAll();
    },
  },
];

// 加载地图
const initMap = () => {
  const viewerConfig = {
    shouldAnimate: true,
    terrain: false,
  };
  viewer = CT.initCesium("cesium-container", viewerConfig);
};

const init3DThree = () => {
  three = CT.initThree("cesium-container");
};

// 渲染
function loop() {
  requestAnimationFrame(loop);
  CT.renderCesium(viewer);
  CT.renderCameraThreeCesium(three, viewer, "cesium-container", arr3DModal);
}
onMounted(() => {
  initMap();
  init3DThree();
  loop();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
}

#cesium-container,
.container-integrate {
  position: fixed;
  top: 0px;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
#cesium-container > canvas {
  position: absolute;
  top: 0;
  left: 0;
  /* 设置鼠标事件穿透 */
  pointer-events: none;
}
.list-btn {
  position: fixed;
  z-index: 99999999;
}
</style>
