import {
  Cartesian3,
  Color,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  CallbackProperty,
  PolygonHierarchy,
  Rectangle,
  Cartesian2,
  HeightReference,
} from "cesium";

class EntityType {
  static POINT = "point"; // 点
  static LINE = "line"; //线
  static POLYGON = "polygon"; //多边形
  static CIRCLE = "circle"; //圆形
  static RECTANGLE = "rectangle"; //矩形
  static RANGE = "range"; //测距
  static AREA = "area"; //面积
}
export default class Draw {
  constructor(viewer) {
    this.viewer = viewer;
    this.drawingMode = null; // 当前绘制模式（null, 'point', 'line', 'polygon'）
    this.coordinates = []; // 存储点击的经纬度坐标。用于需要多个点的实体，比如线，多边形。一个点point 不需要使用。
    this.coordinatesClickLength = 0; //记录经纬度的长度，在监听鼠标移动时，控制经纬度数组的长度，最后一位。点击后的经纬度才会添加
    this.entities = []; //储存所有实例的 entity对象。用于记录 然后清空删除
    this.entitiesData = {
      point: [],
      line: [],
      polygon: [],
      circle: [],
      rectangle: [],
      range: [],
      area: [],
    }; //储存所有实例的 entity对象的经纬度

    //用于预览的实例对象。比如划线，画多边形的预览效果
    this.lookEntity = null;
    // 监听点击事件 点击滚轮中间开始
    var handler_LEFT_CLICK = new ScreenSpaceEventHandler(viewer.scene.canvas);
    // 监听鼠标移动事件，增加预览效果
    var handler_MOUSE_MOVE = new ScreenSpaceEventHandler(viewer.scene.canvas);
    // 点击中间滚轮结束
    var handler_MIDDLE_DOWN = new ScreenSpaceEventHandler(viewer.scene.canvas);

    // 左键点击事件  在点击事件中根据类型判断 添加点还是其他
    handler_LEFT_CLICK.setInputAction((e) => {
      this.onLeftClick(e);
    }, ScreenSpaceEventType.LEFT_CLICK);

    // 监听鼠标移动事件，增加预览效果
    handler_MOUSE_MOVE.setInputAction((e) => {
      this.onMouseMove(e);
    }, ScreenSpaceEventType.MOUSE_MOVE);

    // 监听点击滚轮中间点击事件  结束绘画事件
    handler_MIDDLE_DOWN.setInputAction((e) => {
      this.onMiddleClick(e);
    }, ScreenSpaceEventType.MIDDLE_DOWN);
  }

  /**
   * point,line,polygon,circle,rectangle
   * @param {string} type
   */
  addEntity(type) {
    if (Object.values(EntityType).includes(type)) {
      this.drawingMode = type;
      this.coordinates = []; // 重置坐标数组
    } else {
      throw new Error("请传入point,line,polygon,rectangle");
    }
  }

