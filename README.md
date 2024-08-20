
# cesium 结合 three使用

封装cesium常用api：初始化，切换视角，添加实体，切换图源等

封装cesium标绘功能：可以在地图动态绘制点，线，面，测距

封装three在cesium上加载模型





## Installation

Install my-project with npm

```bash
  npm install 
```
    
## Deployment

To deploy this project run

```bash
  npm run dev
```


## Screenshots
初始化
![App Screenshot](https://xunjian-1258290170.cos.ap-guangzhou.myqcloud.com/%E6%B1%87%E8%81%9A%E5%B9%B3%E5%8F%B0/%E5%B9%B3%E5%8F%B0%E6%88%AA%E5%9B%BE/CT.png)

模型以及标绘
![App Screenshot](https://xunjian-1258290170.cos.ap-guangzhou.myqcloud.com/%E6%B1%87%E8%81%9A%E5%B9%B3%E5%8F%B0/%E5%B9%B3%E5%8F%B0%E6%88%AA%E5%9B%BE/CT2.png)

## 1.引入库

```
https://github.com/mantoudebaba/cesium-three
npm install 
npm run dev

```

## 2.使用示例* 重点查看本代码

```javascript
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

```

## 3.  initCesium, //加载地图

```javascript
// 加载地图
const initMap = () => {
  const viewerConfig = {
    shouldAnimate: true,
    terrain: false,
  };
  viewer = initCesium("cesium-container", viewerConfig,{Viewer其他配置});
};
```

 ## 4.  initWebMapTileServiceCesium, //加载WebMapTile类型底图
 

```javascript
 initWebMapTileServiceCesium(viewer, {
    url: ",
    layer: "",
    maximumLevel: 18,
  },{WebMapTileServiceImageryProvider其他配置});
```

  ## 5. initUrlTemplateCesium, //加载UrlTemplate类型底图
  

```javascript
CT.initUrlTemplateCesium(viewer, {
        url: "",
      },{UrlTemplateImageryProvider其他配置});
```

 ## 6.  viewerCameraFlyToCesium, //飞跃视角
 

```javascript
 CT.viewerCameraFlyToCesium(viewer, {
        longitude: 11.11,
        latitude: 11.11,
        height: 1000,
      },{flyTo其他配置});
```

 ## 7.  viewerCameraCesium, //切换视角
 

```javascript
 CT.viewerCameraCesium(viewer, {
        longitude: 111.11,
        latitude: 111.11,
      },{setView其他配置});
```

  ## 8. viewerFlyToCesium, //聚焦指定实体
  

```javascript
viewerFlyToCesium(viewer, Point)
```

  
  ## 9. eventLeftClickCesium, //鼠标左键
  

```javascript
eventLeftClickCesium(viewer, (e) => {
        alert(
          `经度：${e.longitude},纬度：${e.latitude}
          二维坐标:x-${e.position.x},y-${e.position.y}`
         );
      });
```

  ## 10. eventRightClickCesium, //鼠标右键
  

```javascript
eventRightClickCesium(viewer, (e) => {
        alert(
          `经度：${e.longitude},纬度：${e.latitude}
          二维坐标:x-${e.position.x},y-${e.position.y}`
         );
      });
```

  ## 11. eventCenterClickCesium, //滚轮
  

```javascript
eventCenterClickCesium(viewer, (e) => {
        alert(
          `经度：${e.longitude},纬度：${e.latitude}
          二维坐标:x-${e.position.x},y-${e.position.y}`
         );
      });
```

  ## 12. eventMouseMoveCesium, //鼠标移入移出
  

```javascript
eventMouseMoveCesium(viewer, (e) => {
  e.startLongitude;
 e.startLongitude;
 e.startPosition.x;
 e.startPosition.y;
  e.endLongitude;
  e.endLatitude;
  e.endPosition.x;
  e.endPosition.y;
      });
```

  ## 13. addEntityBillboardCesium, //添加实体 点
  
**addEntity支持entities所有配置项 规则如下**
所有函数都有entityConfig 选填。
function addEntityBillboardCesium(viewer,billboardConfig,labelConfig,entityConfig = {})
function addEntityPolygonCesium(viewer, polygonConfig, entityConfig = {})
function addEntityLineCesium(viewer, polylineConfig, entityConfig = {})
...
billboardConfig ： { image: "图片地址",**billboardOtherConfig**:{billboard其他配置}}, //广告牌配置
labelConfig：{ text: "我是广告牌" ,**labelOtherConfig**:{label其他配置}}, //文字配置
polygonConfig:{positions: [ 经度，纬度，经度，纬度，经度，纬度],**polygonOtherConfig**:{polygon配置项}}
polylineConfig:{positions: [ 经度，纬度，经度，纬度，经度，纬度],**polylineOtherConfig**:{polyline配置项}}

**entityConfig** ：{ data: { name: "任意参数", age: "188" },**entitiesOtherConfig**:{**entities**其他配置项}}
源码示例

```javascript
/**
 * 添加一个包含图标和标签的广告牌。
 * 
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例
 * @param {Object} billboardConfig - 图标配置对象。
 * @param {string} [billboardConfig.image=null] - 图标的图片 URL 或者路径。
 * @param {number} [billboardConfig.scale=1] - 图标的缩放比例。
 * @param {number[]} [billboardConfig.pixelOffset=[0, 0]] - 图标的像素偏移量 [x, y]。
 * @param {number[]} [billboardConfig.distanceDisplayCondition=[0, 999999999]] - 图标的显示距离条件 [最小距离, 最大距离]。
 * @param {Object} [billboardConfig.billboardOtherConfig={}] - 其他图标相关的配置。
 * 
 * @param {Object} labelConfig - 标签配置对象。
 * @param {string} [labelConfig.text=null] - 标签的文本内容。
 * @param {boolean} [labelConfig.show=Boolean(text)] - 标签是否显示。
 * @param {number} [labelConfig.scale=1] - 标签的缩放比例。
 * @param {string} [labelConfig.fillColor="RED"] - 标签文本的填充颜色（Cesium.Color 的有效颜色名）。
 * @param {string} [labelConfig.backgroundColor="BLUE"] - 标签背景色（Cesium.Color 的有效颜色名）。
 * @param {number[]} [labelConfig.pixelOffset=[0, 0]] - 标签的像素偏移量 [x, y]。
 * @param {number[]} [labelConfig.distanceDisplayCondition=[0, 999999999]] - 标签的显示距离条件 [最小距离, 最大距离]。
 * @param {Object} [labelConfig.labelOtherConfig={}] - 其他标签相关的配置。
 * 
 * @param {Object} entityConfig - 实体配置对象。
 * @param {string} [entityConfig.name=null] - 实体的名称。
 * @param {Object} [entityConfig.data={}] - 实体的附加数据。
 * @param {number[]} [entityConfig.positions=null] - 实体的位置坐标 [经度, 纬度]。必须有至少两个值。
 * @param {Object} [entityConfig.entitiesOtherConfig={}] - 其他实体相关的配置。
 * 
 * @returns {Cesium.Entity} 返回创建的 Cesium 实体对象。
 * @see {@link https://cesium.com/learn/cesiumjs/ref-doc/Entity.html?classFilter=Entity|Cesium Entity 文档}
 
 * 
 * @throws {Error} 如果 positions 不存在或者长度小于 2，将抛出错误。
 * 
 * @example
 * addEntityPointCesium(
 *   viewer,
 *   {
 *     image: 'image.png',
 *     scale: 1.5,
 *     pixelOffset: [10, 10],
 *     distanceDisplayCondition: [100, 1000],
 *     billboardOtherConfig: { ... }
 *   },
 *   {
 *     text: 'Sample Label',
 *     show: false,
 *     scale: 1.2,
 *     fillColor: 'WHITE',
 *     backgroundColor: 'BLACK',
 *     pixelOffset: [5, 5],
 *     distanceDisplayCondition: [50, 500],
 *     labelOtherConfig: { ... }
 *   },
 *   {
 *     name: 'Sample Entity',
 *     data: { someData: 'value' },
 *     positions: [120.0, 30.0],
 *     entitiesOtherConfig: { ... }
 *   }
 * );
 * 
 */
function addEntityBillboardCesium(
  viewer,
  billboardConfig,
  labelConfig,
  entityConfig = {}
) {
  // 常用配置
  const {
    image = null,
    scale: billboardScale = 1,
    pixelOffset = [0, 0],
    distanceDisplayCondition = [0, 999999999],
    billboardOtherConfig, //不常用配置
  } = billboardConfig;
  // 常用配置
  const {
    name = null,
    data = {},
    positions = null, // [经度，纬度]
    entitiesOtherConfig, //不常用配置
  } = entityConfig;
  // 常用配置
  const {
    text = null,
    show = Boolean(text),
    scale: labelScale = 1,
    fillColor = "WHITE",
    backgroundColor = "BLUE",
    pixelOffset: labelPixelOffset = [0, 0],
    distanceDisplayCondition: labeldistanceDisplayCondition = [0, 999999999],
    labelOtherConfig, //不常用配置
  } = labelConfig;

  if (!positions || positions.length < 1) {
    throw new Error("必须输入经纬度");
  }
  if (typeof positions[0] == "string" || typeof positions[1] == "string") {
    positions[0] = Number(positions[0]);
    positions[1] = Number(positions[1]);
  }
  // 实体
  const entityData = viewer.entities.add({
    name,
    data,
    position: Cartesian3.fromDegrees(positions[0], positions[1]),
    billboard: {
      image,
      heightReference: HeightReference.CLAMP_TO_GROUND,
      scale: billboardScale,
      // 平面 x，y的偏移
      pixelOffset: new Cartesian2(pixelOffset[0], pixelOffset[1]),
      // 在高度多少以内显示  最小-最大
      distanceDisplayCondition: new DistanceDisplayCondition(
        distanceDisplayCondition[0],
        distanceDisplayCondition[1]
      ),
      ...billboardOtherConfig,
    },
    label: {
      show,
      text,
      scale: labelScale,
      heightReference: HeightReference.CLAMP_TO_GROUND,
      fillColor: Color[fillColor],
      showBackground: Boolean(backgroundColor),
      backgroundColor: Color[backgroundColor],
      // 平面 x，y的偏移
      pixelOffset: new Cartesian2(labelPixelOffset[0], labelPixelOffset[1]),
      // 在高度多少以内显示  最小-最大
      distanceDisplayCondition: new DistanceDisplayCondition(
        labeldistanceDisplayCondition[0],
        labeldistanceDisplayCondition[1]
      ),
      ...labelOtherConfig,
    },
    ...entitiesOtherConfig,
  });

  return entityData;
}
```

```javascript
addEntityBillboardCesium(
        viewer,
        { image: "图片地址",billboardOtherConfig:{billboard其他配置}}, //广告牌配置
        { text: "我是广告牌" ,labelOtherConfig:{label其他配置}}, //文字配置
        {
          positions: [经度, 纬度],
          data: { name: "任意参数", age: "188" },
          entitiesOtherConfig:{entities其他配置项}
        } //实体对象配置
      );
```

  ## 14. addEntityPolygonCesium, //添加实体 多边形
  

```javascript
addEntityPolygonCesium(viewer, {positions: [ 经度，纬度，经度，纬度，经度，纬度]});
```

  ## 15. addEntityLineCesium, //添加实体 线
  

```javascript

addEntityLineCesium(viewer, {positions: [经度，纬度，经度，纬度，经度，纬度]});
```

  ## 16. addEntityWallCesium, //添加实体 围墙
  

```javascript
addEntityWallCesium(viewer, {
        wallImg: "图片",
        positions: [经度，纬度，经度，纬度，经度，纬度],
       });
```

  ## 17. addEntityPolygonHolesCesium, //添加实体 带洞多边形
  

```javascript
addEntityPolygonHolesCesium(viewer, {
        material: Cesium.Color.DARKSLATEGRAY.withAlpha(0.8),
        hierarchyPositions: [
         经度，纬度，经度，纬度，经度，纬度
        ],
        holesPositions: [
          [
           经度，纬度，经度，纬度，经度，纬度
          ],
           [
           经度，纬度，经度，纬度，经度，纬度
          ],
        ],
      });
```

  ## 18. getEntityByPosition, //根据二维坐标获取地图上的实体
  

```javascript
   eventLeftClickCesium(viewer, (e) => {
   		const entity = getEntityByPosition(viewer,e.position);
   });
```

  ## 19. addPrimitiveWarterCesium, //添加增加水流材质
  

```javascript
/**
 * 增加水流材质
 * @param {Viewer} viewer  - 视图对象
 * @param {Object} config - 配置对象，用于定义水流材质的属性。
 * @param {Array<number>} config.polygonPosition - 多边形顶点的经纬度数组，格式为 [经度1, 纬度1, 经度2, 纬度2, ...]。
 * @param {Color} [config.uniformsBaseWaterColor=new Color(151 / 255.0, 201 / 255.0, 185 / 255.0, 0.8)] - 水的基础颜色。
 * @param {string} config.uniformsNormalMap - 水流的法线贴图。
 * @param {number} [config.uniformsFrequency=500.0] - 水流的频率。
 * @param {number} [config.uniformsAnimationSpeed=0.01] - 水流的动画速度。
 * @param {number} [config.uniformsAmplitude=10.0] - 水流的振幅。
 * @param {Object} [config.uniformsOtherConfig] - 其他自定义的 uniform 配置。
 * @returns {Primitive} - 返回一个包含指定配置的 `Primitive` 对象。
 * @see {@link https://cesium.com/learn/cesiumjs/ref-doc/Material.html?classFilter=Material|Cesium 材质 文档}
 */
function addPrimitiveWarterCesium(viewer, config){代码}
使用
addPrimitiveWarterCesium(viewer,{polygonPosition:[ 经度，纬度，经度，纬度，经度，纬度],uniformsNormalMap:"图片"})

```

  ## 20. addPrimitivesRainCesium, // 添加下雨
  

```javascript
addPrimitivesRainCesium(viewer, { image: "图片",size:1});
```

  ## 21. addPrimitivesSnowCesium, //添加下雪
  

```javascript
addPrimitivesSnowCesium(viewer, { image: "图片",size:1});
```

  ## 22. addLayerModalCesium, //添加弹窗
  

```javascript
const LayerModal = addLayerModalCesium(viewer, {
          position: [longitude, latitude],
          offset: [0, 20],
          domId: "mapModal",
});
```

  ## 23. removeLayerModalCesium, //删除弹窗
  LayerModal 由 addLayerModalCesium（）返回

```javascript
removeLayerModalCesium(LayerModal );//可以传单个  删除单个
removeLayerModalCesium([LayerModal1,LayerModal2]); //也可以传数组 删除多个
```

  ## 24. removeEntitiesCesium, //删除实体
  
entity  由  **addEntity**xxx（）返回
```javascript

removeEntitiesCesium(viewer,entity) //可以传单个  删除单个
removeEntitiesCesium(viewer, [entity1,entity2,entity3]); //也可以传数组 删除多个
removeEntitiesCesium(viewer) //可以传空 删除所有
```

 ## 25.  removeImageryMapCesium, //删除地图其他底图对象
 
ImageryProvider由 initWebMapTileServiceCesium(), initUrlTemplateCesium(),返回
```javascript
removeImageryMapCesium(viewer, ImageryProvider); //可以传单个  删除单个
removeImageryMapCesium(viewer, [ImageryProvider1,ImageryProvider2]);//也可以传数组 删除多个
removeImageryMapCesium(viewer);//可以传空 删除所有
```

  ## 26. removePrimitivesCesium, //删除动态效果 如下雨 河流
  primitive 由 addPrimitivexxx()返回

```javascript
removePrimitivesCesium(viewer,primitive); //可以传单个  删除单个
removePrimitivesCesium(viewer,[primitive1,primitive2,primitive3]);//也可以传数组 删除多个
removePrimitivesCesium(viewer);//可以传空 删除所有
```

  ## 27. hideShowEntitiesCesium, //显示或者隐藏实体对象
  
entity  由  **addEntity**xxx（）返回
```javascript
hideShowEntitiesCesium([entity1,entity2,entity3], false); //数组隐藏显示多个  通过第二个参数显示隐藏
hideShowEntitiesCesium(entity, true); //可以传单个
```

  ## 28. hideShowLayerModalCesium, //显示或者隐藏弹窗
    LayerModal 由 addLayerModalCesium（）返回

```javascript
hideShowLayerModalCesium([LayerModal1 ,LayerModal2 ,LayerModal3 ], false); //数组隐藏显示多个  通过第二个参数显示隐藏
hideShowLayerModalCesium(LayerModal, true); //可以传单个
```

  ## 29. GeoJsonDataSourceCesium, //获取genjson文件
  

```javascript
GeoJsonDataSourceCesium("genjson",{ GeoJsonDataSource.load:其他配置})
```

  ## 30. GeoJsonLocaToPositionsCesium, //把本地genjson文件 整理为【经，纬度】
  

```javascript
GeoJsonLocaToPositionsCesium("genjson")
```

  ## 31. renderCesium, //渲染
  

```javascript
renderCesium(viewer)
```

 ## 32.  initThree, //初始化3D场景
 

```javascript
initThree("domID");
```

  ## 33. addSpriteMaterialThree, //增加精灵模型
  

```javascript
忘记写了
```

  ## 34. addGLTFModelThree, //增加模型
  

```javascript
      const monkey = new URL("@/assets/monkey.glb", import.meta.url).href;
  addGLTFModelThree(three, {
        url: monkey,
        set: { x: 500, y: 500, z: 500 },
        position: { x: 0, y: 0, z: 100 },
        rotation: { x: Cesium.Math.PI / 2, y: 0, z: 0 },
        data: { name: "猴子", type: "猴子" },
        minWGS: [经度, 纬度],
        maxWGS: [经度, 纬度],
      }).then((res) => {
       arr3DModal.push(res.data);
       viewerCameraCesium(viewer, {
          longitude: 经度 ,
          latitude: 纬度,
          height: 5000,
        });
      });
```

  ## 35. renderCameraThreeCesium, //视角同步

```javascript
renderCameraThreeCesium(three, viewer, "domID", arr3DModal);
```
## 36. 渲染

```javascript
// 渲染
function loop() {
  requestAnimationFrame(loop);
  renderCesium(viewer);
  renderCameraThreeCesium(three, viewer, "domID", arr3DModal);
}
```

