/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.118.1
 *
 * Copyright 2011-2022 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */

import {
  EllipseGeometry_default
} from "./chunk-YIYJ6I3A.js";
import "./chunk-2X2EQPIC.js";
import "./chunk-TY5EH5YB.js";
import "./chunk-CWTLU57J.js";
import "./chunk-QDYLKNZR.js";
import "./chunk-FOU4UZLG.js";
import "./chunk-IQMQJPXD.js";
import "./chunk-HDITY5DA.js";
import "./chunk-FU2R7K7M.js";
import "./chunk-JTRSPC54.js";
import "./chunk-XBFMKJ4F.js";
import "./chunk-QG7MQUVR.js";
import "./chunk-LNAVFSBW.js";
import "./chunk-4YG7BM4S.js";
import "./chunk-6ADBQ3MQ.js";
import "./chunk-A4SIET4X.js";
import {
  Cartesian3_default,
  Ellipsoid_default
} from "./chunk-6J7UN343.js";
import "./chunk-LHKV6QYA.js";
import "./chunk-FYRQN2P6.js";
import "./chunk-DQIK5XD5.js";
import "./chunk-ASPY6DPK.js";
import "./chunk-K3APQU3C.js";
import {
  defined_default
} from "./chunk-4LCCQVU5.js";

// packages/engine/Source/Workers/createEllipseGeometry.js
function createEllipseGeometry(ellipseGeometry, offset) {
  if (defined_default(offset)) {
    ellipseGeometry = EllipseGeometry_default.unpack(ellipseGeometry, offset);
  }
  ellipseGeometry._center = Cartesian3_default.clone(ellipseGeometry._center);
  ellipseGeometry._ellipsoid = Ellipsoid_default.clone(ellipseGeometry._ellipsoid);
  return EllipseGeometry_default.createGeometry(ellipseGeometry);
}
var createEllipseGeometry_default = createEllipseGeometry;
export {
  createEllipseGeometry_default as default
};