  // 处理左键点击事件
  onLeftClick(e) {
    console.log(e.position);
    const that = this;
    // 取消监听
    if (!this.drawingMode) return;
    // 将屏幕坐标转换为经纬度
    var cartesian = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(
      this.viewer.camera.pickEllipsoid(e.position)
    );
    const longitude = CesiumMath.toDegrees(cartesian.longitude);
    const latitude = CesiumMath.toDegrees(cartesian.latitude);
    if (!longitude || !latitude) return; // 获取不到经纬度就结束
    // 经纬度数组
    const position = [longitude, latitude];
    // 没有经纬度数组时，添加第一组数组。
    if (!this.coordinates.length) {
      this.coordinates.push(...position);
    } else {
      // 如果每次**点击都push会存在 预览经纬度索引在点击经纬度的前面**。所以是替换最后一组经纬度
      // 点击表示认可 鼠标移动时监听到的经纬度。将最后一组数组添加为点击数组。替换掉预览经纬度。
      this.coordinates[this.coordinatesClickLength] = longitude;
      this.coordinates[this.coordinatesClickLength + 1] = latitude;
    }
    // 当前经纬度长度，只有点击时长度才会变化。 预览时长度是不变的，虽然coordinates会增加一组数据，但是不记录点击长度
    this.coordinatesClickLength = this.coordinates.length;

    // 根据类型添加 点 或者 线
    switch (this.drawingMode) {
      case EntityType.POINT:
        // 可以在这里添加点的实体  因为只需要添加一个点，所以用position经纬度，也不需要使用预览
        this.entities.push(this.createPointEntity(position));
        this.entitiesData.point.push(position);

        break;
      case EntityType.LINE:
        // 使用预览效果。触发结束事件预览示例会删除。
        if (!this.lookEntity) {
          this.lookEntity = this.viewer.entities.add({
            name: "Draw_Line",
            polyline: {
              positions: new CallbackProperty(function () {
                return Cartesian3.fromDegreesArray(that.coordinates);
              }, false),
              width: 2,
              material: Color.BLUE.withAlpha(0.9),
            },
          });
        }
        break;
      case EntityType.POLYGON:
        // 使用预览效果。触发结束事件预览示例会删除。
        if (!this.lookEntity && this.coordinates.length >= 4) {
          this.lookEntity = this.viewer.entities.add({
            name: "Draw_Polygon",
            polygon: {
              hierarchy: new CallbackProperty(function () {
                return new PolygonHierarchy(
                  Cartesian3.fromDegreesArray(that.coordinates)
                );
              }, false),

              extrudedHeight: 0,
              material: Color.RED,
            },
          });
        }
        break;
      case EntityType.CIRCLE:
        // 使用预览效果。触发结束事件预览示例会删除。
        if (!this.lookEntity) {
          // 中心点取第一组 经纬度
          const start = [this.coordinates[0], this.coordinates[1]];

          this.lookEntity = this.viewer.entities.add({
            position: Cartesian3.fromDegrees(start[0], start[1]),
            ellipse: {
              // 半短轴（画圆：半短轴和半长轴一致即可）
              semiMinorAxis: new CallbackProperty(() => {
                // 结束点 取最后一组经纬度
                const end = [
                  that.coordinates[that.coordinates.length - 2],
                  that.coordinates[that.coordinates.length - 1],
                ];
                // PolygonHierarchy 定义多边形及其孔的线性环的层次结构（空间坐标数组）
                return that.pointsDistance(start, end);
              }, false),
              // 半长轴
              semiMajorAxis: new CallbackProperty(() => {
                // 结束点 取最后一组经纬度
                const end = [
                  that.coordinates[that.coordinates.length - 2],
                  that.coordinates[that.coordinates.length - 1],
                ];
                // PolygonHierarchy 定义多边形及其孔的线性环的层次结构（空间坐标数组）
                return that.pointsDistance(start, end);
              }, false),
              // 填充色
              material: Color.RED.withAlpha(0.5),
              // 是否有边框
              outline: true,
              // 边框颜色
              outlineColor: Color.WHITE,
              // 边框宽度
              outlineWidth: 4,
            },
          });
        }
        break;
      case EntityType.RECTANGLE:
        // 使用预览效果。触发结束事件预览示例会删除。
        if (!this.lookEntity) {
          this.lookEntity = this.viewer.entities.add({
            name: "Draw_Rectangle",
            rectangle: {
              coordinates: new CallbackProperty(function () {
                var obj = Rectangle.fromCartesianArray(
                  Cartesian3.fromDegreesArray(that.coordinates)
                );
                return obj;
              }, false),
              material: Color.RED.withAlpha(0.5),
            },
          });
        }
        break;
      case EntityType.RANGE:
        // 使用预览效果。触发结束事件预览示例会删除。
        if (!this.lookEntity) {
          this.lookEntity = this.viewer.entities.add({
            name: "Draw_Line_Range",
            polyline: {
              positions: new CallbackProperty(function () {
                return Cartesian3.fromDegreesArray(that.coordinates);
              }, false),
              width: 2,
              material: Color.BLUE.withAlpha(0.9),
            },
          });
        }

        // 增加点位，以及文字显示距离
        this.entities.push(
          this.createPointTextEntity(
            position,
            this.arrayPointsDistance(this.coordinates)
          )
        );

        break;
      case EntityType.AREA:
        // 使用预览效果。触发结束事件预览示例会删除。
        if (!this.lookEntity && this.coordinates.length >= 4) {
          this.lookEntity = this.viewer.entities.add({
            name: "Draw_Polygon_Area",
            polygon: {
              hierarchy: new CallbackProperty(function () {
                return new PolygonHierarchy(
                  Cartesian3.fromDegreesArray(that.coordinates)
                );
              }, false),

              extrudedHeight: 0,
              material: Color.RED,
            },
          });
        }
        break;

      default:
        break;
    }
  }
  // 鼠标经过事件
  onMouseMove(e) {
    // 没有类型，没有经纬度不监听
    if (!this.drawingMode || !e.endPosition) return;
    var cartesian = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(
      this.viewer.camera.pickEllipsoid(e.endPosition)
    );
    // 获取不到经纬度
    if (!cartesian) return;
    const longitude = CesiumMath.toDegrees(cartesian.longitude);
    const latitude = CesiumMath.toDegrees(cartesian.latitude);
    if (!longitude || !latitude) return; // 获取不到经纬度就结束
    if (this.coordinates.length >= 2) {
      // 经纬度数组最后一组经纬度 使用监听的经纬度。实现预览的效果
      this.coordinates[this.coordinatesClickLength] = longitude;
      this.coordinates[this.coordinatesClickLength + 1] = latitude;
    }
  }

