/*
 * @Author: LXL
 * @Date: 2024-07-05 11:21:22
 * @LastEditTime: 2024-08-19 15:44:59
 * @Description: cesium和three封装使用
 * @FastButton: ctrl+win+i, ctrl+win+t
 */
import {
  Ion,
  Viewer,
  Terrain,
  WebMapTileServiceImageryProvider,
  UrlTemplateImageryProvider,
  Credit,
  Cartesian3,
  Cartesian2,
  Math as CesiumMath,
  EasingFunction,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
  HeightReference,
  DistanceDisplayCondition,
  Color,
  ImageMaterialProperty,
  Matrix4,
  SphereEmitter,
  ParticleSystem,
  Material,
  PolygonGeometry,
  PolygonHierarchy,
  Primitive,
  GeometryInstance,
  EllipsoidSurfaceAppearance,
  GeoJsonDataSource,
  HeadingPitchRange,
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import divLabel from "./div-label.js";
// three
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// 配置你的秘钥
Ion.defaultAccessToken = "";
window.CESIUM_BASE_URL = "./CesiumUnminified/";
/**
 * 初始化 Cesium 地图视图。
 *
 * @param {string} domId - 挂载地图的 div 元素的 ID。
 * @param {Object} [viewerConfig={}] - Cesium Viewer 常用的配置选项。
 * @param {boolean} [viewerConfig.shouldAnimate=true] - 是否启用动画。
 * @param {boolean} [viewerConfig.terrain=false] - 是否启用 3D 地形。
 * @param {...Object} otherConfigs - Viewer其他附加的配置对象。
 * @returns {Viewer} - 返回初始化后的 Cesium Viewer 实例。
 * @throws {Error} 如果 domId 为空或不是字符串。
 * @see {@link https://cesium.com/learn/cesiumjs/ref-doc/Viewer.html?classFilter=Viewer|Cesium Viewer 文档}
 * @example
 * const viewerConfig = {
 *   shouldAnimate: true,
 *   terrain: true,
 * };
 * const otherConfig = {
 *   timeline: false,
 * };
 * const otherConfig2 = {
 *   animation: false
 * };
 * const viewer = initCesium('cesiumContainer', viewerConfig, otherConfig,otherConfig2);
 */
function initCesium(domId, viewerConfig = {}, ...otherConfigs) {
  if (!domId) {
    throw new Error("domId 不能为空");
  }
  if (typeof domId !== "string") {
    throw new Error("domId 必须是字符串类型");
  }

  const {
    shouldAnimate = true, // 是否加载动画
    terrain = false, // 是否启用 3D 地形
  } = viewerConfig;
  // 合并所有其他配置
  const mergedConfig = Object.assign({}, ...otherConfigs);
  // 初始化视图
  const viewer = new Viewer(domId, {
    shouldAnimate, // 是否加载动画
    terrainProvider: terrain ? Terrain.fromWorldTerrain() : null, // 3D 地形
    ...mergedConfig, // 合并其他配置
  });

  return viewer;
}

/**
 * 加载 WebMapTile 类型地图
 *
 * @param {Viewer} viewer - Viewer实例
 * @param {Object} config - 配置对象。 初始化后的 Cesium Viewer
 * @param {string} config.url - 瓦片地图服务的 URL。
 * @param {string} [config.layer="map"] - 图层名称。
 * @param {string} [config.style="default"] - 样式名称。
 * @param {string} [config.format="image/jpeg"] - 瓦片格式。
 * @param {string} [config.tileMatrixSetID="default028mm"] - 瓦片矩阵集 ID。
 * @param {number} [config.maximumLevel=24] - 最大缩放级别。
 * @param {string} [config.credit="U. S. Geological Survey"] - 版权声明。
 * @param {...Object} [otherConfigs] - 其他附加配置对象。
 * @returns {WebMapTileServiceImageryProvider} - 返回 WebMapTileServiceImageryProvider 对象。
 * @throws {Error} 如果缺少必需的 url 参数。
 * @see {@link https://cesium.com/learn/cesiumjs/ref-doc/WebMapTileServiceImageryProvider.html?classFilter=WebMapTileServiceImageryProvider|Cesium WebMapTileServiceImageryProvider 文档}
 * @example
 * const config = {
 *   url: 'https://example.com/wmts',
 *   layer: 'exampleLayer',
 *   style: 'default',
 *   format: 'image/png',
 *   tileMatrixSetID: 'EPSG:3857',
 *   maximumLevel: 19,
 *   credit: 'Example Credit'
 * };
 * const imageryProvider = initWebMapTileServiceCesium(viewer,config, { someOtherConfig: true });
 */
function initWebMapTileServiceCesium(viewer, config, ...otherConfigs) {
  const {
    url,
    layer = "map",
    style = "default",
    format = "image/jpeg",
    tileMatrixSetID = "default028mm",
    maximumLevel = 24,
    credit = "U. S. Geological Survey",
  } = config;

  if (!url) {
    throw new Error("参数不全");
  }

  // 合并所有其他配置
  const mergedConfig = Object.assign({}, ...otherConfigs);

  // 瓦片对象
  const imageryProvider = new WebMapTileServiceImageryProvider({
    url,
    layer,
    style,
    format,
    tileMatrixSetID,
    maximumLevel,
    credit: new Credit(credit),
    ...mergedConfig,
  });

  return viewer.imageryLayers.addImageryProvider(imageryProvider);
}

/**
 * 加载 UrlTemplate 类型的地图
 * @param {Viewer} viewer - Viewer实例
 * @param {Object} config - 配置对象。
 * @param {string} config.url - 瓦片地图服务的 URL 模板。
 * @param {number} [config.maximumLevel=24] - 最大缩放级别。
 * @param {string[]} [config.subdomains=["01"]] - 瓦片地图服务的子域名。
 * @param {...Object} [otherConfigs] - 其他附加配置对象。
 * @returns {UrlTemplateImageryProvider} - 返回 UrlTemplateImageryProvider 对象。
 * @see {@link https://cesium.com/learn/cesiumjs/ref-doc/Viewer.html?classFilter=UrlTemplateImageryProvider|Cesium UrlTemplateImageryProvider 文档}
 * @example
 * const config = {
 *   url: 'https://example.com/tiles/{z}/{x}/{y}.png',
 *   maximumLevel: 18,
 *   subdomains: ['a', 'b', 'c']
 * };
 * const imageryProvider = initUrlTemplateCesium(viewer,config, { someOtherConfig: true });
 */
function initUrlTemplateCesium(viewer, config, ...otherConfigs) {
  const { url, maximumLevel = 24, subdomains = ["01"] } = config;

  if (!url) {
    throw new Error("url 参数不能为空");
  }

  // 合并所有其他配置
  const mergedConfig = Object.assign({}, ...otherConfigs);

  // 瓦片对象
  const imageryProvider = new UrlTemplateImageryProvider({
    url, // 添加高德卫星影像
    maximumLevel,
    subdomains, //多域名请求
    ...mergedConfig,
  });

  return viewer.imageryLayers.addImageryProvider(imageryProvider);
}

/**
 * 切换相机的视角
 *
 * @param {Viewer} viewer - Viewer实例
 * @param {Object} config - 配置对象
 * @param {number|string} config.longitude - 经度
 * @param {number|string} config.latitude - 纬度
 * @param {number|string} [config.height=10000] - 离地高度
 * @param {number|string} [config.heading=0] - 获取相机的航向角（东向为正）
 * @param {number|string} [config.pitch=-90] - 获取相机的俯仰角（上为正）
 * @param {number|string} [config.roll=0] - 获取相机的翻滚角（顺时针为正）
 * @param {...Object} [otherConfigs] - 其他附加配置对象。
 * @see {@link https://cesium.com/learn/cesiumjs/ref-doc/Camera.html?classFilter=camera|Cesium Camera 文档}
 * @example
 * viewerCameraCesium(viewer,{longitude:110.110,latitude:28.28})
 */
function viewerCameraCesium(viewer, config, ...otherConfigs) {
  const {
    longitude,
    latitude,
    height = 10000,
    heading = 0,
    pitch = -90,
    roll = 0,
  } = config;
  let center = Cartesian3.fromDegrees(longitude, latitude, height);
  // 合并所有其他配置
  const mergedConfig = Object.assign({}, ...otherConfigs);
  viewer.camera.setView({
    destination: center,
    orientation: {
      heading: CesiumMath.toRadians(heading),
      pitch: CesiumMath.toRadians(pitch),
      roll: CesiumMath.toRadians(roll),
    },
    ...mergedConfig,
  });
}
/**
 * 飞跃切换相机的视角效果
 *
 * @param {Viewer} viewer - Viewer实例
 * @param {Object} config - 配置对象
 * @param {number|string} config.longitude - 经度
 * @param {number|string} config.latitude - 纬度
 * @param {number|string} [config.height=10000] - 离地高度
 * @param {number|string} [config.heading=0] - 获取相机的航向角（东向为正）
 * @param {number|string} [config.pitch=-90] - 获取相机的俯仰角（上为正）
 * @param {number|string} [config.roll=0] - 获取相机的翻滚角（顺时针为正）
 * @param {number|string} [config.duration=3] - 飞跃视角所需时间
 * @param {Boolean} [config.easing=false] - 线性无缓动
 * @param {...Object} [otherConfigs] - 其他附加配置对象。
 * @see {@link https://cesium.com/learn/cesiumjs/ref-doc/Camera.html?classFilter=camera|Cesium Camera 文档}
 * @example
 * viewerCameraFlyToCesium(viewer,{longitude:110.110,latitude:28.28})
 */
function viewerCameraFlyToCesium(viewer, config, ...otherConfigs) {
  let {
    longitude,
    latitude,
    height = 100000,
    heading = 0,
    pitch = -90,
    roll = 0,
    duration = 3,
    easing = false,
  } = config;
  if (typeof longitude == "string" || typeof latitude == "string") {
    longitude = Number(longitude);
    latitude = Number(latitude);
  }
  // 笛卡尔坐标
  let center = Cartesian3.fromDegrees(longitude, latitude, height);
  // 合并所有其他配置
  const mergedConfig = Object.assign({}, ...otherConfigs);
  // 视角飞跃
  viewer.camera.flyTo({
    destination: center,
    orientation: {
      heading: CesiumMath.toRadians(heading),
      pitch: CesiumMath.toRadians(pitch),
      roll: CesiumMath.toRadians(roll),
    },
    duration,
    easingFunction: easing ? EasingFunction.LINEAR_NONE : null, // 线性无缓动
    ...mergedConfig,
  });
}

function viewerFlyToCesium(viewer, entity, config = {}) {
  const { height = 2000 } = config;
  // 添加按钮点击事件，飞跃到实体
  viewer.flyTo(entity, {
    duration: 3.0, // 飞行持续时间，单位为秒
    offset: new HeadingPitchRange(
      CesiumMath.toRadians(0), // 方向
      CesiumMath.toRadians(-80), // 俯仰角
      height // 距离，单位为米
    ),
  });
}
/**
 * 鼠标左键事件
 * @param {Viewer} viewer - Cesium Viewer 实例
 * @param {Function} fun - 点击回调函数，接收一个包含经纬度和像素坐标的对象
 * @returns {ScreenSpaceEventHandler} - 返回事件处理器实例，便于移除监听器
 * @see {@link https://cesium.com/learn/cesiumjs/ref-doc/ScreenSpaceEventHandler.html?classFilter=ScreenSpaceEventHandlera|Cesium ScreenSpaceEventHandler 文档}
 * @example
 * eventLeftClickCesium(viewer,(e)=>{
 * e.longitude;
 * e.latitude;
 * e.position.x;
 * e.position.y;
 * })
 */
function eventLeftClickCesium(viewer, fun) {
  const data = {
    longitude: null,
    latitude: null,
    position: { x: null, y: null },
  };
  // 地图点击事件
  var handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function (e) {
    const { x, y } = e.position;
    data.position.x = x;
    data.position.y = y;

    // 点击到了地图上面 有效点击 经纬度
    var pickedPosition = viewer.camera.pickEllipsoid(e.position);
    if (defined(pickedPosition)) {
      // 将屏幕坐标转换为笛卡尔坐标，然后转换为经纬度
      var cartesian =
        viewer.scene.globe.ellipsoid.cartesianToCartographic(pickedPosition);
      data.longitude = CesiumMath.toDegrees(cartesian.longitude);
      data.latitude = CesiumMath.toDegrees(cartesian.latitude);
      console.log("您点击的经纬度", data.longitude, data.latitude);
    } else {
      data.longitude = null;
      data.latitude = null;
      console.log("点击位置不在地球表面上");
    }
    // 执行函数
    fun(data);
  }, ScreenSpaceEventType.LEFT_CLICK);
  // 可选：返回handler，以便在需要时能够移除事件监听器
  return handler;
}
/**
 * 鼠标右键事件
 * @param {Viewer} viewer - Cesium Viewer 实例
 * @param {Function} fun - 点击回调函数，接收一个包含经纬度和像素坐标的对象
 * @returns {ScreenSpaceEventHandler} - 返回事件处理器实例，便于移除监听器
 * @see {@link https://cesium.com/learn/cesiumjs/ref-doc/ScreenSpaceEventHandler.html?classFilter=ScreenSpaceEventHandlera|Cesium ScreenSpaceEventHandler 文档}
 * @example
 * eventRightClickCesium(viewer,(e)=>{
 * e.longitude;
 * e.latitude;
 * e.position.x;
 * e.position.y;
 * })
 */
