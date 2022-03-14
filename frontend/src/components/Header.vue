<template>
    <v-container fluid ma-0 pa-0>
        <v-app-bar>
            <v-toolbar-title class="font-weight-light">
                <span>{{title}}</span>
                <span v-if="month===0 && date===1">&nbsp;<v-icon color="yellow">mdi-party-popper</v-icon></span>
                <span v-if="month===1 && date===14">&nbsp;<v-icon color="red">mdi-cards-heart</v-icon></span>
                <span v-if="month===2 && date===17">&nbsp;<v-icon color="green">mdi-clover</v-icon></span>
                <!-- <span v-if="month===3 && date===15">&nbsp;<v-icon color="purple">mdi-egg-easter</v-icon></span> -->
                <span v-if="month===6 && date===1">&nbsp;<v-icon color="red">mdi-leaf-maple</v-icon></span>
                <span v-if="month===8 && date===30">&nbsp;<v-icon color="orange">mdi-tshirt-crew</v-icon></span>
                <!-- <span v-if="month===9 && date===10">&nbsp;<v-icon color="brown">mdi-turkey</v-icon></span> -->
                <span v-if="month===10 && date===11">&nbsp;<v-icon color="red">mdi-flower-poppy</v-icon></span>
                <span v-if="month===11 && date===25">&nbsp;<v-icon color="red">mdi-string-lights</v-icon></span>
                <span v-if="month===11 && date===25"><v-icon color="green">mdi-string-lights</v-icon></span>
            </v-toolbar-title>

            <div v-show="loggedIn && (tabs.length > 0)">
                <v-tabs v-model="activeTab"
                        icons-and-text
                        centered
                        class="noBack"
                        grow>
                    <v-tabs-slider style="opacity: 0;"></v-tabs-slider>
                    <v-tab v-for="tab of tabs" :key="tab.id" :to="tab.route" exact :disabled="tab.disabled" :id="'tab-'+tab.name.toLowerCase()">
                        {{ $tc(tab.name, 2) }}
                        <v-icon>{{tab.icon}}</v-icon>
                    </v-tab>
                </v-tabs>
            </div>

            <v-spacer></v-spacer>

            <User class="mr-4"></User>

            <v-switch v-model="dark" :label="$tc('Dark Mode')" :class="(this.setTheme ? 'pt-4' : 'pt-4')"></v-switch>

        </v-app-bar>
    </v-container>
</template>

<script>
import { mapState } from 'vuex'
import User from './User'

import { Backend } from '../services/backend';
const authServ = new Backend();


export default {

    props: {
        title: {
            type: String,
            required: true,
        },
        checkRoute: {
            type: Boolean,
            default: true
        }
    },

    components: {
        User
    },

    data() {
        return {
            dark: this.useDark,
            activeTab: null,
            stayLoggedIn: false
        }
    },

    computed: {
        ...mapState({
            user: state => state.user.user,
            loggedIn: state => state.user.loggedIn,
            userPermissions: state => state.user.userPermissions,
            loading: state => state.user.loading,
            useDark: state => state.user.useDark,
            jwt: state => state.user.jwt,
        }),

        month(){
            let d = new Date();
            return d.getMonth();
        },

        date(){
            let d = new Date();
            return d.getDate();
        },

        enabledPhase(){
            let en = this.$store.state.config.items.find(item => item['key'] === 'enabledPhase');
            return (en) ? parseInt(en.value) : 1;
        },

        setTheme(){
            if (typeof(this.dark) !== 'undefined'){
                this.$store.commit('user/setUseDark', {useDark: this.dark});
            }
            return false;
        },

        tabs: function(){
            let t = [];
            if (this.user){
                if (this.enabledPhase >= 1){
                    t = [
                        { id: 2, name: "Uploads", route: `/uploads`, icon: 'mdi-cloud-upload', disabled: false},
                    ];
                }

                if (this.enabledPhase >= 2){
                    t = [
                        { id: 1, name: "Home", route: `/`, icon: 'mdi-home', disabled: false},
                        { id: 2, name: "Uploads", route: `/uploads`, icon: 'mdi-cloud-upload', disabled: false},
                        { id: 3, name: "Datasets", route: `/datasets`, icon: 'mdi-folder-open', disabled: false},
                        { id: 4, name: "Versions", route: `/versions`, icon: 'mdi-source-fork', disabled: false},
                    ]
                }

                    //   { id: 2, name: "Upload", route: `/upload`, icon: 'mdi-upload', disabled: false},
                    //   { id: 3, name: "Import", route: `/import`, icon: 'mdi-import', disabled: false },
                    //   { id: 4, name: "Guess", route: `/infer`, icon: 'mdi-file-question-outline', disabled: true},
                    //   { id: 5, name: "Column", route: `/column`, icon: 'mdi-view-column', disabled: true},
                    //   { id: 6, name: "Table", route: `/table`, icon: 'mdi-table', disabled: true},
                    //   { id: 7, name: "Provenance", route: `/provenance`, icon: 'mdi-file-document', disabled: true },
                    //   { id: 8, name: "Package", route: `/package`, icon: 'mdi-package-variant-closed', disabled: true },
                    //   { id: 9, name: "Validate", route: `/validate`, icon: 'mdi-checkbox-marked-circle', disabled: true },
                    //   { id: 10, name: "Find & Replace", route: `/findreplace`, icon: 'mdi-file-find', disabled: true },
                    //   { id: 11, name: "Submit", route: `/submit`, icon: 'mdi-send', disabled: true }
            }

            if ( (this.user) && ( (this.user.isAdmin) || (this.user.isApprover) ) && (this.enabledPhase >= 2) ){
                t.push({ id: 12, name: "Variable Classification", route: `/variable-classifications`, icon: 'mdi-archive-search', disabled: false });
            }

            if ( (this.user) && (this.user.isAdmin) ){
                t.push({ id: 13, name: "Admin", route: `/admin`, icon: 'mdi-cog', disabled: false });
            }

            return t;
        },

    },

    watch: {
        useDark(newVal){
            this.dark = newVal;
            this.$vuetify.theme.dark = this.dark
        },

        loggedIn(){
            this.preserveToken()
        }
    },

    methods: {
        preserveToken: function(){
            let timeOut = 1000 * 60 // 1 minute
            timeOut *= 5; // 5 minutes

            if (this.loggedIn){
                if (!this.stayLoggedIn){
                    this.stayLoggedIn = setInterval(this.keepAlive, timeOut);
                }
            }else{
                if (this.stayLoggedIn){
                    clearInterval(this.stayLoggedIn);
                    this.stayLoggedIn = false;
                }
            }
        },

        keepAlive: function(){
            //no need to await as we don't really care about the token here
            authServ.getToken(this.jwt);
        },
    },

    mounted(){
        this.dark = this.useDark;
        this.$vuetify.theme.dark = this.dark
        this.preserveToken();
    }
}
</script>

<style >

.noBack.v-tabs>.v-tabs-bar{
    background: none;
}

</style>
