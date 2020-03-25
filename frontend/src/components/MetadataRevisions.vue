<template>
    <div style="width: 75%;">

        <v-list three-line>
            <template v-for="(item, index) in revisionDisplayItems">
                <v-subheader
                    v-if="item.header"
                    :key="item.header"
                    v-text="item.header"
                ></v-subheader>

                <v-divider
                    v-else-if="item.divider"
                    :key="index"
                    :inset="item.inset"
                ></v-divider>

                <v-list-item
                    v-else
                    :key="item.title"
                >
                    <v-btn icon class="mr-4">
                        <v-icon>mdi-history</v-icon>
                    </v-btn>

                    <v-list-item-content>
                        <v-list-item-title v-html="item.title"></v-list-item-title>
<!--                        <v-list-item-subtitle><span class='text&#45;&#45;primary'>Uploaded</span>: {{item.subtitle | formatDate}}</v-list-item-subtitle>-->
                        <v-list-item-subtitle v-html="item.subtitle"></v-list-item-subtitle>
                    </v-list-item-content>

                </v-list-item>
            </template>
        </v-list>
    </div>
</template>

<script>

    import {mapActions, mapState} from "vuex";

    export default {
        async created() {
            // await this.loadRevisions();
        },
        data: () => ({
            message: '',
        }),
        methods: {
            ...mapActions({
                getRevisions: 'dataUploadRevisions/getRevisions',
            }),
            // async loadRevisions() {
            //     this.message = 'Retrieving data upload revisions...';
            //     // await this.getRevisions("5e7a45e510abf3bbf5068f6f");
            //     this.message = '';
            // },
        },
        computed: {
            ...mapState({
                revisions: state => state.dataUploadRevisions.revisions
            }),
            revisionDisplayItems: function(){
                let items = [];
                items.push({ header: 'Metadata Revision History' });
                this.revisions.forEach( (revision, index) => {
                    const item = {
                        title: "Revision " + revision.revision_number,
                        subtitle: revision.change_summary
                    };
                    items.push(item);
                    if(index <= this.revisions.length - 1) {
                        items.push({ divider: true, inset: true });
                    }
                });
                console.log("computed items: ", items);
                return items;
            }
        },
    };
</script>

<style scoped>

</style>
