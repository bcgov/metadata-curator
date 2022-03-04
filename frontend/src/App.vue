<template>
  <v-app id="app">
    <Header title="Metadata Curator"></Header>
    <router-view></router-view>
  </v-app>
</template>

<script>
import Header from './components/Header';
import '@mdi/font/css/materialdesignicons.css'

export default {

  components: {
    Header,
  },
  data () {
      return {
      };
  },
  name: 'MetadataCurator',
}
</script>

<style scoped>

    .v-tab.v-tab{
        color: white;
    }

    .v-tab--active .v-btn.v-btn--flat, .v-tab--active .v-icon{
        color: white;
    }
</style>

<style>

.flatpickr-calendar.animate{
    display: none;
}

.container--fluid{
    max-width: 100% !important;
}

</style>
