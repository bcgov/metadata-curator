<script>
    import {extend, ValidationProvider} from 'vee-validate';
    import { required, email, numeric } from 'vee-validate/dist/rules';

    export default {
        components: {
            ValidationProvider
        },
        mounted: function () {

            // No message specified.
            extend('email', email);

            // No message specified.
            extend('numeric', {
                ...numeric,
                message: this.$tc('This field can only contain numbers (0-9)')
            });

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
