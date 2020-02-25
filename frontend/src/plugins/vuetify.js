import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import '@fortawesome/fontawesome-free/css/all.css'

Vue.use(Vuetify)

const opts = {
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
            primary: '#003366',
            secondary: '#5475a7',
            tertiary: '#0050a1',
            highlight: '#a5d8ff',
            accent: '#8c9eff',
            caution: "#fcba19",
            error: '#b71c1c',
            text: "#ffffff",
            data: '#F4F4F4',
          },
          light: {
            primary: '#003366',
            secondary: '#5475a7',
            tertiary: '#0050a1',
            highlight: '#a5d8ff',
            accent: '#8c9eff',
            caution: "#fcba19",
            error: '#b71c1c',
            text: "#ffffff",
            data: '#F4F4F4',
          }
        }
    }
  };

export default new Vuetify(opts)