function eventRightClickCesium(viewer, fun) {
  const data = {
    longitude: null,
    latitude: null,
    position: { x: null, y: null },
  };
  // 地图点击事件
  var handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function (e) {
    const { x, y } = e.position;
    data.position.x = x;
    data.position.y = y;

    // 点击到了地图上面 有效点击 经纬度
    var pickedPosition = viewer.camera.pickEllipsoid(e.position);
    if (defined(pickedPosition)) {
      // 将屏幕坐标转换为笛卡尔坐标，然后转换为经纬度
      var cartesian =
        viewer.scene.globe.ellipsoid.cartesianToCartographic(pickedPosition);
      data.longitude = CesiumMath.toDegrees(cartesian.longitude);
      data.latitude = CesiumMath.toDegrees(cartesian.latitude);
      console.log("您点击的经纬度", data.longitude, data.latitude);
    } else {
      data.longitude = null;
      data.latitude = null;
      console.log("点击位置不在地球表面上");
    }
    // 执行函数
    fun(data);
  }, ScreenSpaceEventType.RIGHT_CLICK);
  // 可选：返回handler，以便在需要时能够移除事件监听器
  return handler;
}
/**
 * 鼠标滚轮点击事件
 * @param {Viewer} viewer - Cesium Viewer 实例
 * @param {Function} fun - 点击回调函数，接收一个包含经纬度和像素坐标的对象
 * @returns {ScreenSpaceEventHandler} - 返回事件处理器实例，便于移除监听器
 * @see {@link https://cesium.com/learn/cesiumjs/ref-doc/ScreenSpaceEventHandler.html?classFilter=ScreenSpaceEventHandlera|Cesium ScreenSpaceEventHandler 文档}
 * @example
 * eventCenterClickCesium(viewer,(e)=>{
 * e.longitude;
 * e.latitude;
 * e.position.x;
 * e.position.y;
 * })
 */
