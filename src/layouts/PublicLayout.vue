<template>
  <div class="public-layout">
    <PublicHeader />
    <main class="main-content">
      <router-view />
    </main>
    <PublicFooter />
  </div>
</template>

<script>
import PublicHeader from "../components/publicheader.vue";
import PublicFooter from "../components/PublicFooter.vue";

export default {
  name: "PublicLayout",
  components: { PublicHeader, PublicFooter },
};
</script>

<style scoped>
.public-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-top: 100px; /* évite que le header recouvre le contenu */
}
</style>
