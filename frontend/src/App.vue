<template>
  <v-app id="app">
    <Header></Header>
    <router-view :style="'display: ' + ((loggedIn) ? 'block' : 'none')"/>
  </v-app>
</template>

<script>
import Header from './components/Header';
import { mapState } from 'vuex'
export default {

  components: {
    Header
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
