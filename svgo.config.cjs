module.exports = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // We use IDs and inkscape:label to set some global CSS in some shapes
          cleanupIds: false,
          removeEditorsNSData: false,

          // Preserve authored CSS and structure; avoid aggressive rewrites
          inlineStyles: false,
          minifyStyles: false,
          mergePaths: false,
          collapseGroups: false,
          removeUnknownsAndDefaults: false,
          removeHiddenElems: true,
          removeUselessDefs: true,
        },
      },
    },
    // Remove explicit width/height to prefer viewBox-based sizing
    'removeDimensions',
    // Strip document metadata
    {
      name: 'removeAttrs',
      params: {
        elemSeparator: '|',
        attrs: [
          '^data-.*',
          'sodipodi:.*',
          'inkscape:(?!label).*', // Remove all inkscape:* except inkscape:label
          'xml:space',
        ],
      },
    },
  ],
};
