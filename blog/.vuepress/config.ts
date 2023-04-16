// import {googleAnalyticsPlugin} from '@vuepress/plugin-google-analytics'
// const googleAnalyticsPlugin = require('@vuepress/plugin-google-analytics');
import {googleAnalyticsPlugin} from '@vuepress/plugin-google-analytics'

export default {
    plugins: [
        googleAnalyticsPlugin({
            id: 'G-K78EX03G2S',
        }),

    ],
    // plugins: {
    //     'googleAnalyticsPlugin'({
    //                               id: 'G-XXXXXXXXXX',
    //                           }),
    //
    //     '@vuepress/plugin-google-analytics': {
    //         id: 'G-K78EX03G2S',
    //         ga: 'G-K78EX03G2S',
    //     },
    // },
    title: '',
    description: '',
    theme: '@vuepress/theme-blog',
    themeConfig: {
        nav: [
            {
                text: "blog",
                link: "/"
            }
        ],
    }

}