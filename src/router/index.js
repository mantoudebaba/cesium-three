/*
 * @Author: LXL
 * @Date: 2024-07-04 14:30:12
 * @LastEditTime: 2024-08-19 09:43:32
 * @Description: 路由配置页
 * @FastButton: ctrl+win+i, ctrl+win+t
 */
import { createRouter, createWebHistory } from "vue-router";

// 定义路由
// 每个路由应该映射一个组件。
const routes = [
  {
    path: "/",
    redirect: "/index",
  },
  {
    path: "/index",
    name: "首页",
    component: () => import("@/views/big-map/index.vue"),
  },
];

const router = createRouter({
  history: createWebHistory("/"),
  routes: routes,
});

export default router;
