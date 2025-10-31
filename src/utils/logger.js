/* eslint-disable no-console */
// Lightweight logger helper. Keep console statements confined to this file so ESLint
// warnings don't appear across the codebase. Logs are only emitted outside of
// production builds (NODE_ENV !== 'production').
export function dbg(...args) {
  if (process.env.NODE_ENV !== 'production') {
    // console usage intentionally allowed in this helper
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

export default { dbg };
