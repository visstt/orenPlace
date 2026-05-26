const prefixes = [
  'http://localhost:8081',
  'http://localhost:19006',
  'http://127.0.0.1:8081',
  'http://127.0.0.1:19006',
];

export const navigationLinking = {
  prefixes,
  config: {
    screens: {
      Admin: 'admin',
    },
  },
};
