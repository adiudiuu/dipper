/**
 * 古象·繁入口：动态 import 时加载纯数据模块。
 * 引用：仅由 sky.js → ensureExtraAsterisms() 动态 import；勿静态并入主包。
 */
export { EAST_EXTRA_ASTERISMS } from './eastAsterisms.data.js'
