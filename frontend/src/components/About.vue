<template>
    <v-container fluid>
        <v-row wrap>
            <v-col cols=12>
                {{mc_name}} is a tool for data uploads and looking at metadata about those uploads
            </v-col>

            <v-col cols=12>
                {{mc_name}} Version {{mc_version}}
            </v-col>

            <v-col cols=12>
                {{forum_name}} Version {{forum_version}}
            </v-col>

            <v-col cols=12>
                {{tus_name}} Version {{tus_version}}
            </v-col>

        </v-row>
    </v-container>
</template>

<script>

import {mapActions, mapState} from "vuex";

export default {
    components:{
    },
    props: {
    },
    data () {
        return {};
    },
    methods: {
        ...mapActions({
            getMC: 'version/getMC',
            getForum: 'version/getForum',
            getTus: 'version/getTus'
        })
    },
    computed: {
        ...mapState({
            user: state => state.user.user,
            mc_name: state => state.version.mc_name,
            mc_version: state => state.version.mc_version,

            forum_name: state => state.version.forum_name,
            forum_version: state => state.version.forum_version,

            tus_name: state => state.version.tus_name,
            tus_version: state => state.version.tus_version,
        }),
    },

    created() {
        this.getMC();
        this.getForum();
        this.getTus();
    },
}
</script>
<style scoped>
    
</style>

<style>
    
</style>
