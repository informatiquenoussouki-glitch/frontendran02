import { createRouter, createWebHistory } from "vue-router";

// 🔹 Pages principales (ton frontend)
import Home from "../pages/Home.vue";
import Login from "../pages/Client/Login.vue";
import Register from "../pages/Register.vue";
import Contact from "../pages/Contact.vue";
import About from "../pages/About.vue";
import ForgotPassword from "../pages/Client/ForgotPassword.vue";
import ResetPassword from "../pages/Client/ResetPassword.vue";
import OmrasPage from "../pages/Omra/OmrasPage.vue";
import OmraDetailPage from "../pages/Omra/OmraDetailPage.vue";
import OmrasEco from "../pages/Omra/OmrasEco.vue";
import OmrasConfort from "../pages/Omra/OmrasConfort.vue";
import OmrasRamadan from "../pages/Omra/OmrasRamadan.vue";
import HotelView from "../pages/Hotel/HotelView.vue";
import NotFound from "../pages/NotFound.vue";

import Temoignages from "../pages/Temoignages.vue";

// 🔹 CRUD Admin (dans components/admin)
// ✅ Correct :
import Dashboard from "../components/admin/Dashboard.vue";
import Clients from "../components/admin/Clients.vue";

import AdminOmrasList from "../components/admin/AdminOmra/AdminOmrasList.vue";
import AdminOmraCreate from "../components/admin/AdminOmra/AdminOmraCreate.vue";
import AdminOmraEdit from "../components/admin/AdminOmra/AdminOmraEdit.vue";

import AdminHotelsList from "../components/admin/AdminHotel/AdminHotelsList.vue";
import AdminHotelCreate from "../components/admin/AdminHotel/AdminHotelCreate.vue";
import AdminHotelEdit from "../components/admin/AdminHotel/AdminHotelEdit.vue";

const routes = [
  // 🔸 Pages principales
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  { path: "/admin/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/contact", name: "Contact", component: Contact },
  { path: "/admin/clients", name: "Clients", component: Clients },
  { path: "/about", name: "About", component: About },
  { path: "/forgot-password", name: "ForgotPassword", component: ForgotPassword },
  { path: "/reset-password", name: "ResetPassword", component: ResetPassword },

  // 🔸 Pages publiques Omra
 
  { path: "/omras", name: "OmrasPage", component: OmrasPage },
  { path: "/omra/:id", name: "omra-detail", component: OmraDetailPage, props: true },
  { path: "/omra-eco", name: "OmrasEco", component: OmrasEco },
  { path: "/omra-confort", name: "OmrasConfort", component: OmrasConfort },
  { path: "/omra-ramadan", name: "OmrasRamadan", component: OmrasRamadan },

  { path: "/temoignages", name: "Temoignages", component: Temoignages },

  // 🔸 Pages Admin (CRUD)
  { path: "/admin/omras", name: "AdminOmrasList", component: AdminOmrasList },
  { path: "/admin/omra/create", name: "AdminOmraCreate", component: AdminOmraCreate },
  { path: "/admin/omra/edit/:id", name: "admin-omras-edit", component: AdminOmraEdit, props: true },

  { path: "/admin/hotels", name: "AdminHotelsList", component: AdminHotelsList },
  { path: "/admin/hotel/create", name: "AdminHotelCreate", component: AdminHotelCreate },
  { path: "/admin/hotel/edit/:id", name: "admin-hotels-edit", component: AdminHotelEdit, props: true },
  { path: "/hotel/:id", name: "hotel-view", component: HotelView, props: true },

  {
  path: '/admin/testimonials',
  name: 'AdminTestimonials',
  component: () => import('@/components/admin/AdminTestimonials.vue'),
  meta: { requiresAuth: true, adminOnly: true },
},

// Public
{ path: '/blog', component: () => import('@/pages/blog/BlogList.vue') },
{ path: '/blog/:slug', component: () => import('@/pages/blog/BlogShow.vue') },

// Admin
{ path: '/admin/blog/posts', component: () => import('@/components/admin/blog/AdminPostsList.vue') },
{ path: '/admin/blog/posts/create', component: () => import('@/components/admin/blog/AdminPostCreate.vue') },
{ path: '/admin/blog/posts/:id/edit', component: () => import('@/components/admin/blog/AdminPostEdit.vue') },


  // 🔸 Page 404
  { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
