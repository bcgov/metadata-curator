<template>
    <div style="width: 85%;">

        <h1 class="display-2 font-weight-thin" style="margin-left:15px; margin-top:15px; margin-bottom:10px;">Metadata Revision History</h1>
        <v-list three-line style="margin-bottom: 15px;">
            <template v-for="(item, index) in revisionDisplayItems">
<!--                <v-subheader-->
<!--                    v-if="item.header"-->
<!--                    :key="item.header"-->
<!--                    v-text="item.header"-->
<!--                ></v-subheader>-->

                <v-divider
                    v-if="item.divider"
                    :key="index"
                    :inset="item.inset"
                ></v-divider>

                <v-list-item
                    v-else
                    :key="item.title"
                >
<!--                    <v-btn icon class="mr-4">-->
<!--                        <v-icon>mdi-history</v-icon>-->
<!--                    </v-btn>-->

                    <v-btn icon class="mr-4" @click="routeToHome()">
                        R{{item.revision.revision_number}}
                    </v-btn>

                    <v-list-item-content>
                        <v-list-item-title v-html="item.content"></v-list-item-title>
<!--                        <v-list-item-subtitle><span class='text&#45;&#45;primary'>Uploaded</span>: {{item.subtitle | formatDate}}</v-list-item-subtitle>-->
<!--                        <v-list-item-content v-html="item.content"></v-list-item-content>-->
<!--                        <v-list-item-content v-html="item.content"></v-list-item-content>-->
                        <v-list-item-action-text v-html="item.subtitle"></v-list-item-action-text>

                    </v-list-item-content>

                </v-list-item>
            </template>
        </v-list>
        <v-btn @click="routeToHome()" style="margin-left:25px; ">Back</v-btn>
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
            routeToHome() {
                console.log("routeToHome uploadId");
                this.$router.push({ name: 'home' })
            }
        },
        computed: {
            ...mapState({
                revisions: state => state.dataUploadRevisions.revisions
            }),
            revisionDisplayItems: function(){
                let items = [];
                // items.push({ header: 'Metadata Revision History' });
                this.revisions.forEach( (revision, index) => {

                    const createDate = this.$options.filters.formatDate(revision.create_date);
                    const item = {
                        title: "Revision " + revision.revision_number,
                        // title: "Revision " + revision.revision_number +
                        //     " Updated: " + createDate,
                        subtitle: "Updated on " + createDate + " by " + revision.updater,
                        content: revision.change_summary,
                        revision: revision
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
