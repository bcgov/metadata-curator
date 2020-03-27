<template>

    <div>

        <v-alert v-if="validationErrorMessages && validationErrorMessages.length == 0
            && validationErrorMessagesByGroup.length == 0" style="margin-left: 10px; margin-bottom: 12px; width:65%;"
                 text
                 prominent
                 type="error"
                 icon="mdi-cloud-alert">

            <h4 style="margin-bottom: 10px; margin-left: 5px;">{{message}}</h4>
            <ul>
                <li v-for="error in validationErrorMessages" :key="error">{{error}}</li>
            </ul>
        </v-alert>

        <v-alert v-if="validationErrorMessages && validationErrorMessages.length > 0" style="margin-left: 10px; margin-bottom: 12px; width:65%;"
                 text
                 prominent
                 type="error"
                 icon="mdi-cloud-alert">

            <h4 style="margin-bottom: 10px; margin-left: 5px;">{{message}}</h4>
            <ul>
                <li v-for="error in validationErrorMessages" :key="error">{{error}}</li>
            </ul>
        </v-alert>

        <v-alert v-if="validationErrorMessagesByGroup && validationErrorMessagesByGroup.length > 0" style="margin-left: 10px; margin-bottom: 12px; width:65%;"
                 text
                 prominent
                 type="error"
                 icon="mdi-cloud-alert">
            <h4 style="margin-bottom: 10px; margin-left: 5px;">{{message}}</h4>
            <ul v-for="resourceErrorGroup in validationErrorMessagesByGroup" :key="resourceErrorGroup">
                Resource name: {{resourceErrorGroup[0]}}
                <li v-for="resourceError in resourceErrorGroup[1]" :key="resourceError.name" style="margin-left: 45px;">
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