function eventCenterClickCesium(viewer, fun) {
  const data = {
    longitude: null,
    latitude: null,
    position: { x: null, y: null },
  };
  // 地图点击事件
  var handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function (e) {
    const { x, y } = e.position;
    data.position.x = x;
    data.position.y = y;

    // 点击到了地图上面 有效点击 经纬度
    var pickedPosition = viewer.camera.pickEllipsoid(e.position);
    if (defined(pickedPosition)) {
      // 将屏幕坐标转换为笛卡尔坐标，然后转换为经纬度
      var cartesian =
        viewer.scene.globe.ellipsoid.cartesianToCartographic(pickedPosition);
      data.longitude = CesiumMath.toDegrees(cartesian.longitude);
      data.latitude = CesiumMath.toDegrees(cartesian.latitude);
      console.log("您点击的经纬度", data.longitude, data.latitude);
    } else {
      data.longitude = null;
      data.latitude = null;
      console.log("点击位置不在地球表面上");
    }
    // 执行函数
    fun(data);
  }, ScreenSpaceEventType.MIDDLE_DOWN);
  // 可选：返回handler，以便在需要时能够移除事件监听器
  return handler;
}
/**
 * 鼠标移入移出事件
 * @param {Viewer} viewer - Cesium Viewer 实例
 * @param {Function} fun - 点击回调函数，接收一个包含经纬度和像素坐标的对象
 * @returns {ScreenSpaceEventHandler} - 返回事件处理器实例，便于移除监听器
 * @see {@link https://cesium.com/learn/cesiumjs/ref-doc/ScreenSpaceEventHandler.html?classFilter=ScreenSpaceEventHandlera|Cesium ScreenSpaceEventHandler 文档}
 * @example
 * eventMouseMoveCesium(viewer,(e)=>{
 * e.startLongitude;
 * e.startLongitude;
 * e.startPosition.x;
 * e.startPosition.y;
 * e.endLongitude;
 * e.endLatitude;
 * e.endPosition.x;
 * e.endPosition.y;
 * })
 */
function eventMouseMoveCesium(viewer, fun) {
  const data = {
    startPosition: { x: null, y: null },
    endPosition: { x: null, y: null },
    startLongitude: null,
    startLatitude: null,
    endLongitude: null,
    endLatitude: null,
  };
  // 地图点击事件
  var handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function (e) {
    // 二维坐标复制
    const { x: startX, y: startY } = e.startPosition;
    const { x: endX, y: endY } = e.endPosition;
    data.startPosition.x = startX;
    data.startPosition.y = startY;
    data.endPosition.x = endX;
    data.endPosition.y = endY;
    // 获取经纬度

    //移入坐标
    var pickedStartPosition = viewer.camera.pickEllipsoid(e.startPosition);
    if (defined(pickedStartPosition)) {
      // 将屏幕坐标转换为笛卡尔坐标，然后转换为经纬度
      const cartesian =
        viewer.scene.globe.ellipsoid.cartesianToCartographic(
          pickedStartPosition
        );
      data.startLongitude = CesiumMath.toDegrees(cartesian.longitude);
      data.startLatitude = CesiumMath.toDegrees(cartesian.latitude);
      console.log("您移入的经纬度", data.longitude, data.latitude);
    } else {
      data.startLongitude = null;
      data.startLatitude = null;
      console.log("您移入的经纬度不在地面上");
    }

    //移出坐标
    var pickedEndPosition = viewer.camera.pickEllipsoid(e.endPosition);
    if (defined(pickedEndPosition)) {
      // 将屏幕坐标转换为笛卡尔坐标，然后转换为经纬度
      const cartesian =
        viewer.scene.globe.ellipsoid.cartesianToCartographic(pickedEndPosition);
      data.endLongitude = CesiumMath.toDegrees(cartesian.longitude);
      data.endLatitude = CesiumMath.toDegrees(cartesian.latitude);
      console.log("您移出的经纬度", data.longitude, data.latitude);
    } else {
      data.endLongitude = null;
      data.endLatitude = null;
      console.log("您移出的经纬度不在地面上");
    }
    // 执行函数
    fun(data);
  }, ScreenSpaceEventType.MOUSE_MOVE);
  // 可选：返回handler，以便在需要时能够移除事件监听器
  return handler;
}