  // 处理点击滚轮中间点击事件
  onMiddleClick() {
    if (!this.drawingMode || this.coordinates.length < 2) return;
    // 清除预览效果
    if (this.lookEntity) {
      this.viewer.entities.remove(this.lookEntity);
      this.lookEntity = null;
    }
    // 实体对象
    let entity;
    switch (this.drawingMode) {
      case EntityType.LINE:
        entity = this.createPolylineEntity(this.coordinates);
        this.entitiesData.line.push(this.coordinates);
        break;
      case EntityType.POLYGON:
        entity = this.createPolygonEntity(this.coordinates);
        this.entitiesData.polygon.push(this.coordinates);
        break;
      case EntityType.CIRCLE:
        entity = this.createCircleEntity(this.coordinates);
        this.entitiesData.circle.push(this.coordinates);
        break;
      case EntityType.RECTANGLE:
        entity = this.createRectangleEntity(this.coordinates);
        this.entitiesData.rectangle.push(this.coordinates);
        break;
      case EntityType.RANGE:
        entity = this.createPolyRangeEntity(this.coordinates);
        this.entitiesData.range.push(this.coordinates);

        // 增加最后一个点位，以及文字显示距离
        this.entities.push(
          this.createPointTextEntity(
            [
              this.coordinates[this.coordinates.length - 2],
              this.coordinates[this.coordinates.length - 1],
            ],
            this.arrayPointsDistance(this.coordinates)
          )
        );

        break;
      case EntityType.AREA:
        entity = this.createAreaEntity(this.coordinates);
        this.entitiesData.area.push(this.coordinates);

        // 增加最后一个点位，以及文字显示
        this.entities.push(
          this.createPointTextEntity(
            [
              this.coordinates[this.coordinates.length - 2],
              this.coordinates[this.coordinates.length - 1],
            ],
            this.arrayPointsArea(this.coordinates)
          )
        );
        break;
      default:
        break;
    }
    if (entity) {
      this.entities.push(entity);
    }
    this.drawingMode = null; // 重置绘制模式
  }

  // 创建点实体
  createPointEntity(position) {
    // 根据位置创建点的Cesium.Entity
    const point = this.viewer.entities.add({
      name: "Draw_Point",
      position: Cartesian3.fromDegrees(...position),
      point: {
        pixelSize: 10,
        color: Color.RED,
        outlineColor: Color.BLACK,
        outlineWidth: 2,
      },
    });
    return point;
  }
  // 创建含文字的点实体
  createPointTextEntity(position, text) {
    const pointText = this.viewer.entities.add({
      name: "Draw_Point_Text",
      position: Cartesian3.fromDegrees(...position),
      point: {
        pixelSize: 10,
        color: Color.RED,
        outlineColor: Color.BLACK,
        outlineWidth: 2,
      },
      label: {
        show: true,
        scale: 0.4,
        fillColor: Color.RED,
        heightReference: HeightReference.CLAMP_TO_GROUND,
        text: text,
        pixelOffset: new Cartesian2(0, 20),
      },
    });
    return pointText;
  }

  // 创建线实体
  createPolylineEntity(positions) {
    // 根据位置数组创建线的Cesium.Entity
    const line = this.viewer.entities.add({
      name: "Draw_Line",
      polyline: {
        positions: Cartesian3.fromDegreesArray(positions),
        width: 2,
        material: Color.BLUE.withAlpha(0.9),
      },
    });
    return line;
  }

  // 创建多边形实体
  createPolygonEntity(hierarchy) {
    // 根据位置数组（闭合）创建多边形的Cesium.Entity
    const polygon = this.viewer.entities.add({
      name: "Draw_Polygon",
      polygon: {
        hierarchy: Cartesian3.fromDegreesArray(hierarchy),
        material: Color.GREEN.withAlpha(0.5),
        outline: true,
        outlineColor: Color.BLACK,
      },
    });
    return polygon;
  }
  // 创建圆形实体
  createCircleEntity(positionData) {
    // 中心点取第一组 经纬度
    const start = [positionData[0], positionData[1]];
    // 结束点 取最后一组经纬度
    const end = [
      positionData[positionData.length - 2],
      positionData[positionData.length - 1],
    ];
    // 中心点
    const center = Cartesian3.fromDegrees(start[0], start[1], 0);
    //当positionData为数组时绘制最终图，如果为function则绘制动态图
    const circle_entity = this.viewer.entities.add({
      position: center,
      ellipse: {
        // 半短轴（画圆：半短轴和半长轴一致即可）
        semiMinorAxis: this.pointsDistance(start, end),
        // 半长轴
        semiMajorAxis: this.pointsDistance(start, end),
        // 填充色
        material: Color.RED.withAlpha(0.5),
      },
    });

    return circle_entity;
  }
  // 创建矩形实体
  createRectangleEntity(coordinates) {
    // 根据位置数组（闭合）创建多边形的Cesium.Entity
    const polygon = this.viewer.entities.add({
      name: "Draw_Rectangle",
      rectangle: {
        coordinates: Rectangle.fromCartesianArray(
          Cartesian3.fromDegreesArray(coordinates)
        ),
        material: Color.RED.withAlpha(0.5),
      },
    });
    return polygon;
  }

