// Imports
import Vue from 'vue'
import Vuetify from 'vuetify'
import { makeDecorator } from '@storybook/addons'

import { opts } from '../../src/plugins/vuetify'

// Utilities
import deepmerge from 'deepmerge'

// Vuetify
import 'vuetify/dist/vuetify.min.css'
import '@fortawesome/fontawesome-free/css/all.css'

import addons from '@storybook/addons';

Vue.use(Vuetify)

var vuetify = new Vuetify(deepmerge({
  theme: { dark: false },
}, opts))

// get channel to listen to event emitter
const channel = addons.getChannel();


export default makeDecorator({
  name: 'withVuetify',
  parameterName: 'vuetify',
  wrapper: (storyFn, context, { parameters = {} }) => {
    // Reduce to one new URL?
    const searchParams = new URL(window.location).searchParams
    
    const WrappedComponent = storyFn(context)

    return Vue.extend({
      vuetify,
      components: { WrappedComponent },
      data() {
        return {
          key: 1
        };
      },
      methods: {
        setDark: function(makeDark){
            console.log("set dark", makeDark);
            this.$vuetify.theme.dark = makeDark;  
            this.key = this.key+1;
            return () => channel.off('DARK_MODE', setDark);
        }
      },
      mounted() {
        channel.on('DARK_MODE', this.setDark);
      },
      template: `
        <v-app :key="key">
          <v-container fluid>
            <wrapped-component />
          </v-container>
        </v-app>
      `,
    })
  },
})
