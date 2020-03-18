<template>
  <v-app id="app">
    <Header title="Metadata Curator"></Header>
      <div>
          <v-tabs v-model="activeTab"
                  background-color="accent-4"
                  icons-and-text
                  centered
                  dark
                  grow>
              <v-tab v-for="tab of tabs" :key="tab.id" :to="tab.route" exact>
                  {{ tab.name }}
                  <v-icon>{{tab.icon}}</v-icon>
              </v-tab>

              <v-tab-item v-for="tab of tabs" :key="tab.id" :value="tab.route">
                  <router-view></router-view>
              </v-tab-item>
          </v-tabs>
      </div>
  </v-app>
</template>

<script>
import Header from './components/Header';
import { mapState } from 'vuex'
import '@mdi/font/css/materialdesignicons.css'

export default {

  components: {
    Header,
  },
  data () {
      return {
          activeTab: null,
          tabs: [
              { id: 1, name: "Home", route: `/`, icon: 'mdi-home'},
              { id: 2, name: "Import", route: `/import`, icon: 'mdi-import' },
              { id: 3, name: "Guess", route: `/infer`, icon: 'mdi-file-question-outline'},
              { id: 4, name: "Column", route: `/column`, icon: 'mdi-view-column' },
              { id: 5, name: "Table", route: `/table`, icon: 'mdi-table' },
              { id: 6, name: "Provenance", route: `/provenance`, icon: 'mdi-file-document' },
              { id: 7, name: "Package", route: `/package`, icon: 'mdi-package-variant-closed' },
              { id: 8, name: "Validate", route: `/validate`, icon: 'mdi-checkbox-marked-circle' },
              { id: 9, name: "Find & Replace", route: `/findreplace`, icon: 'mdi-file-find' },
              { id: 10, name: "Submit", route: `/submit`, icon: 'mdi-send' },
          ]
      };
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
