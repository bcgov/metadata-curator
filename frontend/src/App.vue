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
    /deep/ .formio-errors .error {
        color: white !important;
    }

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

.theme--dark.v-card, .theme--dark.v-card .v-card__subtitle, .theme--dark.v-card>.v-card__text .formio-component{
  color: #495057;
}

</style>
