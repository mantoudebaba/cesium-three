/*
 * @Author: LXL
 * @Date: 2024-06-14 16:15:38
 * @LastEditTime: 2024-08-19 09:44:28
 * @Description: title
 * @FastButton: ctrl+win+i, ctrl+win+t
 */
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";

const app = createApp(App);
app.use(router).mount("#app");
