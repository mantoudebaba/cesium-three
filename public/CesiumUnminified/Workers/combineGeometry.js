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
  PrimitivePipeline_default
} from "./chunk-NTXK4YVC.js";
import {
  createTaskProcessorWorker_default
} from "./chunk-R3VJHQGX.js";
import "./chunk-EAHANHEJ.js";
import "./chunk-CWTLU57J.js";
import "./chunk-QDYLKNZR.js";
import "./chunk-FOU4UZLG.js";
import "./chunk-FU2R7K7M.js";
import "./chunk-JTRSPC54.js";
import "./chunk-XBFMKJ4F.js";
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
import "./chunk-4LCCQVU5.js";

// packages/engine/Source/Workers/combineGeometry.js
function combineGeometry(packedParameters, transferableObjects) {
  const parameters = PrimitivePipeline_default.unpackCombineGeometryParameters(
    packedParameters
  );
  const results = PrimitivePipeline_default.combineGeometry(parameters);
  return PrimitivePipeline_default.packCombineGeometryResults(
    results,
    transferableObjects
  );
}
var combineGeometry_default = createTaskProcessorWorker_default(combineGeometry);
export {
  combineGeometry_default as default
};
