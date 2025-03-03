const path = require('path');
module.exports = {
  root: true,
  extends: [
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    // Uses the recommended rules for TypeScript
    'plugin:@typescript-eslint/recommended',
    // Disable rules that conflict with prettier
    // See https://prettier.io/docs/en/integrating-with-linters.html
    'plugin:prettier/recommended',
  ],
  // Use the TypeScript parser:
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    // Configure the parser with the tsconfig file in the root project
    // (not the one in the local workspace)
    // tsconfigRootDir: path.resolve(__dirname, './src/'),
    // Allows for the parsing of modern ECMAScript features
    ecmaVersion: 2018,
    // Allows for the use of module imports
    sourceType: 'module',
    //     ecmaFeatures:  {
    //         jsx:  true,  // Allows for the parsing of JSX
    //     },
  },
  env: {
    es6: true,
    node: true,
  },
  rules: {
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/no-absolute-path': 'error',
    'import/no-cycle': 'error',
    'import/no-useless-path-segments': 'error',
    'import/no-relative-parent-imports': 'off',

    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: false,
        optionalDependencies: false,
      },
    ],
    'import/no-unused-modules': 'error',

    'import/no-duplicates': 'error',
    'import/no-namespace': 'error',
    'import/order': 'off',

    'no-unused-vars': ['off'],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/no-var-requires': ['off'],
    '@typescript-eslint/no-use-before-define': ['off'],
    '@typescript-eslint/no-non-null-assertion': 'off',

    'no-restricted-globals': [
      'error',
      'postMessage',
      'blur',
      'focus',
      'close',
      'frames',
      'self',
      'parent',
      'opener',
      'top',
      'length',
      'closed',
      'location',
      'origin',
      'name',
      'locationbar',
      'menubar',
      'personalbar',
      'scrollbars',
      'statusbar',
      'toolbar',
      'status',
      'frameElement',
      'navigator',
      'customElements',
      'external',
      'screen',
      'innerWidth',
      'innerHeight',
      'scrollX',
      'pageXOffset',
      'scrollY',
      'pageYOffset',
      'screenX',
      'screenY',
      'outerWidth',
      'outerHeight',
      'devicePixelRatio',
      'clientInformation',
      'screenLeft',
      'screenTop',
      'defaultStatus',
      'defaultstatus',
      'styleMedia',
      'onanimationend',
      'onanimationiteration',
      'onanimationstart',
      'onsearch',
      'ontransitionend',
      'onwebkitanimationend',
      'onwebkitanimationiteration',
      'onwebkitanimationstart',
      'onwebkittransitionend',
      'isSecureContext',
      'onabort',
      'onblur',
      'oncancel',
      'oncanplay',
      'oncanplaythrough',
      'onchange',
      'onclick',
      'onclose',
      'oncontextmenu',
      'oncuechange',
      'ondblclick',
      'ondrag',
      'ondragend',
      'ondragenter',
      'ondragleave',
      'ondragover',
      'ondragstart',
      'ondrop',
      'ondurationchange',
      'onemptied',
      'onended',
      'onerror',
      'onfocus',
      'oninput',
      'oninvalid',
      'onkeydown',
      'onkeypress',
      'onkeyup',
      'onload',
      'onloadeddata',
      'onloadedmetadata',
      'onloadstart',
      'onmousedown',
      'onmouseenter',
      'onmouseleave',
      'onmousemove',
      'onmouseout',
      'onmouseover',
      'onmouseup',
      'onmousewheel',
      'onpause',
      'onplay',
      'onplaying',
      'onprogress',
      'onratechange',
      'onreset',
      'onresize',
      'onscroll',
      'onseeked',
      'onseeking',
      'onselect',
      'onstalled',
      'onsubmit',
      'onsuspend',
      'ontimeupdate',
      'ontoggle',
      'onvolumechange',
      'onwaiting',
      'onwheel',
      'onauxclick',
      'ongotpointercapture',
      'onlostpointercapture',
      'onpointerdown',
      'onpointermove',
      'onpointerup',
      'onpointercancel',
      'onpointerover',
      'onpointerout',
      'onpointerenter',
      'onpointerleave',
      'onafterprint',
      'onbeforeprint',
      'onbeforeunload',
      'onhashchange',
      'onlanguagechange',
      'onmessage',
      'onmessageerror',
      'onoffline',
      'ononline',
      'onpagehide',
      'onpageshow',
      'onpopstate',
      'onrejectionhandled',
      'onstorage',
      'onunhandledrejection',
      'onunload',
      'performance',
      'stop',
      'open',
      'print',
      'captureEvents',
      'releaseEvents',
      'getComputedStyle',
      'matchMedia',
      'moveTo',
      'moveBy',
      'resizeTo',
      'resizeBy',
      'getSelection',
      'find',
      'createImageBitmap',
      'scroll',
      'scrollTo',
      'scrollBy',
      'onappinstalled',
      'onbeforeinstallprompt',
      'crypto',
      'ondevicemotion',
      'ondeviceorientation',
      'ondeviceorientationabsolute',
      'indexedDB',
      'webkitStorageInfo',
      'chrome',
      'visualViewport',
      'speechSynthesis',
      'webkitRequestFileSystem',
      'webkitResolveLocalFileSystemURL',
      'openDatabase',
    ],
    'indent': 'off',
    'no-use-before-define': [
      'off',
      {
        functions: false,
        classes: false,
      },
    ],
  },
};
