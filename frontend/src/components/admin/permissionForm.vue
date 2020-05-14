<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <v-text-field v-model="item.priority" label="Priority"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-checkbox v-model="item.allow" label="Allow Based Rule"></v-checkbox>
            </v-col>
            <v-col cols="12">
                <v-text-field v-model="item.group_ids" label="Group ids"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-text-field v-model="item.topic_id" label="Topic Id"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="item.user_ids" label="User Ids"></v-text-field>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    props: {
        item: {
            type: Object,
            required: true,
        }
    }
}
</script>