/**
 * 添加一个包含图标和标签的 Cesium Point点 实体。
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

/**
 * 添加一个包含多边形的 Cesium 实体。
 *
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例，用于添加实体。
 * @param {Object} polygonConfig - 多边形配置对象。
 * @param {Material} polygonConfig.material - 多边形的填充颜色（Cesium.Color 中 的有效颜色名）。
 * @param {number[]} polygonConfig.positions - 多边形的顶点坐标数组 [经度, 纬度, 经度, 纬度]。
 * @param {Object} [polygonConfig.polygonOtherConfig={}] - 其他多边形相关的配置。
 * @param {Object} entityConfig - 实体配置对象。
 * @param {string} [entityConfig.name=null] - 实体的名称。
 * @param {Object} [entityConfig.data={}] - 实体的附加数据。
 * @param {Object} [entityConfig.entitiesOtherConfig={}] - 其他实体相关的配置。
 *
 * @returns {Cesium.Entity} 返回创建的 Cesium 实体对象。
 * @see {@link https://cesium.com/learn/cesiumjs/ref-doc/Entity.html?classFilter=Entity|Cesium Entity 文档}
 * @example
 * addEntityPolygonCesium(viewer, {
 *   color: 'RED',
 *   positions: [120.0, 30.0, 121.0, 31.0],
 *   polygonOtherConfig: { ... }
 * }, {
 *   name: 'Sample Polygon',
 *   data: { someData: 'value' },
 *   entitiesOtherConfig: { ... }
 * });
 *
 *
 *
 */
function addEntityPolygonCesium(viewer, polygonConfig, entityConfig = {}) {
  const { name = null, data = {}, entitiesOtherConfig } = entityConfig;
  let {
    material = Color.RED,
    positions, //[经度，纬度，经度，纬度]
    polygonOtherConfig,
  } = polygonConfig;
  if (!positions || positions.length < 1) {
    throw new Error("必须输入经纬度");
  }
  positions.forEach((item, index) => {
    if (typeof item == "string") positions[index] = Number(item);
  });
  // 实体
  const entityData = viewer.entities.add({
    name,
    polygon: {
      hierarchy: Cartesian3.fromDegreesArray(positions),
      material: material,
      ...polygonOtherConfig,
    },
    data,
    ...entitiesOtherConfig,
  });
  return entityData;
}

/**
 * 添加一个包含线条的 Cesium 实体。
 *
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例，用于添加实体。
 * @param {Object} polylineConfig - 线条配置对象。
 * @param {number[]} polylineConfig.positions - 线条的顶点坐标数组 [经度, 纬度, 经度, 纬度]。
 * @param {string} [polylineConfig.color='RED'] - 线条的颜色（Cesium.Color 的有效颜色名）。
 * @param {number} [polylineConfig.width=2] - 线条的宽度。
 * @param {Object} [polylineConfig.polylineOtherConfig={}] - 其他线条相关的配置。
 * @param {Object} entityConfig - 实体配置对象。
 * @param {string} [entityConfig.name=null] - 实体的名称。
 * @param {Object} [entityConfig.data={}] - 实体的附加数据。
 * @param {Object} [entityConfig.entitiesOtherConfig={}] - 其他实体相关的配置。
 *
 * @returns {Cesium.Entity} 返回创建的 Cesium 实体对象。
 * @see {@link https://cesium.com/learn/cesiumjs/ref-doc/PointGraphics.html |Cesium PointGraphics 文档}
 * @example
 * addEntityLineCesium(viewer, {
 *   positions: [120.0, 30.0, 121.0, 31.0],
 *   color: 'BLUE',
 *   width: 3,
 *   polylineOtherConfig: { ... }
 * }, {
 *   name: 'Sample Line',
 *   data: { someData: 'value' },
 *   entitiesOtherConfig: { ... }
 * });
 *
 */
function addEntityLineCesium(viewer, polylineConfig, entityConfig = {}) {
  let {
    positions,
    color = "RED",
    width = 2,
    polylineOtherConfig,
  } = polylineConfig;
  const { name = null, data = {}, entitiesOtherConfig } = entityConfig;
  if (!positions || positions.length < 1) {
    throw new Error("必须输入经纬度");
  }

  positions.forEach((item, index) => {
    if (typeof item == "string") positions[index] = Number(item);
  });

  // 实体
  const entityData = viewer.entities.add({
    name: name,
    polyline: {
      width,
      positions: Cartesian3.fromDegreesArray(positions),
      material: Color[color],
      ...polylineOtherConfig,
    },
    data,
    ...entitiesOtherConfig,
  });
  return entityData;
}

/**
 * 创建一个围墙并添加到 Cesium 视图中。
 *
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例，用于添加实体。
 * @param {Object} wallConfig - 围墙配置对象。
 * @param {string} wallConfig.wallImg - 围墙材质图片的 URL 或路径。
 * @param {number[]} wallConfig.positions - 围墙的顶点坐标数组 [经度, 纬度, 经度, 纬度]。
 * @param {number[]} [wallConfig.distanceDisplayCondition=[0, 999999999]] - 围墙的显示距离条件 [最小距离, 最大距离]。
 * @param {number} [wallConfig.maximumHeights=100] - 围墙的最大高度。
 * @param {number} [wallConfig.minimumHeights=0.0] - 围墙的最小高度。
 * @param {Object} [wallConfig.wallOtherConfig={}] - 其他围墙相关的配置。
 * @param {Object} entityConfig - 实体配置对象。
 * @param {string} [entityConfig.name=''] - 实体的名称。
 * @param {Object} [entityConfig.entityOtherConfig={}] - 其他实体相关的配置。
 *
 * @returns {Cesium.Entity} 返回创建的 Cesium 实体对象。
 * @see {@link https://cesium.com/learn/cesiumjs/ref-doc/Entity.html?classFilter=Entity|Cesium Entity 文档}
 * @example
 * addEntityWallCesium(viewer, {
 *   wallImg: 'path/to/image.png',
 *   positions: [120.0, 30.0, 121.0, 31.0],
 *   distanceDisplayCondition: [100, 1000],
 *   maximumHeights: 50,
 *   minimumHeights: 10,
 *   wallOtherConfig: { ... }
 * }, {
 *   name: 'Sample Wall',
 *   entityOtherConfig: { ... }
 * });
 *
 */
function addEntityWallCesium(viewer, wallConfig, entityConfig = {}) {
  let {
    wallImg,
    positions, //[经度，纬度，经度，纬度]
    distanceDisplayCondition = [0, 999999999],
    maximumHeights = 100,
    minimumHeights = 0.0, // 围墙底部高度，这里设置为地面高度
    wallOtherConfig,
  } = wallConfig;
  positions.forEach((item, index) => {
    if (typeof item == "string") positions[index] = Number(item);
  });
  const { name = "", entityOtherConfig } = entityConfig;
  // 材质（使用图片）
  var wallMaterial = new ImageMaterialProperty({
    image: wallImg, // 替换为你的图片路径
    repeat: new Cartesian2(1, 1), // 根据需要调整图片重复次数
  });
  const pos = Cartesian3.fromDegreesArray(positions);
  // 创建围墙实体
  const entityData = viewer.entities.add({
    name,
    wall: {
      positions: pos,
      maximumHeights: new Array(pos.length).fill(maximumHeights), // 围墙高度，单位为米，这里设置为10米
      minimumHeights: new Array(pos.length).fill(minimumHeights), // 围墙底部高度，这里设置为地面高度
      material: wallMaterial,
      distanceDisplayCondition: new DistanceDisplayCondition(
        distanceDisplayCondition[0],
        distanceDisplayCondition[1]
      ),
      ...wallOtherConfig,
    },
    ...entityOtherConfig,
  });
  return entityData;
}

