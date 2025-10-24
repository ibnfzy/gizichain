module.exports = function (api) {
  api.cache(true);
  return {
    presets: [require.resolve('babel-preset-expo')],
    plugins: [require.resolve('expo-router/babel')],
  };
};
