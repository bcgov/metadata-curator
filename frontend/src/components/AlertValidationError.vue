<template>

    <div>

        <v-alert v-if="validationErrorMessages && validationErrorMessages.length == 0
            && validationErrorMessagesByGroup.length == 0"
                 text
                 prominent
                 class="ml-2 mb-2"
                 type="error"
                 icon="mdi-cloud-alert">

            <h4 class="ml-1 mb-2">{{message}}</h4>
            <ul>
                <li v-for="error in validationErrorMessages" :key="error">{{error}}</li>
            </ul>
        </v-alert>

        <v-alert v-if="validationErrorMessages && validationErrorMessages.length > 0"
                 text
                 class="ml-2 mb-2"
                 prominent
                 type="error"
                 icon="mdi-cloud-alert">

            <h4 class="ml-1 mb-2">{{message}}</h4>
            <ul>
                <li v-for="error in validationErrorMessages" :key="error">{{error}}</li>
            </ul>
        </v-alert>

        <v-alert v-if="validationErrorMessagesByGroup && validationErrorMessagesByGroup.length > 0"
                 text
                 class="ml-2 mb-2"
                 prominent
                 type="error"
                 icon="mdi-cloud-alert">
            <h4 class="mb-2 ml-1">{{message}}</h4>
            <ul v-for="resourceErrorGroup in validationErrorMessagesByGroup" :key="resourceErrorGroup">
                Resource name: {{resourceErrorGroup[0]}}
                <li v-for="resourceError in resourceErrorGroup[1]" :key="resourceError.name" class="ml-5">
                    {{resourceError.message}}
                </li>
            </ul>
        </v-alert>
    </div>

</template>

<script>

    export default {
        props: {
            message: {
                type: String,
                required: true,
                default: () => ''
            },
            validationErrorMessages: {
                type: Array,
                required: true,
                default: () => []
            },
            validationErrorMessagesByGroup: {
                type: Array,
                required: true,
                default: () => []
            },
        },
        data() {
            return {
            }
        },
    };
</script>

<style scoped>
</style>
