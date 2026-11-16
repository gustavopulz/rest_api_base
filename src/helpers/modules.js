const registry = [];

// enabledModules unset (never configured) keeps every module on, so existing installs don't change.
const isEnabled = (id) => {
  const enabled = global.apiSettings && global.apiSettings.enabledModules;
  return !Array.isArray(enabled) || enabled.includes(id);
};

// modules: [{ id, path, load }]. `load` is only called for enabled modules, so a disabled
// module's routes and models are never required on this machine.
const mountModules = (router, modules) => {
  modules.forEach(({ id, path, load }) => {
    if (!registry.includes(id)) registry.push(id);

    if (isEnabled(id)) {
      router.use(path, load());
    } else if (global.consoleLog) {
      global.consoleLog(`Module "${id}" is disabled in this API.`);
    }
  });
};

const availableModules = () => [...registry];

module.exports = { mountModules, availableModules, isEnabled };
