const registry = [];

// API_ENABLED_MODULES (comma separated) wins over the panel setting, so each machine can decide
// on its own even when several machines share the same settings store. Empty means "not set".
const fromEnv = () => {
  const raw = (process.env.API_ENABLED_MODULES || '').trim();
  return raw ? raw.split(',').map((m) => m.trim()).filter(Boolean) : undefined;
};

// enabledModules unset (never configured) keeps every module on, so existing installs don't change.
const isEnabled = (id) => {
  const enabled = fromEnv() || (global.apiSettings && global.apiSettings.enabledModules);
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
