<script>
    import {extend, ValidationProvider} from 'vee-validate';
    import { required, email } from 'vee-validate/dist/rules';

    export default {
        components: {
            ValidationProvider
        },
        mounted: function () {

            // No message specified.
            extend('email', email);

            // Override the default message.
            extend('required', {
              ...required,
              message: this.$tc('This field is required')
            });
        },
        methods: {

        }
    }
</script>
