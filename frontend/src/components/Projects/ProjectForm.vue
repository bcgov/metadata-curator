<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <v-alert
                    :type="alertType"
                    dismissible
                    v-model="alert">
                        {{alertText}}
                </v-alert>
                <v-card outlined>
                    <v-card-text v-if="allLoading">
                      <v-progress-circular
                        indeterminate
                      ></v-progress-circular>
                    </v-card-text>
                    <v-card-text v-else>
                        <v-row>
                            <h1 class="colorText display-1 font-weight-thin ml-3 my-3">{{creating ? $tc("New") + " " + $tc("Project") : $tc("Project") + " " + project.name}}</h1>
                        </v-row>

                        <v-row v-if="!creating">
                            <label>ID:</label>
                            <span>{{id}}</span>
                        </v-row>

                        <v-row>
                          <v-col cols="12">
                            <TextInput
                                :label="$tc('Name')"
                                :placeholder="'99-t05'"
                                name="name"
                                validation-rules="required"
                                :large="true"
                                :editing="editing"
                                :value="(project) ? project.name : ''"
                                helpPrefix="project"
                                @edited="(newValue) => { updateValues('name', newValue) }"
                            ></TextInput>
                          </v-col>
                        </v-row>

                        <v-row>
                          <v-col cols="12">
                            <h3 class="colorText">Users</h3>
                          </v-col>
                          <v-col cols="12">
                            <v-list class="scrollbox" :disabled="!editing">
                              <v-list-item-group
                                v-model="selectedUsers"
                                multiple
                                color="indigo"
                              >
                              <span v-for="user in users" :key="user.email">
                                <v-list-item v-show="user.email.indexOf(email) !== -1">
                                  <v-list-item-content>
                                    <v-list-item-title>{{user.email}}</v-list-item-title>
                                  </v-list-item-content>
                                </v-list-item>
                              </span>
                              </v-list-item-group>
                            </v-list>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="10">
                            <TextInput
                                label=""
                                :placeholder="'User email'"
                                name="email"
                                :large="true"
                                :editing="editing"
                                value=""
                                helpPrefix="project"
                                @edited="(newValue) => { email = newValue; }"
                            ></TextInput>
                            </v-col>
                            <v-col cols="2">
                              <v-btn 
                                color="primary"
                                @click="() => {
                                  //only add if not in list
                                  if (users.filter(u => u.email.indexOf(email) !== -1).length <= 0){
                                    users.push({email});
                                    selectedUsers.push(users.length-1);
                                    email = '';
                                  }
                                }">
                                Add
                              </v-btn>
                            </v-col>
                        </v-row>

                        <v-row>
                          <v-col cols="6">
                            <h3 class="colorText">Datasets / Editions</h3>
                          </v-col>
                          <v-col cols="6">
                            <h3 class="colorText">Visible Data</h3>
                          </v-col>

                          <!-- Datasets -->
                          <v-col cols="6">
                            <v-row>
                              <v-col cols="12">
                                <TextInput
                                  :label="$tc('Search Datasets')"
                                  placeholder=""
                                  name="search"
                                  :large="true"
                                  value=""
                                  :editing="true"
                                  helpPrefix="project"
                                  @edited="(newValue) => { search = newValue; }"
                              ></TextInput>
                              </v-col>
                            </v-row>
                            <v-row>
                              <v-col cols="12">
                                <v-treeview
                                  :items="reposWithChildren"
                                  selectable
                                  :search="search"
                                  return-object
                                  :disabled="!editing"
                                  :value="selectedBranches"
                                  @input="updateBranches"
                                >
                                </v-treeview>
                              </v-col>
                            </v-row>
                          </v-col>

                          <!-- Selectable Editions -->
                          <v-col cols="6">
                            <div v-for="branch in selectedBranches" :key="`selected-${branch._id}`">
                              {{ branch.repo[0].name }} - {{ branch.repo[0].ministry_organization }} - {{ branch.name }}
                            </div>
                          </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
                <v-card-actions v-if="editing && !allLoading" class="fixed">
                    <v-btn @click="routeToHome()" class="mt-1">{{$tc('Cancel')}}</v-btn>
                    <v-btn @click="save" class="mt-1" color="primary">{{$tc('Save')}}</v-btn>
                </v-card-actions>
                <v-card-actions v-else-if="!allLoading" class="fixed">
                    <v-btn @click="routeToHome()" class="mt-1">{{$tc('Back')}}</v-btn>
                    <v-btn @click="editing=!editing" class="mt-1" color="primary">{{$tc('Edit')}}</v-btn>
                </v-card-actions>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import {mapActions, mapMutations, mapState} from "vuex";
import { Backend } from '../../services/backend';
import TextInput from '../FormElements/TextInput';

const backend = new Backend();