/**
 * 添加一个包含孔洞的多边形到 Cesium 视图中。
 *
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例，用于添加实体。
 * @param {Object} polygonConfig - 多边形配置对象。
 * @param {number[]} polygonConfig.hierarchyPositions - 多边形外部轮廓的顶点坐标数组 [经度, 纬度, 经度, 纬度]。
 * @param {Array} polygonConfig.holesPositions - 孔洞的顶点坐标数组 [[经度, 纬度, 经度, 纬度],[经度, 纬度, 经度, 纬度]]。
 * @param {Cesium.Material} [polygonConfig.material=Color.DARKSLATEGRAY.withAlpha(0.2)] - 多边形的材质。
 * @param {Object} [polygonConfig.polygonOtherConfig={}] - 其他多边形相关的配置。
 * @param {...Object} entityConfig - 实体配置对象。
 * @param {string} [entityConfig.name=''] - 实体的名称。
 * @param {Object} [entityConfig.entityOtherConfig={}] - 其他实体相关的配置。
 *
 * @returns {Cesium.Entity} 返回创建的 Cesium 实体对象。
 * @see {@link https://cesium.com/learn/cesiumjs/ref-doc/Entity.html?classFilter=Entity|Cesium Entity 文档}
 * @example
 * addEntityPolygonHolesCesium(viewer, {
 *   hierarchyPositions: [120.0, 30.0, 121.0, 31.0],
 *   holesPositions: [[120.5, 30.5, 120.6, 30.6],[120.5, 30.5, 120.6, 30.6]],
 *   material: Cesium.Color.BLUE.withAlpha(0.5),
 *   polygonOtherConfig: { ... }
 * }, {
 *   name: 'Sample Polygon with Holes',
 *   entityOtherConfig: { ... }
 * });
 *
 */
function addEntityPolygonHolesCesium(viewer, polygonConfig, ...entityConfig) {
  const {
    hierarchyPositions,
    holesPositions,
    material = Color.DARKSLATEGRAY.withAlpha(0.2),
    polygonOtherConfig,
  } = polygonConfig;
  const { name = "", entityOtherConfig } = entityConfig;
  const holes = holesPositions.map((hole) => ({
    positions: Cartesian3.fromDegreesArray(hole),
  }));
  const entityData = viewer.entities.add({
    name,
    polygon: {
      hierarchy: {
        positions: Cartesian3.fromDegreesArray(hierarchyPositions),
        holes,
      },
      material,
      ...polygonOtherConfig,
      // extrudedHeight: 10, // 如果需要挤压效果，可以设置非零值
      // outline: false, // 显示外边框
      // outlineColor: Color.GREEN, // 可选：设置边框颜色
      // outlineWidth: 92.0, // 可选：设置边框宽度
    },
    ...entityOtherConfig,
  });

  return entityData;
}
/**
 * 根据二维坐标 获取实体对象
 * @param {*} viewer - 视图对象
 * @param {*} cartesian2Position - 二维坐标
 * @returns
 */
function getEntityByPosition(viewer, cartesian2Position) {
  var entity = viewer.scene.pick(cartesian2Position);
  // 获取实体对象，实体对象data 是自定义的数据，返回实体原对象（后台对象数据）
  return entity || null;
}

/**
 * 添加降雨效果
 * @param {Viewer} viewer  - 视图对象，通常是一个包含 DOM 元素和其他相关信息的对象。
 * @param {Object} config - 配置对象，用于定义降雨效果的属性。
 * @param {number} [config.size=2] - 雨滴的大小。
 * @param {string|HTMLImageElement} config.image - 雨滴的图像，可以是图像的 URL 或 HTMLImageElement 对象。
 * @returns {ParticleSystem} - 返回一个包含指定配置的 `ParticleSystem` 对象。
 * @see {@link https://sandcastle.cesium.com/?src=Particle%20System%20Weather.html|Cesium 天气示例}
 */
function addPrimitivesRainCesium(viewer, config) {
  const { size = 2, image } = config;
  const scene = viewer.scene;
  // rain
  const rainParticleSize = 15.0;
  const rainRadius = 100000.0;
  const rainImageSize = new Cartesian2(
    rainParticleSize,
    rainParticleSize * size //图片大小
  );
  let rainGravityScratch = new Cartesian3();
  const rainUpdate = function (particle) {
    rainGravityScratch = Cartesian3.normalize(
      particle.position,
      rainGravityScratch
    );
    rainGravityScratch = Cartesian3.multiplyByScalar(
      rainGravityScratch,
      -1050.0,
      rainGravityScratch
    );

    particle.position = Cartesian3.add(
      particle.position,
      rainGravityScratch,
      particle.position
    );

    const distance = Cartesian3.distance(
      scene.camera.position,
      particle.position
    );
    if (distance > rainRadius) {
      particle.endColor.alpha = 0.0;
    } else {
      particle.endColor.alpha =
        Color.BLUE.alpha / (distance / rainRadius + 0.1);
    }
  };

  const Rain = scene.primitives.add(
    new ParticleSystem({
      modelMatrix: new Matrix4.fromTranslation(scene.camera.position),
      speed: -1.0,
      lifetime: 15.0,
      emitter: new SphereEmitter(rainRadius),
      startScale: 1.0,
      endScale: 0.0,
      image,
      emissionRate: 9000.0,
      startColor: new Color(0.27, 0.5, 0.7, 0.0),
      endColor: new Color(0.27, 0.5, 0.7, 0.98),
      imageSize: rainImageSize,
      updateCallback: rainUpdate,
    })
  );
  scene.skyAtmosphere.hueShift = -0.97;
  scene.skyAtmosphere.saturationShift = 0.25;
  scene.skyAtmosphere.brightnessShift = -0.4;
  scene.fog.density = 0.00025;
  scene.fog.minimumBrightness = 0.01;
  return Rain;
}

/**
 * 添加降雪效果
 * @param {Viewer} viewer  - 视图对象，通常是一个包含 DOM 元素和其他相关信息的对象。
 * @param {Object} config - 配置对象，用于定义降雨效果的属性。
 * @param {string|HTMLImageElement} config.image - 雪花的图像，可以是图像的 URL 或 HTMLImageElement 对象。
 * @returns {ParticleSystem} - 返回一个包含指定配置的 `ParticleSystem` 对象。
 * @see {@link https://sandcastle.cesium.com/?src=Particle%20System%20Weather.html|Cesium 天气示例}
 */
