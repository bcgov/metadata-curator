<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <v-text-field v-model="item.parent_id" :label="$tc('Parent')"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-text-field v-model="item.name" :label="$tc('Name')"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-text-field v-model="item.contributors" :label="$tc('Contributor', 2)"></v-text-field>
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