<template>
  <v-app id="app">
    <Header title="Web Curator"></Header>
      <v-tabs
          background-color="accent-4"
          centered
          dark
          icons-and-text>
          <v-tabs-slider></v-tabs-slider>
          <v-tab to="/">
              Home
              <v-icon>mdi-phone</v-icon>
          </v-tab>
          <v-tab to="/import">
              Import
              <v-icon>mdi-import</v-icon>
          </v-tab>
          <v-tab to="/">
              Guess
              <v-icon>mdi-phone</v-icon>
          </v-tab>
      </v-tabs>
      <router-view v-show="loggedIn"/>
  </v-app>
</template>

<script>
import Header from './components/Header';
import { mapState } from 'vuex'
import '@mdi/font/css/materialdesignicons.css'

export default {

  components: {
    Header,
    // Tabs
  },
  data () {
    return {
        tab: null,
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    }
  },
  computed: {
      ...mapState({
          user: state => state.user.user,
          loggedIn: state => state.user.loggedIn,
          userPermissions: state => state.user.userPermissions,
          loading: state => state.user.loading
      })
  },
  name: 'WebCurator',
}
</script>

<style scoped>
</style>
