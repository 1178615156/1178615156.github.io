// import {googleAnalyticsPlugin} from '@vuepress/plugin-google-analytics'
const googleAnalyticsPlugin = require('@vuepress/plugin-google-analytics');

module.exports = {
    plugins: [
        googleAnalyticsPlugin({
            id: 'G-K78EX03G2S'
        })
    ],
    title: '',
    description: '',
    theme: '@vuepress/theme-blog',
    // search: false,

    themeConfig: {
        nav: [
            {
                text: "blog",
                link: "/"
            }
        ],
    }


    // themeConfig:{
    //     navbar: false,
    //     sidebar: 'auto'
    // }
}
