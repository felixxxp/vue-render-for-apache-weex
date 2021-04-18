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
import {
  getThrottleLazyload,
  watchAppear,
  debounce
} from '../utils'

import config from '../config'
const scrollableTypes = config.scrollableTypes

let lazyloadWatched = false
function watchLazyload () {
  lazyloadWatched = true
  ; [
    'scroll',
    // 'transitionend',
    // 'webkitTransitionEnd',
    // 'animationend',
    // 'webkitAnimationEnd',
    'resize'
  ].forEach(evt => {
    window.addEventListener(evt, getThrottleLazyload(25, document.body))
  })
  /**
   * In case the users use the body's overflow to scroll. Then the scroll
   * event would not be triggered on the window object but on the body.
   */
  document.body.addEventListener('scroll', getThrottleLazyload(25, document.body))
}

let idCnt = 0
let appearWatched = false

/**
 * during updating, the appear watcher binding on the appearWatched context
 * should be triggered within a debounced wrapper.
 * If the updating interval is shorter then 50 ms, then the appear events will
 * ignore the change in the previous 50 ms due to the debounce wrapper.
 */
const debouncedWatchAppear = debounce(function () {
  watchAppear(appearWatched, true)
}, 50)

/**
 * if it's a scrollable tag, then watch appear events for it.
 */
// 监听滚动domappwar事件
function watchAppearForScrollables (tagName, context) {
  // when this is a scroller/list/waterfall
  if (scrollableTypes.indexOf(tagName) > -1) {
    const sd = context.scrollDirection
    // [FE-TODO] 水平滚动不处理appear?
    if (!sd || sd !== 'horizontal') {
      appearWatched = context
      watchAppear(context, true)
    }
  }
}

export default {
  beforeCreate () {
    // 监听懒加载事件
    if (!lazyloadWatched) {
      watchLazyload()
    }
  },

  /**
   * update 处理懒加载
   */
  updated () {
    const el = this.$el
    // [FE-TODO]nodeType ?
    if (!el || el.nodeType !== 1) {
      return
    }

    if (this._rootId) {
      // 不存在weex-root，添加weex-root/weex-ct类名，设置data-wx-root-id属性
      if (el.className.indexOf('weex-root') <= -1) {
        el.classList.add('weex-root')
        el.classList.add('weex-ct')
        el.setAttribute('data-wx-root-id', this._rootId)
      }
    }

    const tagName = this.$options && this.$options._componentTag
    const metaUp = weex._meta.updated

    // 无记录，赋值为0，否则计数+1
    if (!metaUp[tagName]) {
      metaUp[tagName] = 0
    }
    metaUp[tagName]++

    // will check appearing when no other changes in latest 50ms.
    // 节流
    debouncedWatchAppear()
    /**
     * since the updating of component may affect the layout, the lazyloading should
     * be fired.
     */
    // 处理完后，移除事件监听
    this._fireLazyload()
  },

  mounted () {
    const tagName = this.$options && this.$options._componentTag
    const el = this.$el

    if (!el || el.nodeType !== 1) {
      return
    }

    // 注入的component计数
    if (typeof weex._components[tagName] !== 'undefined') {
      weex._components[tagName]++
    }

    const metaMt = weex._meta.mounted

    // 组件mounted计数
    if (!metaMt[tagName]) {
      metaMt[tagName] = 0
    }

    metaMt[tagName]++

    // 滚动元素，监听appear事件处理
    watchAppearForScrollables(tagName, this)

    // when this is the root element of Vue instance.
    // vue实例根节点
    if (this === this.$root) {
      const rootId = `wx-root-${idCnt++}`

      // 未声明_root变量 ，先声明
      if (!weex._root) {
        weex._root = {}
      }

      // 赋值
      weex._root[rootId] = this
      this._rootId = rootId

      if (el.nodeType !== 1) {
        return
      }

      // 添加类名
      el.classList.add('weex-root')
      el.classList.add('weex-ct')
      el.setAttribute('data-wx-root-id', rootId)

      /**
       * there's no scrollable component in this page. That is to say,
       * the page is using body scrolling instead of scrollabe components.
       * Then the appear watcher should be attached on the body.
       */
      // 未处理appear监听，认为当前页面没有使用滚动组件
      // appear 需要在body上处理
      if (!appearWatched) {
        appearWatched = this
        watchAppear(this, true)
      }

      // 移除事件
      this._fireLazyload(el)
    }

    // give warning for not using $processStyle in vue-loader config.
    // if (!warned && !window._style_processing_added) {
    //   warnProcessStyle()
    // }
  },

  destroyed () {
    const el = this.$el
    if (!el || el.nodeType !== 1) {
      return
    }
    /**
     * if the destroyed element is above another panel with images inside, and the images
     * moved into the viewport, then the lazyloading should be triggered.
     */
    // 如果要销毁的节点在另一个含有图片的节点上，在图片在视窗展示时，懒加载事件会被触发

    if (this._rootId) {
      delete weex._root[this._rootId]
      delete this._rootId
    }
    const tagName = this.$options && this.$options._componentTag
    if (typeof weex._components[tagName] !== 'undefined') {
      weex._components[tagName]--
    }
    const metaDs = weex._meta.destroyed
    if (!metaDs[tagName]) {
      metaDs[tagName] = 0
    }
    metaDs[tagName]++
    this._fireLazyload()
  },

  methods: {
    _fireLazyload (el) {
      getThrottleLazyload(25, el || document.body)()
    }
  }
}
