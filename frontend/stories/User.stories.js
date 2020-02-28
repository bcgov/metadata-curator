import { action } from '@storybook/addon-actions';
import { withKnobs, number, boolean, object } from '@storybook/addon-knobs';
import User from '../src/components/User';
import store from '../src/store';

export default {
    title: 'User',
    excludeStories: /.*Data$/,
    decorators: [withKnobs],
}

export const actionsData = {

}

export const userData = {
    height: 30,
    width: 30,

    loading: false,
    user: {
        _json: {
            email: "john@doe.ca"
        },
        displayName: "John Doe"
    },
    userPermissions: {

    },
    loggedIn: false
}



const template = `<User :width="width" :height="height" />`

export const SignedOut = () => ({
    components: {
        User
    },
    template: template,
    props: {
        width: {
            default: number('width', userData.width)
        },
        height: {
            default: number('height', userData.height)
        }
    },
    store: {
        state: {
            user: {
                loading: userData.loading,
                user: userData.user,
                userPermissions: userData.userPermissions,
                loggedIn: userData.loggedIn
            }
        }
    },
    methods: actionsData
});

export const SignedIn = () => ({
    components: {
        User
    },
    template: template,
    props: {
        width: {
            default: number('width', userData.width)
        },
        height: {
            default: number('height', userData.height)
        }
    },
    store: {
        state: {
            user: {
                loading: userData.loading,
                user: userData.user,
                userPermissions: userData.userPermissions,
                loggedIn: true
            }
        }
    },
    methods: actionsData
});

export const Loading = () => ({
    components: {
        User
    },
    template: template,
    props: {
        width: {
            default: number('width', userData.width)
        },
        height: {
            default: number('height', userData.height)
        }
    },
    store: {
        state: {
            user: {
                loading: true,
                user: userData.user,
                userPermissions: userData.userPermissions,
                loggedIn: userData.loggedIn
            }
        }
    },
    methods: actionsData
});