function addPrimitivesSnowCesium(viewer, config) {
  const scene = viewer.scene;
  const { image } = config;
  // snow
  const snowParticleSize = 12.0;
  const snowRadius = 100000.0;
  const minimumSnowImageSize = new Cartesian2(
    snowParticleSize,
    snowParticleSize
  );
  const maximumSnowImageSize = new Cartesian2(
    snowParticleSize * 2.0,
    snowParticleSize * 2.0
  );
  let snowGravityScratch = new Cartesian3();
  const snowUpdate = function (particle) {
    snowGravityScratch = Cartesian3.normalize(
      particle.position,
      snowGravityScratch
    );
    Cartesian3.multiplyByScalar(
      snowGravityScratch,
      CesiumMath.randomBetween(-30.0, -300.0),
      snowGravityScratch
    );
    particle.velocity = Cartesian3.add(
      particle.velocity,
      snowGravityScratch,
      particle.velocity
    );
    const distance = Cartesian3.distance(
      scene.camera.position,
      particle.position
    );
    if (distance > snowRadius) {
      particle.endColor.alpha = 0.0;
    } else {
      particle.endColor.alpha = 1.0 / (distance / snowRadius + 0.1);
    }
  };
  const Snow = scene.primitives.add(
    new ParticleSystem({
      modelMatrix: new Matrix4.fromTranslation(scene.camera.position),
      minimumSpeed: -1.0,
      maximumSpeed: 0.0,
      lifetime: 15.0,
      emitter: new SphereEmitter(snowRadius),
      startScale: 0.5,
      endScale: 1.0,
      image,
      emissionRate: 7000.0,
      startColor: Color.WHITE.withAlpha(0.0),
      endColor: Color.WHITE.withAlpha(1.0),
      minimumImageSize: minimumSnowImageSize,
      maximumImageSize: maximumSnowImageSize,
      updateCallback: snowUpdate,
    })
  );

  scene.skyAtmosphere.hueShift = -0.8;
  scene.skyAtmosphere.saturationShift = -0.7;
  scene.skyAtmosphere.brightnessShift = -0.33;
  scene.fog.density = 0.001;
  scene.fog.minimumBrightness = 0.8;

  return Snow;
}
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
function addPrimitiveWarterCesium(viewer, config) {
  const {
    polygonPosition,
    uniformsBaseWaterColor = new Color(
      151 / 255.0,
      201 / 255.0,
      185 / 255.0,
      0.8
    ),
    // blendColor: new Color(0.0, 1.0, 0.7, 1),
    uniformsNormalMap,
    uniformsFrequency = 500.0,
    uniformsAnimationSpeed = 0.01,
    uniformsAmplitude = 10.0,
    uniformsOtherConfig,
  } = config;
  if (!polygonPosition || polygonPosition.length < 1) {
    throw new Error("必须输入经纬度");
  }
  //河道1多边形
  var polygon1 = new PolygonGeometry({
    polygonHierarchy: new PolygonHierarchy(
      Cartesian3.fromDegreesArray(polygonPosition)
    ),
    extrudedHeight: 0,
    height: 0,
    vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT,
  });
  var River1 = new Primitive({
    geometryInstances: new GeometryInstance({
      geometry: polygon1,
    }),
    appearance: new EllipsoidSurfaceAppearance({
      aboveGround: true,
    }),
    show: true,
  });
  var River1_Material = new Material({
    fabric: {
      type: "Water",
      uniforms: {
        baseWaterColor: uniformsBaseWaterColor,
        normalMap: uniformsNormalMap,
        frequency: uniformsFrequency,
        animationSpeed: uniformsAnimationSpeed,
        amplitude: uniformsAmplitude,
        ...uniformsOtherConfig,
      },
    },
  });
  const scene = viewer.scene;
  River1.appearance.material = River1_Material;
  return scene.primitives.add(River1); //添加到场景
}

/**
 * 在地图上增加div弹窗
 * @param {Viewer} viewer - 视图对象
 * @param {Object} config - 配置对象，用于定义弹窗的属性
 * @param {Array} config.position - 弹窗显示的位置的经纬度数组，格式为 [经度, 纬度,]。
 * @param {String|number}[ config.height = 100] - 弹窗离高度
 * @param {Object} [config.offset=[0,0] ] - 弹窗偏移，[x,y]偏移
 * @param {String} config.domId - 挂载地图的 div 元素的 ID。
 * @returns {divLabel}
 */
function addLayerModalCesium(viewer, config) {
  const { position, height = 0, offset = [0, 0], domId } = config;
  // 一个小弹窗 layer
  const val = {
    viewer: viewer,
    position,
    height,
    offset,
    dom: document.getElementById(domId),
  };
  // 初始化弹窗对象
  const modalDivLayer = new divLabel(val);
  // 显示弹窗
  modalDivLayer.toggleShow(true);
  return modalDivLayer;
}

/**
 * 删除指定弹窗对象
 * @param {divLabel} modalDivLayer  根据addLayerModalCesium返回的弹窗对象
 */
function removeLayerModalCesium(modalDivLayer) {
  if (modalDivLayer) modalDivLayer.remove();
}

/**
 *删除实体
 * @param {Viewer} viewer - 视图对象
 * @param {Object|Array|null} [entities=null] - 可以删除单个实体，实体数组，为空删除所有实体
 * @see {@link https://sandcastle.cesium.com/?src=Particle%20System%20Weather.html|Cesium 天气示例}
 */
function removeEntitiesCesium(viewer, entities = null) {
  // 全部删除
  if (!entities) {
    viewer.entities.removeAll();
    return;
  }
  if (Array.isArray(entities)) {
    // 清除指定数组
    for (let index = entities.length - 1; index >= 0; index--) {
      const item = entities[index];
      viewer.entities.remove(item);
    }
  } else {
    viewer.entities.remove(entities);
  }
}
/**
 * 删除图层
 * @param {Viewer} viewer - 视图对象
 * @param {Object|Array|null} [imageryLayers=null] - 可以删除单个图层，图层数组，为空删除所有图层
 * @returns
 */
function removeImageryMapCesium(viewer, imageryLayers = null) {
  // 全部删除
  if (!imageryLayers) {
    viewer.imageryLayers.removeAll();
    return;
  }
  if (Array.isArray(imageryLayers)) {
    // 清除指定数组
    for (let index = imageryLayers.length - 1; index >= 0; index--) {
      const item = imageryLayers[index];
      viewer.imageryLayers.remove(item);
    }
  } else {
    viewer.imageryLayers.remove(imageryLayers);
  }
}
/**
 * 删除动画效果
 * @param {Viewer} viewer - 视图对象
 * @param {Object|Array|null} [primitives=null] - 可以删除单个图层，图层数组，为空删除所有图层
 * @returns
 */
