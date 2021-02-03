<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <v-text-field v-model="item.key" label="Key"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-text-field v-model="item.value" label="Value"></v-text-field>
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