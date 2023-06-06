<template>
    <v-container fluid ma-0 pa-0>
        <v-alert
            type="error"
            class="mb-0"
            v-if="showError">
            {{error}}
        </v-alert>
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

            <div v-show="(tabs.length > 0)">
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
        <v-snackbar
            v-model="showNotification"
            top
            right
            timeout="-1"
            class="mt-14"
        >
            <span v-html="notificationText"></span>

            <template v-slot:action="{ attrs }">
                <v-btn
                    text
                    v-bind="attrs"
                    @click="clearNotifications">
                        <v-icon>mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>

        <v-snackbar
            v-model="showMCNotification"
            top
            center
            timeout="-1"
            class="mt-14"
        >
            <span v-html="mcNotificationText"></span>

            <template v-slot:action="{ attrs }">
                <v-btn
                    text
                    v-bind="attrs"
                    @click="clearMCNotification">
                        <v-icon>mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script>
import { mapState } from 'vuex'
import User from './User'
import md5 from 'md5'

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
            stayLoggedIn: false,
            showError: false,
            error: "",
            forumWSUrl: "",
            forumApiWS: null,
            showNotification: false,
            notificationText: "",
            mcWSUrl: "",
            mcWS: null,
            showMCNotification: false,
            mcNotificationText: "",
            pendingMCMessage: null,

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
            if (!this.user){
              if (this.enabledPhase >= 2){
                  t = [
                      { id: 1, name: "Home", route: `/`, icon: 'mdi-home', disabled: false},
                      { id: 3, name: "Datasets", route: `/datasets`, icon: 'mdi-folder-open', disabled: false},
                      { id: 4, name: "Versions", route: `/versions`, icon: 'mdi-source-fork', disabled: false},
                  ]
              }
            }
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
            }

            // if ( (this.user) && ( (this.user.isAdmin) || (this.user.isApprover) ) && (this.enabledPhase >= 2) ){
            if (this.enabledPhase >= 2){
                t.push({ id: 12, name: "Classification Indicies", route: `/variable-classifications`, icon: 'mdi-archive-search', disabled: false });
            }

            if ( (this.user) && ( (this.user.isAdmin) || (this.user.isApprover) ) && (this.enabledPhase >= 3) ){
                t.push({ id: 13, name: "Options", route: `/options`, icon: 'mdi-clipboard-list', disabled: false });
            }

            if ( (this.user) && (this.user.isAdmin) ){
                t.push({ id: 14, name: "Admin", route: `/admin`, icon: 'mdi-cog', disabled: false });
            }
            if ( (this.user) && ( (this.user.isAdmin) || (this.user.isApprover) ) ){
                t.push({ id: 15, name: "Search", route: `/search`, icon: 'mdi-file-search', disabled: false});
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
        },

        $route (to){
            this.clearMCNotification();

            if (to.params.id){
                let type = (to.name === "upload_view") ? "upload" : false;
                type = (!type && to.name === "datasets_form") ? "dataset" : type;
                type = (!type && to.name === "version_form") ? "version" : type;
                type = (!type && to.name === "variableClassificationForm") ? "variableClassification" : type;
                if (type){
                    let m = {type: type, id: to.params.id};
                    if (this.mcWS && this.mcWS.readyState==1){
                        this.mcWS.send(JSON.stringify(m));
                    }else{
                        this.pendingMCMessage = m;
                    }
                }
            }else{
                let m = {type: 'none'}
                if (this.mcWS && this.mcWS.readyState==1){
                    this.mcWS.send(JSON.stringify(m));
                }else{
                    this.pendingMCMessage = m;
                }
            }

        },

        jwt(){
            this.initSockets();
        },

        forumWSUrl(){
            this.initSockets();
        },

        mcWSUrl(){
            this.initSockets();
        }
    },

    methods: {

        initSockets: function(){
            if (this.jwt){
                if (this.forumWSUrl && !this.forumApiWS){
                    this.forumApiWS = new WebSocket(this.forumWSUrl, this.jwt);
                    this.forumApiWS.onmessage = this.forumApiMessage;
                    this.forumApiWS.onopen = this.forumWSOpen;
                }
                if (this.mcWSUrl && !this.mcWS){
                    this.mcWS = new WebSocket(this.mcWSUrl, this.jwt);
                    this.mcWS.onmessage = this.mcMessage;
                    this.mcWS.onopen = this.mcWSOpen
                }
            }else{
                if (this.forumApiWS){
                    this.forumApiWS.close();
                }
                if (this.mcWS){
                    this.mcWS.close();
                }
                this.forumApiWS = null;
                this.mcWS = null;
            }
        },

        preserveToken: function(){
            let timeOut = 1000 * 60 // 1 minute
            // timeOut *= 5; // 5 minutes

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

        clearNotifications: function(){
            this.showNotification = false;
            this.notificationText = '';
        },

        clearMCNotification: function(){
            this.showMCNotification = false;
            this.mcNotificationText = '';
        },

        keepAlive: async function(){

            let tok = await authServ.getToken(this.jwt);
            if (!tok || tok.error){
                this.showError = true;
                this.error = "WARNING you are not signed in";
            }else{
                this.showError = false;
                this.error = "";
            }

        },

        forumApiMessage: function(event){

            this.showNotification = false;
            //this.notificationText = ''

            try{
                let data = JSON.parse(event.data);

                let author = (data.topic) ? data.topic.contributors[0] : data.comment.author_user;
                if (author === this.user.email){
                    return;
                }
                let type = (data.topic) ? data.topic.name.substring(24) : data.comment.topic_name.substring(24)
                if (type === ''){
                    type = 'upload'
                }
                let url = '/';
                switch(type){
                    case 'upload':
                        url += 'upload/';
                        break;
                    case 'repo':
                        url += 'datasets/';
                        break;
                    case 'branch':
                        url += 'version/';
                        break;

                    default:
                        url += 'variable-classification/';
                        break;
                }
                url += (data.topic) ? data.topic.name.substring(0,24) : data.comment.topic_name.substring(0,24);
                if (this.notificationText.length > 0){
                    this.notificationText += "<br /><hr /><br />";
                }

                let creatingUserGrav = 'https://www.gravatar.com/avatar/' + md5(author.toLowerCase().trim());
                this.notificationText += '<img src="'+creatingUserGrav+'" alt="'+author+'" width="50" height="50"></img>'

                if (data.topic){
                    //new upload,dataset,edition...
                    this.notificationText += "<a class='tall' href='" + url + "'>New " + this.$tc(type) + " created</a>"
                }else if(data.comment){
                    //new comment somewhere
                    this.notificationText += '<a class="tall" href="' + url + '">' + this.$tc("New comment on ") + this.$tc(type)
                    this.notificationText += " - " + data.comment.comment + '</a>'
                }
                this.showNotification = true;
            }catch(e){
                // eslint-disable-next-line
                console.log("WS Error", e, event)
            }

        },

        forumWSOpen: function(){
            console.log("Successfully connected to the forum api websocket server...")
        },

        mcMessage: function(event){

            try{
                let data = JSON.parse(event.data);

                if (data.users){

                    for (let i=0; i<data.users.length; i++){
                        if (this.mcNotificationText !== ''){
                            this.mcNotificationText += "<br /><hr /><br />";
                        }
                        let author = data.users[i];
                        let creatingUserGrav = 'https://www.gravatar.com/avatar/' + md5(author.toLowerCase().trim());
                        this.mcNotificationText += '<img src="'+creatingUserGrav+'" alt="'+author+'" width="50" height="50"></img>';
                        this.mcNotificationText += "<span class='tall'>WARNING: " + author + " is already here, you might overwrite each others work</span>";
                    }
                    this.showMCNotification = (data.users.length >= 1);
                    return;
                }else if (data.arrived){
                    if (this.mcNotificationText !== ''){
                        this.mcNotificationText += "<br /><hr /><br />";
                    }
                    let author = data.arrived;
                    let creatingUserGrav = 'https://www.gravatar.com/avatar/' + md5(author.toLowerCase().trim());
                    this.mcNotificationText += '<img src="'+creatingUserGrav+'" alt="'+author+'" width="50" height="50"></img>';
                    this.mcNotificationText += "<span class='tall'>WARNING: " + author + " just showed up, you might overwrite each others work</span>";
                }else if (data.left){
                    if (this.mcNotificationText !== ''){
                        this.mcNotificationText += "<br /><hr /><br />";
                    }
                    let author = data.left;
                    let creatingUserGrav = 'https://www.gravatar.com/avatar/' + md5(author.toLowerCase().trim());
                    this.mcNotificationText += '<img src="'+creatingUserGrav+'" alt="'+author+'" width="50" height="50"></img>';
                    this.mcNotificationText += '<span class="tall">' + author + " just left recommend refreshing to ensure you don't overwrite anything they did</span>";
                }

                this.showMCNotification = true;
            }catch(e){
                // eslint-disable-next-line
                console.log("WS Error", e, event)
            }

        },

        mcWSOpen: function(){
            if (this.pendingMCMessage){
                this.mcWS.send(JSON.stringify(this.pendingMCMessage));
                this.pendingMCMessage = null;
            }
            console.log("Successfully connected to the mc websocket server...");
        }
    },

    async mounted(){
        this.dark = this.useDark;
        this.$vuetify.theme.dark = this.dark

        let urlConf = await this.$store.dispatch('config/getItem', {field: 'key', value: 'forumApiWS', def: {key: 'forumApiWS', value: ''}});
        this.forumWSUrl = urlConf.value;
        if (this.forumWSUrl !== '' && this.jwt && this.loggedIn){
            this.forumApiWS = new WebSocket(this.forumWSUrl, this.jwt);
            this.forumApiWS.onmessage = this.forumApiMessage;
            this.forumApiWS.onopen = this.forumWSOpen
        }

        let mcUrlConf = await this.$store.dispatch('config/getItem', {field: 'key', value: 'wsUrl', def: {key: 'wsUrl', value: ''}});
        this.mcWSUrl = mcUrlConf.value;
        if ( (this.mcWSUrl !== '' && this.jwt && this.loggedIn) ){
            this.mcWS = new WebSocket(this.mcWSUrl, this.jwt);
            this.mcWS.onmessage = this.mcMessage;
            this.mcWS.onopen = this.mcWSOpen
        }

        this.preserveToken();
    }
}
</script>

<style >

.noBack.v-tabs>.v-tabs-bar{
    background: none;
}

.tall{
    line-height: 50px;
    vertical-align: top;
}

div.v-alert.v-sheet{
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 100;
}

html{
    overflow: visible;
    height: auto;
}

</style>
