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
  FrustumGeometry_default
} from "./chunk-SPG4SEWI.js";
import "./chunk-HDITY5DA.js";
import "./chunk-JTRSPC54.js";
import "./chunk-QG7MQUVR.js";
import "./chunk-LNAVFSBW.js";
import "./chunk-4YG7BM4S.js";
import "./chunk-6ADBQ3MQ.js";
import "./chunk-A4SIET4X.js";
import "./chunk-6J7UN343.js";
import "./chunk-LHKV6QYA.js";
import "./chunk-FYRQN2P6.js";
import "./chunk-DQIK5XD5.js";
import "./chunk-ASPY6DPK.js";
import "./chunk-K3APQU3C.js";
import {
  defined_default
} from "./chunk-4LCCQVU5.js";

// packages/engine/Source/Workers/createFrustumGeometry.js
function createFrustumGeometry(frustumGeometry, offset) {
  if (defined_default(offset)) {
    frustumGeometry = FrustumGeometry_default.unpack(frustumGeometry, offset);
  }
  return FrustumGeometry_default.createGeometry(frustumGeometry);
}
var createFrustumGeometry_default = createFrustumGeometry;
export {
  createFrustumGeometry_default as default
};
