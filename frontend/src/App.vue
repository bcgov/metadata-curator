<template>
  <v-app id="app">
    <Header title="Metadata Curator"></Header>
      <div v-show="loggedIn">
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

              <v-tab-item v-for="tab of tabs" :key="tab.id" :value="tab.route"
                          :transition="false" :reverse-transition="false">
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
      };
  },
  computed: {
      ...mapState({
          user: state => state.user.user,
          loggedIn: state => state.user.loggedIn,
          userPermissions: state => state.user.userPermissions,
          loading: state => state.user.loading
      }),
      tabs: function(){
          let t = [
              { id: 1, name: "Home", route: `/`, icon: 'mdi-home'},
              { id: 2, name: "Upload", route: `/upload/new`, icon: 'mdi-upload'},
              { id: 3, name: "Import", route: `/import`, icon: 'mdi-import' },
              { id: 4, name: "Guess", route: `/infer`, icon: 'mdi-file-question-outline'},
              { id: 5, name: "Column", route: `/column`, icon: 'mdi-view-column' },
              { id: 6, name: "Table", route: `/table`, icon: 'mdi-table' },
              { id: 7, name: "Provenance", route: `/provenance`, icon: 'mdi-file-document' },
              { id: 8, name: "Package", route: `/package`, icon: 'mdi-package-variant-closed' },
              { id: 9, name: "Validate", route: `/validate`, icon: 'mdi-checkbox-marked-circle' },
              { id: 10, name: "Find & Replace", route: `/findreplace`, icon: 'mdi-file-find' },
              { id: 11, name: "Submit", route: `/submit`, icon: 'mdi-send' }
          ];

          if ( (this.user) && (this.user.isAdmin) ){
              t.push({ id: 12, name: "Admin", route: `/admin`, icon: 'mdi-settings' });
          }

          return t;
      }
    },
  name: 'WebCurator',
}
</script>

<style scoped>
    /deep/ .formio-errors .error {
        color: white !important;
    }
</style>
