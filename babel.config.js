module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    edge: '17',
                    firefox: '60',
                    chrome: '44',
                    safari: '11.1',
                },
            },
        ],
    ],
    plugins: [
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator',
        [
            'import',
            {
                libraryName: 'vant',
                libraryDirectory: 'es',
                style: true,
            },
            'vant',
        ],
        'lodash',
    ],
}
