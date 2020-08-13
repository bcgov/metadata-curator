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
              <v-tab v-for="tab of tabs" :key="tab.id" :to="tab.route" exact :disabled="tab.disabled">
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
              { id: 1, name: "Home", route: `/`, icon: 'mdi-home', disabled: false},
              { id: 2, name: "Upload", route: `/upload/new`, icon: 'mdi-upload', disabled: false},
              { id: 3, name: "Import", route: `/import`, icon: 'mdi-import', disabled: false },
              { id: 4, name: "Guess", route: `/infer`, icon: 'mdi-file-question-outline', disabled: true},
              { id: 5, name: "Column", route: `/column`, icon: 'mdi-view-column', disabled: true},
              { id: 6, name: "Table", route: `/table`, icon: 'mdi-table', disabled: true},
              { id: 7, name: "Provenance", route: `/provenance`, icon: 'mdi-file-document', disabled: true },
              { id: 8, name: "Package", route: `/package`, icon: 'mdi-package-variant-closed', disabled: true },
              { id: 9, name: "Validate", route: `/validate`, icon: 'mdi-checkbox-marked-circle', disabled: true },
              { id: 10, name: "Find & Replace", route: `/findreplace`, icon: 'mdi-file-find', disabled: true },
              { id: 11, name: "Submit", route: `/submit`, icon: 'mdi-send', disabled: true }
          ];

          if ( (this.user) && (this.user.isAdmin) ){
              t.push({ id: 12, name: "Admin", route: `/admin`, icon: 'mdi-settings', disabled: false });
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

    .v-tab.v-tab{
        color: var(--v-text-base);
    }
</style>