export default {
    props: {
    },
    components:{
        TextInput,
    },    
    data () {
        return {
            id: null,
            editing: false,
            creating: false,
            
            alert: false,
            alertText: "",
            alertType: "success",
            location: window.location,
            users: [],
            selectedUsers: [],
            selectedDatasets: [],
            selectedBranches: [],
            reposWithChildren: [],
            search: "",
            loading: false,
            allLoading: false,
            email: "",
        }
    },

    watch: {
      selectedUsers(){
        let newUsers = [];
        for (let i=0; i<this.selectedUsers.length; i++){
          try{
            newUsers[i] = this.users[this.selectedUsers[i]].email;
          }catch(e){
            //pass
          }
        }
        this.editProject({name: 'users', value: newUsers});
      },
    },

    methods: {
        ...mapActions({
            getProject: 'projects/getItem',
            saveProject: 'projects/newItem',
            updateProject: 'projects/updateItem',
            clearProjects: 'projects/clearItems',
            getRepos: 'repos/getRepos',
            getBranchesByUpload: 'repos/getBranchesByUpload',
        }),
        ...mapMutations({
            editProject: 'projects/editItem',
        }),

        updateBranches(obj){
          this.selectedBranches = obj;
          let editions = []
          let repoIds = new Set([]);
          for (let i=0; i<this.selectedBranches.length; i++){
            if (this.selectedBranches[i].repo_id){
              editions[i] = this.selectedBranches[i]._id;
              repoIds.add(this.selectedBranches[i].repo_id);
            }else{
              repoIds.add(this.selectedBranches[i]._id);
            }
          }
          this.editProject({name: 'editions', value: editions});
          this.editProject({name: 'datasets', value: [...repoIds]});
        },

        async loadSections() {
          this.allLoading = true;
            if (!this.loggedIn){
              await this.$router.push({name: "projects"});
            }
            await this.clearProjects();
            if (this.id && this.id !== 'create'){
              await this.getProject({field: '_id', value: this.id});
            }
            let usersResp = await backend.getUsers();
            this.users = usersResp.users;
            await this.getRepos({filterBy: false});
            await this.getBranchesByUpload({uploadId: -1});
            this.reposWithChildren = this.repos.map(r => {
              let newR = JSON.parse(JSON.stringify(r));
              newR.id = `r-${newR._id}`;
              newR.name = `${newR.name} - ${newR.ministry_organization}`
              newR.children = this.branches.filter(i => {
                return i.repo_id === r._id;
              });
              newR.children.map(c => {
                c.id = `b-${c._id}`;
                return c;
              })
              return newR;
            })
            
            if (this.id && this.id !== 'create'){
              this.selectedBranches = this.branches.filter(b => {
                return this.project.editions.indexOf(b._id) !== -1;
              });
              let userList = [];
              for (let i=0; i<this.project.users.length; i++){
                let index = this.users.findIndex(u => {
                  return u.email === this.project.users[i];
                })
                if (index !== -1){
                  userList.push(index);
                }else{
                  this.users.push({email: this.project.users[i]})
                  userList.push(this.users.length - 1);
                }
              }
              this.selectedUsers = userList;
            }
            this.allLoading = false;           
        },

        routeToHome() {
            // console.log("routeToHome uploadId");
            this.$router.push({ name: 'projects' });
        },

        updateValues(name, value){
            this.editProject({name: name, value: value});
        },

        save(){
            if (this.creating){
                this.saveProject({item: this.project}).then( async() => {
                  if (this.projectError !== ""){
                    this.alertType = "error"
                    this.alertText = this.projectError;
                    this.alert = true;
                    window.scrollTo(0,0);
                    return;
                  }
                  this.alertType = "success"
                  this.alertText = this.$tc("Sucessfully created project");
                  this.alert = true;
                  window.scrollTo(0,0);
                  await this.clearProjects();
                  this.routeToHome();

                }).catch( err => {
                  this.alertType = "error"
                  this.alertText = err.message;
                  this.alert = true;
                  window.scrollTo(0,0);
                });
            }else{
                this.updateProject({id: this.id, item: this.project}).then( async() => {
                  if (this.projectError !== ""){
                    this.alertType = "error"
                    this.alertText = this.projectError;
                    this.alert = true;
                    window.scrollTo(0,0);
                    return;
                  }
                  this.alertType = "success"
                  this.alertText = this.$tc("Sucessfully updated project");
                  this.alert = true;
                  window.scrollTo(0,0);
                  await this.clearProjects();
                  this.routeToHome();

                }).catch( err => {
                  this.alertType = "error"
                  this.alertText = err.message;
                  this.alert = true;
                  window.scrollTo(0,0);
                });
            }
                
        }
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            loggedIn: state => state.user.loggedIn,
            project: state => state.projects.wipItem,
            projectError: state => state.projects.error,
            repos: state => state.repos.repos,
            branches: state => state.repos.branches,
        }),
    },
    async created() {
        // console.log("dataUpload id: " + this.$route.params.id);
        this.id = this.$route.params.id;
        if (this.id === 'create'){
            this.editing = true;
            this.creating = true;
        }
        this.loadSections();
    },
}
</script>

<style scoped>

.bordered{
    border: 1px solid;
}

.colorText{
  color: var(--v-text-base);
}

.scrollbox{
  max-height: 350px;
  overflow-y: scroll;
}

.fixed{
  position: fixed;
  right: 0;
  bottom: 50px;
}

</style>