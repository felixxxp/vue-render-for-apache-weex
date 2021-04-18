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
import weex from './weex'
import { setVue } from './weex'
import { base, event, style, sticky } from './mixins'
/**
 * init weex.
 * @param  {Vue$2} Vue: Vue Constructor.
 * @param  {object} options: extend weex plugins.
 *         - components.
 *         - modules.
 */
let _inited = false
function init (Vue/*, options = {}*/) {
  // 已初始化 不处理
  if (_inited) { return }
  _inited = true

  // 设置vue实例
  // 1.挂载全局对象
  // 2.安装插件
  setVue(Vue)

  // 注入getConfig方法，调用时提示已弃用，建议使用weex.config
  Vue.prototype.$getConfig = () => {
    console.warn('[Vue Render] "this.$getConfig" is deprecated, please use "weex.config" instead.')
    return weex.config
  }

  const htmlRegex = /^html:/i

  // 判断释放为html标签
  Vue.config.isReservedTag = tag => htmlRegex.test(tag)
  // 替换html平台tag
  Vue.config.parsePlatformTagName = tag => tag.replace(htmlRegex, '')

  // weex._components[tag] 不为undefined 认为是weex tag？
  function isWeexTag (tag) {
    return typeof weex._components[tag] !== 'undefined'
  }

  const oldGetTagNamespace = Vue.config.getTagNamespace

  // 重写获取tag的命名空间
  Vue.config.getTagNamespace = function (tag) {
    // 如果是weextag 直接返回
    if (isWeexTag(tag)) {
      return
    }
    // 其他tag按照原逻辑返回
    return oldGetTagNamespace(tag)
  }

  // 混入支持
  Vue.mixin(base)
  Vue.mixin(event)
  Vue.mixin(style)
  Vue.mixin(sticky)
}

// 已注入vue，自动初始化
// auto init in dist mode.
if (typeof window !== 'undefined' && window.Vue) {
  init(window.Vue)
}

// 初始化方法挂在到weex上
weex.init = init

export default weex