function removePrimitivesCesium(viewer, primitives = null) {
  console.log("primitives", primitives);

  // 全部删除
  if (!primitives) {
    viewer.scene.primitives.removeAll();
    return;
  }
  if (Array.isArray(primitives)) {
    // 清除指定数组
    for (let index = primitives.length - 1; index >= 0; index--) {
      const item = primitives[index];
      viewer.scene.primitives.remove(item);
    }
  } else {
    viewer.scene.primitives.remove(primitives);
  }
}

/**
 * 显示或者隐藏实体对象
 * @param {Array|Object} entities - 数组显示隐藏多个，单个显示隐藏
 * @param {Boolean} type - 显示或者隐藏实体对象
 */
function hideShowEntitiesCesium(entities, type) {
  if (Array.isArray(entities)) {
    // 清除指定数组
    for (let index = entities.length - 1; index >= 0; index--) {
      const item = entities[index];
      item.show = type;
    }
  } else {
    entities.show = type;
  }
}
/**
 * 显示隐藏 弹窗
 * @param {*} modalDivLayer
 * @param {Boolean} type  - 显示或者隐藏弹窗对象
 */
function hideShowLayerModalCesium(modalDivLayer, type) {
  if (modalDivLayer) modalDivLayer.toggleShow(type);
}
/**
 * 本地或者链接 获取GeoJson数据
 * @param {*} json
 * @param {*} config
 * @returns {GeoJsonDataSource}
 */
async function GeoJsonDataSourceCesium(json, config = {}) {
  return new Promise((rs, rj) => {
    GeoJsonDataSource.load(json, { ...config })
      .then(function (dataSource) {
        rs(dataSource);
      })
      .catch((err) => {
        rj(err);
      });
  });
}
/**
 * 本地GeoJson数据 转化为供Entity使用的 经纬度坐标 可能存在 多组 [[经度，纬度，经纬，纬度],[经度，纬度，经纬，纬度]]
 * @param {*} json
 * @param {*} config
 * @returns {Array} - [[经度，纬度，经纬，纬度],[经度，纬度，经纬，纬度]]
 */
function GeoJsonLocaToPositionsCesium(geojsonData) {
  const holesPositions = [];

  // 解析 GeoJSON 数据，提取多边形和洞的坐标
  geojsonData.features.forEach((feature) => {
    if (feature.geometry.type === "Polygon") {
      const coordinates = feature.geometry.coordinates;
      // 内部多边形（洞）
      for (let i = 0; i < coordinates.length; i++) {
        const holePolygon = coordinates[i].flat();
        holesPositions.push(holePolygon);
      }
    } else if (feature.geometry.type === "MultiPolygon") {
      feature.geometry.coordinates.forEach((polygon) => {
        for (let i = 0; i < polygon.length; i++) {
          const holePolygon = polygon[i].flat();
          holesPositions.push(holePolygon);
        }
      });
    }
  });

  return holesPositions;
}
// cesium 渲染
function renderCesium(viewer) {
  viewer.render();
}

/**
 * 初始化场景
 * 型场景定位 基于这个坐标 添加模型 只适用于单模型
 * @param {dom|string} container
 * @param {array} maxWGS
 */
function initThree(container) {
  const three = {
    scene: null,
    camera: null,
    renderer: null,
    mixer: null,
    animation: null,
  };
  if (typeof container === "string") {
    container = document.getElementById(container);
  }
  let fov = 45;
  let width = window.innerWidth;
  let height = window.innerHeight;
  let aspect = width / height;
  let near = 1;
  let far = 10 * 1000 * 1000;
  three.scene = new THREE.Scene(); //场景
  three.camera = new THREE.PerspectiveCamera(fov, aspect, near, far); //相机
  three.renderer = new THREE.WebGLRenderer({ alpha: true }); //渲染
  let Amlight = new THREE.AmbientLight(0xffffff, 2); //灯光
  three.scene.add(Amlight);
  container.appendChild(three.renderer.domElement);
  three.mixer = new THREE.AnimationMixer(three.scene);
  return three;
}
/**
 * 增加精灵模型
 * @param {*} data
 */
function addSpriteMaterialThree() {
  // array.forEach((item) => {
  //   const { state, scale, position } = item;
  //   const texture = new THREE.TextureLoader().load(
  //     state ? "b21.png" : "a03.png"
  //   );
  //   const spriteMaterial = new THREE.SpriteMaterial({
  //     map: texture, //设置精灵纹理贴图
  //     transparent: true, //SpriteMaterial默认是true
  //   });
  //   const sprite = new THREE.Sprite(spriteMaterial);
  //   // 放大物体
  //   sprite.scale.set(scale.x, scale.y, scale.z); // 放大
  //   sprite.position.set(position.x, position.y, position.z); // x 左右 y前后  z向上
  //   sprite.name = "modalSelf";
  //   sprite.data = item;
  //   let meshGroup = new THREE.Group();
  //   meshGroup.add(sprite);
  //   // 添加至场景
  //   three.scene.add(meshGroup);
  //   let _3DOB = {
  //     threeMesh: meshGroup,
  //     minWGS84: minWGS84,
  //     maxWGS84: maxWGS84,
  //   };
  //   three._3DOS.push(_3DOB);
  //   //创建一段rtu 闪烁的动画
  //   TW.rtuA = new TWEEN.Tween(spriteMaterial)
  //     .to({ opacity: 0.2 }, 500) // 1秒内从完全不透明变为完全透明
  //     .easing(TWEEN.Easing.Linear.None)
  //     .yoyo(true) // 使动画往返进行
  //     .repeat(Infinity) // 无限重复
  //     .start();
  // });
}
/**
 * 添加GLTF模型
 * @param {object} three - 3d场景
 * @param {object} config - 加载模型配置项
 * @param {string} config.url - 模型地址
 * @param {object} config.set - {x,z,y} 模型xzy轴的缩放
 * @param {object} config.position -  {x,z,y} 模型xyz轴的移动
 * @param {object} config.rotation -  {x,z,y} 模型xyz轴的旋转
 * @param {object} config.data -  {name,id,} 模型其他信息
 * @param {array} minWGS - 经纬度
 * @param {array} maxWGS - 经纬度
 * @returns {object}  _3DOB Promise
 */
