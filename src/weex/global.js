/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import weex from './instance'
import * as core from '../core'

import { inputCommon } from '../mixins'

// 声明全局gloabl变量=window
window.global = window
// 声明全局weex变量 = weex instance
window.weex = weex

weex._styleMap = {}

// 赋值weex方法
; ['getComponentInlineStyle',
  'extractComponentStyle',
  'mapNativeEvents',
  'trimTextVNodes']
  .forEach(function (method) {
    weex[method] = core[method].bind(weex)
  })

// TODO: 在这里混入inputcommon?
// weex.mixins = { inputCommon: inputCommon }
weex.mixins = {
  inputCommon
}
