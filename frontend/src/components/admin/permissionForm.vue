<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <v-text-field v-model="item.priority" :label="$tc('Priority')"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-checkbox v-model="item.allow" :label="$tc('Allow Based Rule')"></v-checkbox>
            </v-col>
            <v-col cols="12">
                <v-text-field v-model="item.group_ids" :label="$tc('Group', 1) + ' ' + $tc('id', 2)"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-text-field v-model="item.topic_id" :label="$tc('Topic') + ' ' + $tc('id', 1)"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
                <v-text-field v-model="item.user_ids" :label="$tc('User') + ' ' + $tc('id', 2)"></v-text-field>
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