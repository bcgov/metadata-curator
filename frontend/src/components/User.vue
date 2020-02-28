<template>
    <span>
        <v-progress-circular
            v-if="loading"
            indeterminate
        ></v-progress-circular>
        <v-btn primary class="" v-else-if="!loggedIn" @click="login">Login</v-btn>
        <v-menu v-else offset-y>
            <template v-slot:activator="{ on }">
                <v-img  v-show="showImage" ma-0 pa-0 :src="buttonImage" :alt="alt" :height="height+'px'" :width="width+'px'" contain v-on="on" v-on:error="onImgError"></v-img>
                <v-btn  v-show="!showImage" text v-on="on"><v-icon>fa-user</v-icon></v-btn>
            </template>
            <v-list>
                <v-list-item
                    v-for="(item, index) in items"
                    :key="index"
                    @click="item.action"
                >
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </span>
  
</template>


<script>
import { mapState } from 'vuex';
import md5 from 'md5'
export default {

    props: {
        height: {
            type: Number,
            default: 40
        },
        width: {
            type: Number,
            default: 40
        }
    },

    data() {
        return {
            showImage: true
        }
    },

    computed: {
        ...mapState({
            user: state => state.user.user,
            loggedIn: state => state.user.loggedIn,
            userPermissions: state => state.user.userPermissions,
            loading: state => state.user.loading
        }),
        items: function(){
            var items = [];
            var item = {};
            var self = this;
            item.title = "Logout";
            item.action = function(){
                // eslint-disable-next-line
                self.$router.push({name: "logout"});
            }
            items.push(item);
            return items;
        },
        buttonImage: function(){
            return ( (this.user && this.user._json && this.user._json.email) ) ? 'https://www.gravatar.com/avatar/' + md5(this.user._json.email.toLowerCase().trim()) : "Logout"
        },
        alt: function(){
            return ( (this.user && this.user.displayName) ) ? this.user.displayName : "Logout"
        }
    },

    methods: {
        onImgError(){
            this.showImage = false
        },
        login(){
            this.$router.push({name: "login"})
        }
    },

}
</script>

<style scoped>

</style>