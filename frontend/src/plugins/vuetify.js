import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css';
import '@fortawesome/fontawesome-free/css/all.css'

Vue.use(Vuetify)

export const opts = {
  icons: {
    iconfont: 'fa', // 'md' || 'mdi' || 'fa' || 'fa'
  },
  theme: {
      dark: false,
      options: {
        customProperties: true
      },
      themes:{
        dark: {
          primary: '#0033cc',
          secondary: '#5475a7',
          tertiary: '#0050a1',
          highlight: '#a5d8ff',
          accent: '#8c9eff',
          caution: "#fcba19",
          error: '#b71c1c',
          text: "#ffffff",
          data: '#F4F4F4',
          textHighlight: '#C49614',
        },
        light: {
          primary: '#779af8',
          secondary: '#5475a7',
          tertiary: '#0050a1',
          highlight: '#a5d8ff',
          accent: '#8c9eff',
          caution: "#fcba19",
          error: '#b71c1c',
          text: "#000000",
          data: '#F4F4F4',
          textHighlight: '#FCBA03',
        }
      }
  }
};

export default new Vuetify(opts)
