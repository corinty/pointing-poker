/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ['**/.*'],
  tailwind: true,
  postcss: true,
  // serverModuleFormat: "esm", // or 'esm' both worked
  serverDependenciesToBundle: ['react-firebase-hooks/firestore'],
  browserNodeBuiltinsPolyfill: {
    modules: {perf_hooks: true, stream: true, crypto: true, tls: true},
  },
  future: {
    v3_relativeSplatPath: true,
  },
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
};
