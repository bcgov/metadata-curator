<template>
    <div>
        <v-list three-line class="mb-2">
            <template v-for="(item, index) in revisionDisplayItems">
                    <v-divider
                        v-if="item.divider"
                        :key="index"
                        :inset="item.inset"
                    ></v-divider>

                    <v-list-item
                        v-else
                        :key="item.title"
                    >
                        <v-btn icon class="mr-4" @click="routeToHome()">
                            R{{item.revision.revision_number}}
                        </v-btn>

                        <v-list-item-content>
                            <v-list-item-title v-html="item.content"></v-list-item-title>
                            <v-list-item-action-text v-html="item.subtitle"></v-list-item-action-text>
                        </v-list-item-content>

                </v-list-item>
            </template>
        </v-list>
    </div>
</template>

<script>

    import {mapActions, mapState} from "vuex";

    export default {
        data: () => ({
            message: '',
        }),
        methods: {
            ...mapActions({
                getRevisions: 'dataUploadRevisions/getRevisions',
            }),
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
                this.revisions.forEach( (revision, index) => {

                    const createDate = this.$options.filters.formatDate(revision.create_date);
                    const item = {
                        title: "Revision " + revision.revision_number,
                        subtitle: "Updated on " + createDate + " by " + revision.updater,
                        content: revision.change_summary,
                        revision: revision
                    };
                    items.push(item);
                    if(index <= this.revisions.length - 1) {
                        items.push({ divider: true, inset: true });
                    }
                });
                // console.log("computed items: ", items);
                return items;
            }
        },
    };
</script>

<style scoped>

</style>
