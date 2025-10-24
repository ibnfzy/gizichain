const nativewind = require('nativewind/babel');

module.exports = function (api) {
  api.cache(true);

  const nativewindConfig = nativewind();

  return {
    presets: [require.resolve('babel-preset-expo')],
    plugins: [
      ...(nativewindConfig?.plugins ?? []),
      require.resolve('expo-router/babel'),
    ],
  };
};
