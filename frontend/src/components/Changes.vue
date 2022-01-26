<template>
    <v-container fluid>
        <v-row wrap>
            <v-col cols=12>
                <Markdown
                    name="changes"
                    :value="changelog"
                    label=""
                    :editing="false"
                    helpPrefix="change"
                ></Markdown>
            </v-col>

        </v-row>
    </v-container>
</template>

<script>

import Markdown from './Markdown';
import changes from '../changelog.md';

export default {
    components:{
        Markdown
    },
    props: {
    },
    data () {
        return {
            changelog: changes
        };
    },
    methods: {
    },
    computed: {
    },

    created() {
    },
}
</script>
<style scoped>
    
</style>

<style>
    
</style>
