// SVG ViewBox Fix Config
// This config removes width/height attributes to allow SVGs to scale properly
// in the browser using their viewBox attribute instead.
//
// Used for fixing specific SVG files that need better scaling behavior:
// - src/assets/images/pic_Dachneigung_flach.svg
// - src/assets/images/pic_Dachneigung_geneigt.svg
// - src/assets/images/pic_Dachneigung_steil.svg
// - src/assets/images/pic_Dachneigung_sehr_steil.svg

module.exports = {
  plugins: [
    'removeDimensions'
  ]
};