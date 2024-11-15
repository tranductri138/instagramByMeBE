import pluginImport from 'eslint-plugin-import';
import pluginPrettier from 'eslint-plugin-prettier';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                browser: true,
                node: true
            }
        }
    },
    {
        plugins: {
            prettier: pluginPrettier,
            import: pluginImport
        },
        rules: {
            'prettier/prettier': [
                'error',
                {
                    singleQuote: true,
                    semi: true,
                    tabWidth: 4,
                    trailingComma: 'none',
                    printWidth: 120
                }
            ],
            'consistent-return': 'off',
            'import/extensions': ['error', 'ignorePackages'],
            'import/no-unresolved': 'off',
            'import/newline-after-import': ['error', { count: 1 }]
        }
    }
];
