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
// 引入全局样式
import '../styles/reset.css'
import '../styles/base.css'

// 引入es6&dom扩展
import 'core-js/fn/array/from'
import 'core-js/fn/object/assign'
import 'core-js/fn/object/set-prototype-of'
import 'core-js/modules/es6.object.to-string'
import 'core-js/modules/es6.string.iterator'
// TODO: dom iterable ?
import 'core-js/modules/web.dom.iterable'
import 'core-js/modules/es6.promise'

// 手势事件
import '../lib/gesture'
// 赋值全局变量，获取全局
import './global'
import renderFunctionPlugin from './render-function'

if (global.Vue) {
  setVue(global.Vue)
}

export function setVue (vue) {
  // 找不到vue实例告警
  if (!vue) {
    throw new Error('[Vue Render] Vue not found. Please make sure vue 2.x runtime is imported.')
  }

  // vue实例已挂在到weex，不处理
  if (global.weex.__vue__) {
    return
  }

  // 将vue实例挂在到weex对象中
  global.weex.__vue__ = vue

  // 安装renderFunction插件
  weex.install(renderFunctionPlugin)

  // 安装日志log
  console.log(`[Vue Render] install Vue ${vue.version}.`)
}

export default weex
