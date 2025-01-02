/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'
import LoginView from "@/views/LoginView.vue";
import {createRouter, createWebHistory} from "vue-router";
import MainView from "@/views/MainView.vue";


const routes = [
    { path:'/', component: MainView},
    { path:'/login', component: LoginView}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})
const app = createApp(App)
app.use(router)

registerPlugins(app)
app.mount('#app')
