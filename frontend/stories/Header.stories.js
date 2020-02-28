import { action } from '@storybook/addon-actions';
import { withKnobs, text } from '@storybook/addon-knobs';
import Header from '../src/components/Header';
import { userData } from './User.stories';

export default {
    title: 'Header',
    excludeStories: /.*Data$/,
    decorators: [withKnobs],
}

export const actionsData = {

}

export const headerData = {
    title: "Web Curator",
    checkRoute: false,
}



const template = `<Header :title="title" :checkRoute="checkRoute" />`

export const LoggedOutLight = () => ({
    components: {
        Header
    },
    template: template,
    props: {
        title: {
            default: text('title', headerData.title)
        },
        checkRoute: {
            default: headerData.checkRoute
        },
    },
    store: {
        commit: function(){},
        dispatch: function(){},
        state: {
            user: {
                useDark: false,
                ...userData.user
            }
        }
    },
    methods: actionsData
});

export const LoggedOutDark = () => ({
    components: {
        Header
    },
    template: template,
    props: {
        title: {
            default: text('title', headerData.title)
        },
        checkRoute: {
            default: headerData.checkRoute
        },
    },
    store: {
        dispatch: function(){},
        commit: function(){},
        state: {
            user: {
                useDark: true,
                ...userData.user
            }
        }
    },
    methods: actionsData
});

export const LoggedInLight = () => ({
    components: {
        Header
    },
    template: template,
    props: {
        title: {
            default: text('title', headerData.title)
        },
        checkRoute: {
            default: headerData.checkRoute
        },
    },
    store: {
        commit: function(){},
        dispatch: function(){},
        state: {
            user: {
                useDark: false,
                ...userData.user,
                loggedIn: true
            }
        }
    },
    methods: actionsData
});

export const LoggedInDark = () => ({
    components: {
        Header
    },
    template: template,
    props: {
        title: {
            default: text('title', headerData.title)
        },
        checkRoute: {
            default: headerData.checkRoute
        },
    },
    store: {
        dispatch: function(){},
        commit: function(){},
        state: {
            user: {
                useDark: true,
                ...userData.user,
                loggedIn: true
            }
        }
    },
    methods: actionsData
});