function addGLTFModelThree(three, config) {
  const {
    url,
    set,
    position,
    rotation,
    data,
    minWGS = null,
    maxWGS = null,
  } = config;
  return new Promise((rs) => {
    // 外部模型加载
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      const { x: sX, y: sY, z: sZ } = set;
      const { x: pX, y: pY, z: pZ } = position;
      const { x: rX, y: rY, z: rZ } = rotation;
      const modelss = gltf.scene;

      modelss.name = "modalSelf"; //模型本身  因为点击事件获取模型是获取物体 可能只获取到平
      modelss.data = data; //模型其他信息
      console.log(modelss, "加载到模型");
      modelss.scale.set(sX, sY, sZ); // 缩放相关参数 scale object to be visible at planet scale
      // z方向移动一段距离
      modelss.position.x = pX; //
      modelss.position.y = pY; //
      modelss.position.z = pZ; //

      modelss.rotation.x = rX; //
      modelss.rotation.y = rY; //
      modelss.rotation.z = rZ; //
      //   分组
      let dodecahedronMeshYup = new THREE.Group();
      dodecahedronMeshYup.add(modelss);
      // 添加场景当中
      three.scene.add(dodecahedronMeshYup); // don’t forget to add it to the Three.js scene manually
      let _3DOB = {
        threeMesh: dodecahedronMeshYup,
        minWGS84: minWGS, //可以配置经纬度
        maxWGS84: maxWGS, // 可以配置经纬度
      };
      rs({
        data: _3DOB,
        animations: [...gltf.animations],
      });
      // 存储模型
      // three._3DOBS.push(_3DOB);
    });
  });
}
/**
 *
 */
function renderCameraThreeCesium(three, viewer, container, arr3DModal) {
  if (typeof container === "string") {
    container = document.getElementById(container);
  }
  let minWGS84 = [];
  let maxWGS84 = [];
  // register Three.js scene with Cesium
  // 镜头同步
  three.camera.fov = CesiumMath.toDegrees(viewer.camera.frustum.fovy); // ThreeJS FOV is vertical
  //three.camera.updateProjectionMatrix();
  let cartToVec = function (cart) {
    return new THREE.Vector3(cart.x, cart.y, cart.z);
  };
  // 将Three.js网格配置为相对于地球仪中心位置向上
  for (let id in arr3DModal) {
    minWGS84 = arr3DModal[id].minWGS84;
    maxWGS84 = arr3DModal[id].maxWGS84;
    // convert lat/long center position to Cartesian3
    let center = Cartesian3.fromDegrees(
      (minWGS84[0] + maxWGS84[0]) / 2,
      (minWGS84[1] + maxWGS84[1]) / 2
    );
    // get forward direction for orienting model
    let centerHigh = Cartesian3.fromDegrees(
      (minWGS84[0] + maxWGS84[0]) / 2,
      (minWGS84[1] + maxWGS84[1]) / 2,
      1
    );
    // use direction from bottom left to top left as up-vector
    let bottomLeft = cartToVec(
      Cartesian3.fromDegrees(minWGS84[0], minWGS84[1])
    );
    let topLeft = cartToVec(Cartesian3.fromDegrees(minWGS84[0], maxWGS84[1]));
    let latDir = new THREE.Vector3()
      .subVectors(bottomLeft, topLeft)
      .normalize();
    // configure entity position and orientation
    // 配置实体位置和方向
    arr3DModal[id].threeMesh.position.copy(center); // 控制更新后的模型位置
    // if(arr3DModal[id].myType) arr3DModal[id].threeMesh.position.y += 10.0;

    arr3DModal[id].threeMesh.lookAt(centerHigh.x, centerHigh.y, centerHigh.z);
    arr3DModal[id].threeMesh.up.copy(latDir);
  }
  // Clone Cesium Camera projection position so the
  // Three.js Object will appear to be at the same place as above the Cesium Globe
  // 克隆铯相机的投影位置，使Three.js对象看起来与铯地球仪上方的位置相同
  three.camera.matrixAutoUpdate = false;
  let cvm = viewer.camera.viewMatrix;
  let civm = viewer.camera.inverseViewMatrix;

  // 注意这里，经大神博客得知，three高版本这行代码需要放在 three.camera.matrixWorld 之前
  three.camera.lookAt(0, 0, 0);

  three.camera.matrixWorld.set(
    civm[0],
    civm[4],
    civm[8],
    civm[12],
    civm[1],
    civm[5],
    civm[9],
    civm[13],
    civm[2],
    civm[6],
    civm[10],
    civm[14],
    civm[3],
    civm[7],
    civm[11],
    civm[15]
  );

  three.camera.matrixWorldInverse.set(
    cvm[0],
    cvm[4],
    cvm[8],
    cvm[12],
    cvm[1],
    cvm[5],
    cvm[9],
    cvm[13],
    cvm[2],
    cvm[6],
    cvm[10],
    cvm[14],
    cvm[3],
    cvm[7],
    cvm[11],
    cvm[15]
  );

  // 设置three宽高
  let width = container.clientWidth;
  let height = container.clientHeight;
  let aspect = width / height;
  three.camera.aspect = aspect;
  three.camera.updateProjectionMatrix();
  three.renderer.setSize(width, height);
  three.renderer.clear();
  three.renderer.render(three.scene, three.camera);
}

export {
  initCesium, //加载地图
  initWebMapTileServiceCesium, //加载WebMapTile类型底图
  initUrlTemplateCesium, //加载UrlTemplate类型底图
  viewerCameraFlyToCesium, //飞跃视角
  viewerCameraCesium, //切换视角
  viewerFlyToCesium, //聚焦指定实体
  eventLeftClickCesium, //鼠标左键
  eventRightClickCesium, //鼠标右键
  eventCenterClickCesium, //滚轮
  eventMouseMoveCesium, //鼠标移入移出
  addEntityBillboardCesium, //添加实体 点
  addEntityPolygonCesium, //添加实体 多边形
  addEntityLineCesium, //添加实体 线
  addEntityWallCesium, //添加实体 围墙
  addEntityPolygonHolesCesium, //添加实体 带洞多边形
  getEntityByPosition, //根据二维坐标获取地图上的实体
  addPrimitiveWarterCesium, //添加增加水流材质
  addPrimitivesRainCesium, // 添加下雨
  addPrimitivesSnowCesium, //添加下雪
  addLayerModalCesium, //添加弹窗
  removeLayerModalCesium, //删除弹窗
  removeEntitiesCesium, //删除实体
  removeImageryMapCesium, //删除地图其他底图对象
  removePrimitivesCesium, //删除动态效果 如下雨 河流
  hideShowEntitiesCesium, //显示或者隐藏实体对象
  hideShowLayerModalCesium, //显示或者隐藏实体对象
  GeoJsonDataSourceCesium, //获取genjson文件
  GeoJsonLocaToPositionsCesium, //把本地genjson文件 整理为【经，纬度】
  renderCesium, //渲染
  initThree, //初始化3D场景
  addSpriteMaterialThree, //增加模型
  addGLTFModelThree, //增加模型
  renderCameraThreeCesium, //视角同步
};
