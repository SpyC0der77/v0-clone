const config = {
  plugins: {
    "postcss-nesting": {},
    "postcss-preset-env": {
      features: { "nesting-rules": false },
    },
    tailwindcss: {},
  },
};

export default config;
