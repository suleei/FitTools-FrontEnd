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
import HomeView from "@/views/HomeView.vue";
import {createMemoryHistory, createRouter, createWebHistory} from "vue-router";


const routes = [
    { path:'/', component: HomeView},
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
