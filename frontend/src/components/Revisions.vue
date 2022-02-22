<template>
    <v-container class="defText">
        <v-row>
            <v-col cols=3>
                {{$tc('Revision')}}
            </v-col>
            <v-col cols=9>
                <v-select
                    :items="revisionList"
                    v-model="selectedRevision">
                </v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols=12>
                {{$tc('Revised By')}}: {{revisions[selectedRevision].updater}}
            </v-col>
            <v-col cols=12>
                <h3>Summary</h3>
            </v-col>
            <v-col cols=12 v-for="(change, key) in revisions[selectedRevision].change_summary.split(', ')" :key="'changeSummary-'+selectedRevision+'-'+key">
                {{change}}
            </v-col>

            <v-col cols=12>
                <h3>Content</h3>
            </v-col>
            <v-col cols=12 v-for="(value, key) in revisions[selectedRevision].old_content" :key="'content-'+selectedRevision+'-'+key">
                <span v-if="key[0] !== '_'">
                    <span>{{key[0].toUpperCase() + key.substring(1).replaceAll("_", " ")}}: </span>
                    <span v-if="typeof(revisions[selectedRevision].changes[key]) !== 'undefined'"><del>{{value}}</del> {{revisions[selectedRevision].changes[key]}}</span>
                    <span v-else>{{value}}</span>
                </span>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>

export default {
    mixins: [],

    components:{
    },

    props: {
        revisions: {
            type: Array,
            required: true
        }
    },
    data(){
        return {
            selectedRevision: 0
        }
    },

    watch: {
    },

    methods: {

    },

    mounted(){
    },

    computed: {
        revisionList: function(){
            let rv = []
            for (let i=0; i<this.revisions.length; i++){
                let d = new Date(this.revisions[i].create_date);
                let text = "Revision " + this.revisions[i].revision_number + " - ";
                text +=  d.getFullYear() + "/" + (d.getMonth()+1) + "/" + d.getDate();
                text +=  " (" + this.revisions[i].updater + ")";
                rv.push({text: text, value: i});
            }
            return rv;
        }
    },
    
}
</script>

<style scoped>
    .theme--dark.v-card, .theme--dark.v-card .v-card__subtitle, .theme--dark.v-card>.v-card__text .formio-component{
        color: var(--v-text-base);
    }

    .defText{
        color: var(--v-text-base);
    }

    .yellow{
        color: black;
    }
</style>