  // 创建线实体 测量距离
  createPolyRangeEntity(positions) {
    // 根据位置数组创建线的Cesium.Entity
    const line = this.viewer.entities.add({
      name: "Draw_Line_Range",
      polyline: {
        positions: Cartesian3.fromDegreesArray(positions),
        width: 2,
        material: Color.BLUE.withAlpha(0.9),
      },
    });
    return line;
  }

  // 创建多边形实体 测量面积
  createAreaEntity(hierarchy) {
    // 根据位置数组（闭合）创建多边形的Cesium.Entity
    const polygon = this.viewer.entities.add({
      name: "Draw_Polygon_Area",
      polygon: {
        hierarchy: Cartesian3.fromDegreesArray(hierarchy),
        material: Color.GREEN.withAlpha(0.5),
        outline: true,
        outlineColor: Color.BLACK,
      },
    });

    return polygon;
  }

  // 清空所有图形
  removeAll() {
    this.entities.forEach((entity) => {
      this.viewer.entities.remove(entity);
    });
    this.entities = [];
  }
  exportEntities() {
    console.log(this.entitiesData);
  }
  // 根据经纬度计算两点之前的直线距离
  pointsDistance(start_point, end_point) {
    // 经纬度转换为世界坐标
    var start_position = Cartesian3.fromDegrees(
      start_point[0],
      start_point[1],
      0
    );
    var end_position = Cartesian3.fromDegrees(end_point[0], end_point[1], 0);
    // 返回两个坐标的距离（单位：米）
    return Cartesian3.distance(start_position, end_position);
  }
  //根据经纬度数组计算 第一个点 到最后一个点的距离
  arrayPointsDistance(points) {
    console.log(points);
    if (points.length < 4) {
      return 0 + "m";
    }
    let totalDistance = 0;
    // 由于点是以成对形式出现，我们每次迭代两个元素
    for (let i = 0; i < points.length - 3; i += 2) {
      // 第一个点的经纬度
      const lon1 = points[i];
      const lat1 = points[i + 1];
      // 第二个点的经纬度（即下一对）
      const lon2 = points[i + 2];
      const lat2 = points[i + 3];

      // 将经纬度转换为 Cesium 的 Cartesian3 坐标
      const start = Cartesian3.fromDegrees(lon1, lat1);
      const end = Cartesian3.fromDegrees(lon2, lat2);

      // 计算并累加两点之间的距离
      totalDistance += Cartesian3.distance(start, end);
    }

    return totalDistance.toFixed(2) + "m"; // 返回累积距离，保留两位小数
  }
  // 面积计算
  arrayPointsArea(latLngs) {
    // 确保输入数组的长度是偶数
    if (latLngs.length % 2 !== 0) {
      console.error("经纬度数组长度必须为偶数");
      return 0;
    }

    // 将经纬度转换为Cartesian3数组
    const positions = [];
    for (let i = 0; i < latLngs.length; i += 2) {
      const latitude = latLngs[i];
      const longitude = latLngs[i + 1];
      positions.push(Cartesian3.fromDegrees(longitude, latitude));
    }

    const area = simplePolygonArea(positions);
    // 一个简单的多边形面积计算函数（仅适用于二维或近似为二维的情况）
    function simplePolygonArea(positions) {
      let area = 0.0;
      let j = positions.length - 1;
      for (let i = 0; i < positions.length; i++) {
        // 这里我们直接使用x和y坐标（即经度和纬度的直接转换，这是不准确的）
        // 在实际应用中，你应该使用地球表面的投影坐标
        const xi = positions[i].x; // 实际上这是经度，但我们假装它是x
        const yi = positions[i].y; // 纬度
        const xj = positions[j].x;
        const yj = positions[j].y;
        area += xi * yj - xj * yi;
        j = i;
      }
      return Math.abs(area / 2.0);
    }
    return Math.floor(area / 4) * 10 + "㎡";
  }
}
