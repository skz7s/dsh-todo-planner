window.__ModuleLoader__.load({
  id: 'dsh-todo-planner',
  factory: (require) => {
    const React = require('react');
    const { useCallback, useEffect, useRef, useState } = React;
    const {
      Button,
      IconAlarmClockOutlineRegular,
      IconCheckCircleOutlineRegular,
      IconChevronDownOutlineRegular,
      IconChevronLeftOutlineRegular,
      IconChevronRightOutlineRegular,
      IconClockOutlineRegular,
      IconEditOutlineRegular,
      IconFolderCloseRegular,
      IconPlusOutlineRegular,
      IconPlanOutlineRegular,
      IconPlayOutlineRegular,
      IconRefreshOutlineRegular,
      IconSearchOutlineRegular,
      IconSlidersTwoOutlineRegular,
      IconTrashOutlineRegular,
      Menu,
      Modal,
      Tooltip
    } = require('@deepseek-ai/dsh-client-ui-primitives');
const h = React.createElement;
const TODO_TAB_ID = 'dsh-todo-planner/todos';
const TODO_TAB_KIND = 'dsh-todo-planner-todos';
let runtimeContext;
const DEFAULT_SETTINGS = { dailyTokenBudget: 10000000 };
const settingsListeners = new Set();
let settingsValue = { ...DEFAULT_SETTINGS };
let settingsLoad;
let settingsLoaded = false;
let lastModelDiscoveryCatalog;
let lastModelDiscoveryUrl = '';
let todoPlannerRemoteReady = Promise.resolve();
const dispatchOptionsCache = new Map();
const DISPATCH_STORAGE_PREFIX = 'dsh-todo-planner:dispatch:';
const LEGACY_DISPATCH_STORAGE_PREFIX = 'todo-harness:dispatch:';

function readDispatchOptions(key) {
  if (!key) return null;
  if (dispatchOptionsCache.has(key)) return dispatchOptionsCache.get(key);
  for (const prefix of [DISPATCH_STORAGE_PREFIX, LEGACY_DISPATCH_STORAGE_PREFIX]) {
    try {
      const value = JSON.parse(window.localStorage.getItem(`${prefix}${key}`));
      if (!value?.modelSelection?.provider || !value.modelSelection.model || !value.directoryPath || !['choose', 'current'].includes(value.directoryMode)) continue;
      dispatchOptionsCache.set(key, value);
      return value;
    } catch {
      // Continue with the legacy key when the new entry is missing or invalid.
    }
  }
  return null;
}

function rememberDispatchOptions(key, options) {
  if (!key) return;
  dispatchOptionsCache.set(key, options);
  try { window.localStorage.setItem(`${DISPATCH_STORAGE_PREFIX}${key}`, JSON.stringify(options)); } catch {}
}

function openHarnessSession(ctx, sessionId) {
  if (!sessionId) throw new Error('此任务尚未关联会话');
  const uiWorkspace = ctx.uiWorkspace ?? ctx.get?.('uiWorkspace');
  if (!uiWorkspace) throw new Error('会话服务尚未连接，请稍后重试');
  const frame = document.querySelector('[data-dsh-todo-planner-mobile-todo-open]');
  uiWorkspace.openSession(sessionId);
  if (frame) {
    frame.removeAttribute('data-dsh-todo-planner-mobile-todo-open');
    if (ctx.sidebarRight.isExpanded()) ctx.sidebarRight.toggleExpanded();
    window.dispatchEvent(new CustomEvent('dsh-todo-planner:mobile-todo-open', { detail: { open: false } }));
  }
}

// The package's Host face is loaded by the Typert loader, while this Web
// contribution is a ModuleLoader entry. Keep the Remote contribution explicit
// so the client namespace is available before settings and schedules call it.
const DSH_TODO_PLANNER_REMOTE = {
  package: 'dsh-todo-planner',
  descriptors: [
    {
      id: 'dsh-todo-planner#todoPlanner/createSchedule',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'createSchedule',
      invocation: { kind: 'direct' },
      parameters: [{ name: 'payload', wire: 'payload', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-todo-planner#CreateSchedulePayload', create: () => ({}) } }],
      result: { mode: 'strict', typeSymbol: 'dsh-todo-planner#todoPlanner/createSchedule:result', create: () => ({}) }
    },
    {
      id: 'dsh-todo-planner#todoPlanner/getDefaultModel',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'getDefaultModel',
      invocation: { kind: 'direct' },
      parameters: [],
      result: { mode: 'strict', typeSymbol: 'dsh-todo-planner#todoPlanner/getDefaultModel:result', create: () => ({}) }
    },
    {
      id: 'dsh-todo-planner#todoPlanner/setDefaultModel',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'setDefaultModel',
      invocation: { kind: 'direct' },
      parameters: [{ name: 'selection', wire: 'selection', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-todo-planner#ModelSelection', create: () => ({}) } }],
      result: { mode: 'strict', typeSymbol: 'dsh-todo-planner#todoPlanner/setDefaultModel:result', create: () => ({}) }
    },
    {
      id: 'dsh-todo-planner#todoPlanner/listTodos',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'listTodos',
      invocation: { kind: 'direct' },
      parameters: [{ name: 'filters', wire: 'filters', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-todo-planner#TodoFilters', create: () => ({}) } }],
      result: { mode: 'strict', typeSymbol: 'dsh-todo-planner#todoPlanner/listTodos:result', create: () => ({}) }
    },
    {
      id: 'dsh-todo-planner#todoPlanner/createTodo',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'createTodo',
      invocation: { kind: 'direct' },
      parameters: [{ name: 'input', wire: 'input', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-todo-planner#TodoInput', create: () => ({}) } }],
      result: { mode: 'strict', typeSymbol: 'dsh-todo-planner#todoPlanner/createTodo:result', create: () => ({}) }
    },
    {
      id: 'dsh-todo-planner#todoPlanner/updateTodo',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'updateTodo',
      invocation: { kind: 'direct' },
      parameters: [{ name: 'payload', wire: 'payload', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-todo-planner#TodoUpdatePayload', create: () => ({}) } }],
      result: { mode: 'strict', typeSymbol: 'dsh-todo-planner#todoPlanner/updateTodo:result', create: () => ({}) }
    },
    {
      id: 'dsh-todo-planner#todoPlanner/deleteTodo',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'deleteTodo',
      invocation: { kind: 'direct' },
      parameters: [{ name: 'id', wire: 'id', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-todo-planner#TodoId', create: () => '' } }],
      result: { mode: 'strict', typeSymbol: 'dsh-todo-planner#todoPlanner/deleteTodo:result', create: () => ({}) }
    },
    {
      id: 'dsh-todo-planner#todoPlanner/getSettings',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'getSettings',
      invocation: { kind: 'direct' },
      parameters: [],
      result: { mode: 'strict', typeSymbol: 'dsh-todo-planner#todoPlanner/getSettings:result', create: () => ({}) }
    },
    {
      id: 'dsh-todo-planner#todoPlanner/updateSettings',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'updateSettings',
      invocation: { kind: 'direct' },
      parameters: [{ name: 'patch', wire: 'patch', source: 'json', codec: { mode: 'strict', typeSymbol: 'dsh-todo-planner#SettingsPatch', create: () => ({}) } }],
      result: { mode: 'strict', typeSymbol: 'dsh-todo-planner#todoPlanner/updateSettings:result', create: () => ({}) }
    },
    {
      id: 'dsh-todo-planner#todoPlanner/getUsage',
      service: 'todoPlanner',
      namespace: 'todoPlanner',
      method: 'getUsage',
      invocation: { kind: 'direct' },
      parameters: [],
      result: { mode: 'strict', typeSymbol: 'dsh-todo-planner#todoPlanner/getUsage:result', create: () => ({}) }
    },
  ]
};

async function waitForTodoPlannerRemote() {
  await todoPlannerRemoteReady;
}

function todoPlannerRemote(ctx) {
  const service = ctx.get?.('remote.todoPlanner');
  if (!service) throw new Error('DSH Todo Planner Remote 尚未连接');
  return service;
}

function optionalTodoPlannerRemote(ctx = runtimeContext) {
  try {
    return ctx?.get?.('remote.todoPlanner') ?? ctx?.remote?.todoPlanner ?? null;
  } catch {
    return null;
  }
}

async function callTodoPlannerRemote(method, args) {
  await waitForTodoPlannerRemote();
  const service = optionalTodoPlannerRemote();
  if (!service || typeof service[method] !== 'function') throw new Error('DSH Todo Planner Remote 尚未连接');
  const response = await service[method](...args);
  if (response && typeof response === 'object' && Object.hasOwn(response, 'ok')) {
    if (!response.ok) throw new Error(response.error?.message ?? `DSH Todo Planner Remote ${method} failed`);
    return response.value;
  }
  return response;
}

  const inject = ['slots', 'sidebarRight', 'sidebarRightTabs', 'sessions', 'workspaces', 'uiWorkspace', 'remote', 'remote.session', 'remote.schedule'];

function useSettingsState() {
  const [value, setValue] = useState(settingsValue);
  useEffect(() => {
    settingsListeners.add(setValue);
    loadGlobalSettings();
    return () => settingsListeners.delete(setValue);
  }, []);
  return value;
}

function publishSettings(value) {
  settingsValue = {
    dailyTokenBudget: Number.isSafeInteger(value?.dailyTokenBudget) && value.dailyTokenBudget >= 0 ? value.dailyTokenBudget : DEFAULT_SETTINGS.dailyTokenBudget
  };
  settingsLoaded = true;
  for (const listener of settingsListeners) listener(settingsValue);
}

function loadGlobalSettings() {
  if (settingsLoaded) return Promise.resolve(settingsValue);
  if (settingsLoad) return settingsLoad;
  settingsLoad = callTodoPlannerRemote('getSettings', [])
    .then((value) => {
      publishSettings(value);
      return settingsValue;
    })
    .catch((error) => {
      settingsLoad = null;
      throw error;
    });
  return settingsLoad;
}

async function saveGlobalSettings(patch) {
  const value = await callTodoPlannerRemote('updateSettings', [patch]);
  publishSettings(value);
  return settingsValue;
}

function installModelDiscoveryUrlInput() {
  if (!document.body) return () => {};
  const rememberCatalog = (event) => {
    const catalog = event.target?.closest?.('.zGbnIq_modelCatalog');
    if (!catalog) return;
    if (lastModelDiscoveryCatalog && lastModelDiscoveryCatalog !== catalog) lastModelDiscoveryUrl = '';
    lastModelDiscoveryCatalog = catalog;
  };
  const addInput = () => {
    for (const catalog of document.querySelectorAll('.zGbnIq_modelCatalog')) {
      const failure = [...catalog.children].find((child) => child.matches?.('p.zGbnIq_error'));
      const existingField = catalog.previousElementSibling;
      if (!failure || existingField?.matches?.('[data-dsh-todo-planner-model-url-field]')) continue;
      const field = document.createElement('label');
      field.className = 'dsh-todo-planner-model-url-field';
      field.dataset.dshTodoPlannerModelUrlField = 'true';
      const label = document.createElement('span');
      label.textContent = '模型列表连接';
      const input = document.createElement('input');
      input.type = 'url';
      input.inputMode = 'url';
      input.autocomplete = 'url';
      input.placeholder = 'https://example.com/models';
      input.value = lastModelDiscoveryUrl;
      input.dataset.dshTodoPlannerModelUrl = 'true';
      input.addEventListener('focus', () => { lastModelDiscoveryCatalog = catalog; });
      input.addEventListener('input', () => {
        lastModelDiscoveryCatalog = catalog;
        lastModelDiscoveryUrl = input.value;
      });
      field.append(label, input);
      catalog.insertAdjacentElement('beforebegin', field);
    }
  };
  document.addEventListener('click', rememberCatalog, true);
  addInput();
  const observer = new MutationObserver(addInput);
  observer.observe(document.body, { subtree: true, childList: true });
  return () => {
    observer.disconnect();
    document.removeEventListener('click', rememberCatalog, true);
    document.querySelectorAll('[data-dsh-todo-planner-model-url-field]').forEach((field) => field.remove());
    lastModelDiscoveryCatalog = undefined;
  };
}

function installModelDiscoveryRemote(remote) {
  const originalFetch = window.fetch;
  if (typeof originalFetch !== 'function') return () => {};
  const wrappedFetch = async function fetchWithModelDiscoveryUrl(input, init) {
    const requestUrl = input instanceof Request ? input.url : String(input);
    let parsedUrl;
    try { parsedUrl = new URL(requestUrl, window.location.href); }
    catch { return originalFetch.call(this, input, init); }
    if (!parsedUrl.pathname.endsWith('/api/llm/discoverModels')) {
      return originalFetch.call(this, input, init);
    }

    const catalog = document.activeElement?.closest?.('.zGbnIq_modelCatalog') ?? lastModelDiscoveryCatalog;
    const precedingField = catalog?.previousElementSibling;
    const modelUrlInput = precedingField?.matches?.('[data-dsh-todo-planner-model-url-field]')
      ? precedingField.querySelector?.('[data-dsh-todo-planner-model-url]')
      : catalog?.querySelector?.('[data-dsh-todo-planner-model-url]');
    const entered = modelUrlInput?.value?.trim() ?? (catalog === lastModelDiscoveryCatalog ? lastModelDiscoveryUrl.trim() : '');
    if (!entered) return originalFetch.call(this, input, init);

    let body = typeof init?.body === 'string' ? init.body : undefined;
    if (body === undefined && input instanceof Request) body = await input.clone().text();
    if (typeof body !== 'string') return originalFetch.call(this, input, init);

    let message;
    try { message = JSON.parse(body); }
    catch { return originalFetch.call(this, input, init); }
    if (message?.method !== 'llm/discoverModels' || !message?.payload?.args?.request) {
      return originalFetch.call(this, input, init);
    }
    message.payload.args.request.baseURL = normalizeModelDiscoveryBaseURL(entered);
    const nextBody = JSON.stringify(message);
    if (init) return originalFetch.call(this, input, { ...init, body: nextBody });
    if (input instanceof Request) return originalFetch.call(this, new Request(input, { body: nextBody }));
    return originalFetch.call(this, input, { body: nextBody });
  };
  window.fetch = wrappedFetch;
  return () => {
    if (window.fetch === wrappedFetch) window.fetch = originalFetch;
  };
}

function normalizeModelDiscoveryBaseURL(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    url.pathname = url.pathname.replace(/\/models\/?$/i, '');
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/+$/, '');
  } catch {
    return raw.replace(/\/models\/?$/i, '').replace(/\/+$/, '');
  }
}

function TokenBudgetSettingsRow() {
  const settings = useSettingsState();
  const [draft, setDraft] = useState(String(settings.dailyTokenBudget));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => setDraft(String(settings.dailyTokenBudget)), [settings.dailyTokenBudget]);
  return h('div', { className: 'dsh-todo-planner-settings-row' },
    h('label', { className: 'dsh-todo-planner-settings-field' },
      h('span', null, '每日 Token 预算'),
      h('input', {
        type: 'number',
        value: draft,
        min: 0,
        max: 1000000000,
        step: 1000,
        inputMode: 'numeric',
        onChange: (event) => setDraft(event.target.value)
      })
    ),
    h(Button, {
      type: 'button', variant: 'outline', size: 'sm', disabled: saving || !/^\d+$/.test(draft) || Number(draft) > 1000000000 || Number(draft) === settings.dailyTokenBudget,
      onClick: async () => {
        setSaving(true);
        setError('');
        try { await saveGlobalSettings({ dailyTokenBudget: Number(draft) }); }
        catch (failure) { setError(failure.message); }
        finally { setSaving(false); }
      }
    }, saving ? '保存中' : '保存'),
    error ? h('span', { className: 'dsh-todo-planner-settings-error', role: 'alert' }, error) : null
  );
}

function reasoningEffortLabel(effort) {
  return ({ off: '关闭', low: '低', medium: '中', high: '高', xhigh: '极高' }[effort.id]) ?? effort.name ?? effort.id;
}

function modelSelectionKey(selection) {
  return `${selection.provider}\n${selection.model}`;
}

function buildDispatchModelChoices(catalog, previousSelection) {
  const entries = (catalog?.groups ?? []).flatMap((group) => (group.models ?? []).map((model) => ({ group, model })));
  const preferred = entries.find(({ group, model }) => group.id === catalog?.default?.provider && model.id === catalog.default.model);
  const initial = preferred ?? entries[0];
  const choices = entries.map(({ group, model }) => {
    const isPreferred = preferred?.group.id === group.id && preferred.model.id === model.id;
    const supportedEfforts = model.reasoning?.efforts ?? [];
    const isPrevious = previousSelection && modelSelectionKey(previousSelection) === modelSelectionKey({ provider: group.id, model: model.id });
    const previousEffort = isPrevious ? previousSelection.reasoningEffort : catalog?.default?.reasoningEffort;
    const reasoningEffort = (isPrevious || isPreferred) && previousEffort && supportedEfforts.some((effort) => effort.id === previousEffort)
      ? previousEffort
      : supportedEfforts.find((effort) => effort.id === model.reasoning?.defaultEffort)?.id;
    const selection = {
      provider: group.id,
      model: model.id,
      ...(reasoningEffort ? { reasoningEffort } : {})
    };
    return {
      key: modelSelectionKey(selection),
      providerName: group.name,
      modelName: model.name ?? model.id,
      reasoningEfforts: supportedEfforts,
      defaultEffort: supportedEfforts.find((effort) => effort.id === model.reasoning?.defaultEffort)?.id,
      selection
    };
  });
  const previous = previousSelection && choices.find((choice) => choice.key === modelSelectionKey(previousSelection));
  if (previous && !previousSelection.reasoningEffort) delete previous.selection.reasoningEffort;
  return {
    choices,
    selectedKey: previous?.key ?? (initial ? modelSelectionKey({ provider: initial.group.id, model: initial.model.id }) : ''),
    previousUnavailable: Boolean(previousSelection && (!previous || (previousSelection.reasoningEffort && !previous.reasoningEfforts.some((effort) => effort.id === previousSelection.reasoningEffort))))
  };
}

function DispatchModelSelect({ choices, selection, status, disabled, onChange, label = '执行模型', id = 'model', helpId }) {
  const [open, setOpen] = useState(false);
  const [menuWidth, setMenuWidth] = useState(0);
  const anchorRef = useRef(null);
  useEffect(() => {
    const element = anchorRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setMenuWidth(element.getBoundingClientRect().width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const selectedKey = selection ? modelSelectionKey(selection) : '';
  const selected = choices.find((choice) => choice.key === selectedKey);
  const providers = [...new Set(choices.map((choice) => choice.selection.provider))];
  const items = providers.flatMap((provider) => {
    const models = choices.filter((choice) => choice.selection.provider === provider);
    return [
      ...(models[0].providerName ? [{ type: 'label', id: `provider:${provider}`, text: models[0].providerName }] : []),
      ...models.map((choice) => ({
        id: choice.key,
        label: h('span', { className: 'dsh-todo-planner-dispatch-model-option' },
          h('span', null, choice.modelName),
          choice.providerName && choice.modelName !== choice.selection.model ? h('small', null, choice.selection.model) : null)
      }))
    ];
  });
  return h('div', { className: 'dsh-todo-planner-settings-field' },
    open ? h('style', null, `.dsh-todo-planner-dispatch-${id}-list{width:${menuWidth}px!important}`) : null,
    h('span', { id: `dsh-todo-planner-dispatch-${id}-label` }, label),
    h(Menu, {
      open: open && !disabled && status === 'ready',
      portal: true,
      autoFocus: true,
      className: 'dsh-todo-planner-dispatch-model-menu',
      listClassName: `dsh-todo-planner-dispatch-model-list dsh-todo-planner-dispatch-${id}-list`,
      getAnchorRect: () => anchorRef.current?.getBoundingClientRect() ?? null,
      selectedId: selectedKey,
      items,
      onClose: () => setOpen(false),
      onSelect: (key) => {
        const choice = choices.find((item) => item.key === key);
        if (choice) onChange(choice.selection);
        setOpen(false);
      },
      anchor: h('button', {
        type: 'button', className: 'dsh-todo-planner-dispatch-model-trigger',
        ref: anchorRef,
        disabled: disabled || status !== 'ready',
        'aria-labelledby': `dsh-todo-planner-dispatch-${id}-label dsh-todo-planner-dispatch-${id}-value`,
        'aria-describedby': helpId,
        'aria-haspopup': 'menu', 'aria-expanded': open,
        onClick: () => setOpen((value) => !value),
        onKeyDown: (event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); }
        }
      },
      h('span', { className: 'dsh-todo-planner-dispatch-model-value', id: `dsh-todo-planner-dispatch-${id}-value` },
        h('strong', null, selected?.modelName ?? (status === 'loading' ? '正在读取模型…' : '暂无可用模型')),
        selected?.providerName ? h('small', null, selected.providerName) : null),
      h(IconChevronDownOutlineRegular, { size: 16, 'aria-hidden': true }))
    })
  );
}

function DispatchDirectoryDialog({ initialPath, onSelect, onClose }) {
  const [path, setPath] = useState(initialPath);
  const [address, setAddress] = useState(initialPath ?? '');
  const [listing, setListing] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [showHidden, setShowHidden] = useState(false);
  const [creating, setCreating] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [saving, setSaving] = useState(false);
  const [native, setNative] = useState(false);
  const active = useRef(true);
  const ctx = runtimeContext;
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    setError('');
    ctx.uiWorkspace.listDirectory(path, controller.signal).then((next) => {
      if (controller.signal.aborted) return;
      setListing(next);
      setAddress(next.path);
      setStatus('ready');
    }).catch((failure) => {
      if (controller.signal.aborted) return;
      if (failure.rpcError?.code === 'directory-picker/unavailable' && failure.rpcError.details?.capability === 'native') {
        setNative(true);
        setStatus('ready');
        return;
      }
      setStatus('error');
      setError(`无法读取目录：${failure.message}`);
    });
    return () => controller.abort();
  }, [ctx, path, revision]);
  const navigate = (next) => {
    setCreating(false);
    setFolderName('');
    setStatus('loading');
    setPath(next);
    setRevision((value) => value + 1);
  };
  const parent = listing?.crumbs?.at(-2);
  const entries = (listing?.entries ?? []).filter((entry) => showHidden || !entry.hidden);
  const createFolder = async (event) => {
    event.preventDefault();
    if (saving || status !== 'ready' || !folderName.trim()) return;
    setSaving(true);
    setError('');
    try {
      const createdPath = await ctx.uiWorkspace.createDirectory(listing.path, folderName.trim());
      if (active.current) navigate(createdPath);
    } catch (failure) {
      if (active.current) setError(`无法新建文件夹：${failure.message}`);
    } finally {
      if (active.current) setSaving(false);
    }
  };
  const pickNative = async () => {
    setSaving(true);
    setError('');
    try {
      const selected = await (window.__DSH_DIRECTORY_PICKER__?.pick?.() ?? ctx.uiWorkspace.pickDirectory());
      if (active.current && selected) onSelect(selected);
    } catch (failure) {
      if (active.current) setError(`无法选择目录：${failure.message}`);
    } finally {
      if (active.current) setSaving(false);
    }
  };
  return h(Modal, {
    open: true, title: '选择工作目录', closeLabel: '取消', onClose: () => { if (!saving) onClose(); },
    className: 'dsh-todo-planner-modal dsh-todo-planner-directory-modal', contentClassName: 'dsh-todo-planner-directory-content',
    footer: h('div', { className: 'dsh-todo-planner-directory-footer' },
      !native ? h('label', { className: 'dsh-todo-planner-directory-hidden' },
        h('input', { type: 'checkbox', checked: showHidden, disabled: saving, onChange: (event) => setShowHidden(event.target.checked) }), '显示隐藏目录') : null,
      h('div', { className: 'dsh-todo-planner-directory-actions' },
        h(Button, { type: 'button', variant: 'ghost', size: 'sm', disabled: saving, onClick: onClose }, '取消'),
        h(Button, { type: 'button', variant: 'primary', size: 'sm', disabled: status !== 'ready' || saving || creating || (native && !address.trim()), onClick: () => onSelect(native ? address.trim() : listing.path) }, '使用此目录')))
  },
    h('div', { className: 'dsh-todo-planner-directory-browser' },
      h('form', { className: 'dsh-todo-planner-directory-address', onSubmit: (event) => { event.preventDefault(); if (!saving && address.trim()) { if (native) onSelect(address.trim()); else navigate(address.trim()); } } },
        h(IconActionButton, { type: 'button', variant: 'ghost', size: 'sm', label: '上一级目录', disabled: !parent || status !== 'ready' || saving, onClick: () => navigate(parent.path) }, h(IconChevronLeftOutlineRegular, { size: 16 })),
        h('input', { 'aria-label': '目录路径', 'data-modal-autofocus': true, value: address, disabled: saving, placeholder: '输入目录的完整路径', onChange: (event) => setAddress(event.target.value) }),
        h(IconActionButton, { type: 'submit', variant: 'ghost', size: 'sm', label: '打开路径', disabled: saving || !address.trim() }, h(IconChevronRightOutlineRegular, { size: 16 }))),
      !native ? h('div', { className: 'dsh-todo-planner-directory-toolbar' },
        h('span', null, '文件夹'),
        h(Button, { type: 'button', variant: 'ghost', size: 'sm', disabled: status !== 'ready' || saving, onClick: () => { setCreating((value) => !value); setFolderName(''); setError(''); } }, h(IconPlusOutlineRegular, { size: 14 }), '新建文件夹')) : null,
      creating ? h('form', { className: 'dsh-todo-planner-directory-create', onSubmit: createFolder },
        h('input', { 'aria-label': '新文件夹名称', autoFocus: true, value: folderName, disabled: saving, placeholder: '文件夹名称', onChange: (event) => setFolderName(event.target.value) }),
        h(Button, { type: 'submit', variant: 'outline', size: 'sm', disabled: saving || !folderName.trim() }, saving ? '创建中…' : '创建')) : null,
      error ? h('p', { className: 'dsh-todo-planner-settings-error', role: 'alert' }, error) : null,
      h('div', { className: 'dsh-todo-planner-directory-entries', 'aria-busy': status === 'loading' },
        native ? h('div', { className: 'dsh-todo-planner-directory-native' },
          h(IconFolderCloseRegular, { size: 28, 'aria-hidden': true }),
          h(Button, { type: 'button', variant: 'outline', size: 'sm', disabled: saving, onClick: pickNative }, saving ? '等待选择…' : '打开系统目录选择器'),
          h('p', { className: 'dsh-todo-planner-settings-help' }, '也可直接输入工作目录的完整路径。'))
          : status === 'loading' ? h('p', { className: 'dsh-todo-planner-settings-help', role: 'status' }, '正在读取目录…')
          : status === 'error' ? h(Button, { type: 'button', variant: 'outline', size: 'sm', onClick: () => navigate(path) }, h(IconRefreshOutlineRegular, { size: 14 }), '重试')
            : entries.length ? entries.map((entry) => h('button', {
              type: 'button', key: entry.path, className: 'dsh-todo-planner-directory-entry', disabled: saving,
              onClick: () => navigate(entry.path)
            }, h(IconFolderCloseRegular, { size: 17, 'aria-hidden': true }), h('span', null, entry.name), h(IconChevronRightOutlineRegular, { size: 14, 'aria-hidden': true })))
              : h('p', { className: 'dsh-todo-planner-settings-help' }, '此目录下没有可显示的子文件夹')),
      listing && status === 'ready' ? h('p', { className: 'dsh-todo-planner-directory-location' }, listing.path) : null,
      listing?.truncated ? h('p', { className: 'dsh-todo-planner-settings-help' }, '目录较多，仅显示部分文件夹；可输入完整路径继续。') : null)
  );
}

function apply(ctx) {
  runtimeContext = ctx;
  const effect = ctx.effect.bind(ctx);
  effect(() => {
    const mounted = ctx.remote.$mount(DSH_TODO_PLANNER_REMOTE);
    todoPlannerRemoteReady = mounted;
    return mounted;
  }, 'dsh-todo-planner: Remote contribution');
  effect(installStyles, 'dsh-todo-planner: styles');
  // This workaround remains targeted at model discovery failures and does
  // not replace Harness branding, copy, or settings chrome.
  effect(installModelDiscoveryUrlInput, 'dsh-todo-planner: model discovery URL input');
  effect(installModelDiscoveryRemote, 'dsh-todo-planner: model discovery URL override');
  effect(() => ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'dsh-todo-planner:daily-token-usage',
    order: 20
  }, TokenUsageSidebarItem)), 'dsh-todo-planner: daily token usage');
  effect(() => ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'dsh-todo-planner-daily-token-budget',
    order: 40
  }, TokenBudgetSettingsRow)), 'dsh-todo-planner: daily token budget general setting');
  effect(() => {
    loadGlobalSettings();
  }, 'dsh-todo-planner: settings');
  effect(() => ctx.sidebarRightTabs.register({
    id: TODO_TAB_ID,
    kind: TODO_TAB_KIND,
    title: () => '待办',
    guide: [{ id: 'todo-list', order: 20, title: () => '待办' }]
  }), 'dsh-todo-planner: right sidebar tab type');
  effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
    name: 'sidebar.right.pane.tab',
    key: TODO_TAB_ID
  }, TodoPanel)), 'dsh-todo-planner: right sidebar tab');
  effect(() => ctx.slots.inject('sidebar.right.pane.tab.title', () => ctx.slots.register({
    name: 'sidebar.right.pane.tab.title',
    key: TODO_TAB_ID
  }, TodoTabTitle)), 'dsh-todo-planner: persistent Todo tab title');
  effect(installTodoCloseGuard, 'dsh-todo-planner: prevent Todo tab closure');
  effect(() => ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'dsh-todo-planner:session-opener',
    order: 90
  }, SessionTodoOpener)), 'dsh-todo-planner: open todos in new sessions');
  function TodoTabTitle() {
    return h('span', { 'data-dsh-todo-planner-tab-title': true }, '待办');
  }

  function installTodoCloseGuard() {
    const preventClose = (event) => {
      if (event.code !== 'KeyW' || !event.altKey || !(event.metaKey || event.ctrlKey)) return;
      const activeTodo = document.querySelector('[data-sidebar-right-open] [role="tab"][aria-selected="true"] [data-dsh-todo-planner-tab-title]');
      if (!activeTodo) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    document.addEventListener('keydown', preventClose, true);
    return () => document.removeEventListener('keydown', preventClose, true);
  }

  function SessionTodoOpener() {
    useEffect(() => {
      let mounted = true;
      const opening = new Set();
      const timers = new Set();
      const hasTodoTab = (sessionId) => ctx.sidebarRight.openTabs.getSnapshot().some((tab) => tab.sessionId === sessionId && tab.kind === TODO_TAB_KIND);
      const openFor = (sessionId) => {
        if (!sessionId || hasTodoTab(sessionId) || opening.has(sessionId)) return;
        if (window.matchMedia('(max-width: 767px)').matches) return;
        opening.add(sessionId);
        let attempts = 0;
        const attempt = () => {
          timers.delete(timer);
          if (!mounted || ctx.sidebarRight.mounted.getSnapshot() !== sessionId) {
            opening.delete(sessionId);
            return;
          }
          if (hasTodoTab(sessionId)) {
            opening.delete(sessionId);
            return;
          }
          try {
            ctx.sidebarRight.openTab(TODO_TAB_KIND);
            opening.delete(sessionId);
          } catch {
            attempts += 1;
            if (attempts < 60) {
              timer = window.setTimeout(attempt, 50);
              timers.add(timer);
            } else opening.delete(sessionId);
          }
        };
        let timer = window.setTimeout(attempt, 0);
        timers.add(timer);
      };
      const ensureTodo = () => openFor(ctx.sidebarRight.mounted.getSnapshot());
      const unsubscribeMounted = ctx.sidebarRight.mounted.subscribe(ensureTodo);
      const unsubscribeTabs = ctx.sidebarRight.openTabs.subscribe(ensureTodo);
      openFor(ctx.sidebarRight.mounted.getSnapshot());
      return () => {
        mounted = false;
        unsubscribeMounted();
        unsubscribeTabs();
        for (const timer of timers) window.clearTimeout(timer);
      };
    }, []);
    return null;
  }
}

function TodoTopNavigation({ segment, onChange, onSearch, onFilter, onCreate, onRefresh, onCollapse }) {
  const options = [
    { value: 'today', label: '今日待办' },
    { value: 'plan', label: '计划' },
    { value: 'scheduled', label: '定时任务' }
  ];
  return h('nav', { className: 'dsh-todo-planner-topnav', 'aria-label': '待办视图' },
    h('div', { className: 'dsh-todo-planner-topnav-tabs', role: 'tablist', 'aria-label': '待办视图' }, options.map((option, index) => {
      const selected = segment === option.value;
      return h('button', {
        type: 'button',
        id: `dsh-todo-planner-todo-view-${option.value}`,
        role: 'tab',
        'aria-selected': selected,
        tabIndex: selected ? 0 : -1,
        className: `dsh-todo-planner-topnav-tab${selected ? ' is-active' : ''}`,
        onClick: () => onChange(option.value),
        onKeyDown: (event) => {
          const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
          if (!delta) return;
          event.preventDefault();
          const next = options[(index + delta + options.length) % options.length];
          onChange(next.value);
          document.getElementById(`dsh-todo-planner-todo-view-${next.value}`)?.focus();
        }
      }, option.label);
    })),
    h('div', { className: 'dsh-todo-planner-topnav-actions' },
      segment !== 'scheduled' ? h(IconActionButton, { type: 'button', variant: 'ghost', size: 'sm', className: 'dsh-todo-planner-topnav-action', icon: h(IconSearchOutlineRegular, { size: 18 }), label: '搜索待办', 'aria-pressed': onSearch.open, onClick: onSearch.toggle }) : null,
      segment !== 'scheduled' ? h(IconActionButton, { type: 'button', variant: 'ghost', size: 'sm', className: 'dsh-todo-planner-topnav-action', icon: h(IconSlidersTwoOutlineRegular, { size: 18 }), label: '筛选待办', 'aria-pressed': onFilter.open, onClick: onFilter.toggle }) : null,
      h(IconActionButton, { type: 'button', variant: 'ghost', size: 'sm', className: 'dsh-todo-planner-topnav-action dsh-todo-planner-create-action', icon: h(IconPlusOutlineRegular, { size: 17 }), label: segment === 'scheduled' ? '新建定时任务' : segment === 'plan' ? '新建计划' : '新建待办', disabled: onCreate.disabled, onClick: onCreate.run }),
      h(IconActionButton, { type: 'button', variant: 'ghost', size: 'sm', className: 'dsh-todo-planner-topnav-action', icon: h(IconRefreshOutlineRegular, { size: 17 }), label: segment === 'scheduled' ? '刷新定时任务' : '刷新列表', onClick: onRefresh }),
      h(IconActionButton, { type: 'button', variant: 'ghost', size: 'sm', className: 'dsh-todo-planner-topnav-action dsh-todo-planner-collapse-button', icon: h(IconChevronRightOutlineRegular, { size: 17 }), label: '折叠待办栏', onClick: onCollapse })
    )
  );
}

function TodoPanelTitle({ segment, todos, activeSchedules, scheduleCount, now, selectedPlanDate, planRangeDays = 7, onPlanDateSelect, onPlanRangeSelect, dataStatus }) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  useEffect(() => setCalendarOpen(false), [segment]);
  const planStart = startOfPlanRange(selectedPlanDate ? `${selectedPlanDate}T12:00:00` : now);
  const planEnd = new Date(planStart);
  planEnd.setDate(planEnd.getDate() + planRangeDays - 1);
  const rangeFormat = new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', ...(planStart.getFullYear() !== new Date(now).getFullYear() || planStart.getFullYear() !== planEnd.getFullYear() ? { year: 'numeric' } : {}) });
  const planRangeLabel = `${rangeFormat.format(planStart)} - ${rangeFormat.format(planEnd)}`;
  const todayTodos = selectTodos(todos, 'today', true, now);
  const values = segment === 'scheduled'
      ? [['已开启', activeSchedules], ['全部任务', scheduleCount]]
      : [['总任务', todayTodos.length], ['已完成', todayTodos.filter((todo) => todo.status === 'done').length], ['进行中', todayTodos.filter((todo) => todo.status === 'in_progress').length], ['待处理', todayTodos.filter((todo) => todo.status === 'todo').length]];
  return h('header', { className: `dsh-todo-planner-panel-title dsh-todo-planner-panel-title-${segment}`, 'aria-label': segment === 'plan' ? '计划导航与统计' : undefined },
    h('div', { className: 'dsh-todo-planner-panel-title-copy' },
      segment === 'plan'
        ? h('div', { className: 'dsh-todo-planner-plan-title-heading' }, h('h1', null, '计划'),
          h('div', { className: 'dsh-todo-planner-plan-title-actions' },
            h(PlanDateShortcuts, { now, selectedDate: selectedPlanDate, onSelect: onPlanDateSelect }),
            h(Tooltip, { label: '选择开始日期', delayMs: 350, focusDelayMs: 0 },
              h(Button, { type: 'button', variant: 'outline', size: 'sm', className: 'dsh-todo-planner-plan-calendar-trigger', icon: h(IconPlanOutlineRegular, { size: 16 }), 'aria-label': `选择计划日期，当前范围 ${planRangeLabel}`, 'aria-haspopup': 'dialog', 'aria-expanded': calendarOpen, onClick: () => setCalendarOpen(true) },
                h('span', null, planRangeLabel), h(IconChevronDownOutlineRegular, { size: 14, 'aria-hidden': true })))))
        : h('h1', null, segment === 'scheduled' ? '定时任务' : '今日待办'),
      segment !== 'plan' ? h('span', null, segment === 'scheduled' ? `${activeSchedules} 个运行中` : `今天　${formatDateWithWeekday(now)}`) : null
    ),
    segment === 'plan' ? h('div', { className: 'dsh-todo-planner-plan-date-navigation' },
      h(PlanSummary, { todos, now, selectedDate: selectedPlanDate, rangeDays: planRangeDays, dataStatus }),
      h(PlanWeekStrip, { now, selectedDate: selectedPlanDate, rangeDays: planRangeDays, onSelect: onPlanDateSelect })) : null,
    segment !== 'plan' ? h('div', { className: 'dsh-todo-planner-panel-title-metrics' }, values.map(([label, value]) => h('div', { className: 'dsh-todo-planner-panel-title-metric', key: label }, h('strong', null, formatNumber(value)), h('span', null, label)))) : null,
    h(Modal, { open: calendarOpen && segment === 'plan', onClose: () => setCalendarOpen(false), title: '选择计划范围', closeLabel: '关闭日历', className: 'dsh-todo-planner-plan-calendar-modal' },
      calendarOpen ? h(PlanCalendar, { todos, now, selectedDate: selectedPlanDate, rangeDays: planRangeDays, onApply: (key, days) => { onPlanRangeSelect(key, days); setCalendarOpen(false); } }) : null)
  );
}

function PlanDateShortcuts({ now, selectedDate, onSelect }) {
  const options = planDateShortcuts(now);
  return h('nav', { className: 'dsh-todo-planner-plan-shortcuts', 'aria-label': '快捷日期' },
    h('div', { className: 'dsh-todo-planner-plan-day-shortcuts', role: 'group', 'aria-label': '按日跳转' },
      options.map((option) => h('button', {
        type: 'button', key: option.label, 'aria-pressed': selectedDate === option.date,
        onClick: () => onSelect(option.date)
      }, option.label))));
}

function PlanSummary({ todos, now, selectedDate, rangeDays = 7, dataStatus = 'ready' }) {
  const summary = summarizePlan(todos, selectedDate, rangeDays, now);
  const hours = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 1 }).format(Math.ceil(summary.estimatedMinutes / 6) / 10);
  return h('section', { className: 'dsh-todo-planner-plan-summary', 'aria-label': '计划统计', 'aria-busy': dataStatus === 'loading' },
    dataStatus !== 'ready'
      ? h('p', { className: 'dsh-todo-planner-plan-summary-state', role: 'status' }, dataStatus === 'error' ? '统计暂不可用' : '正在读取统计')
      : h('dl', { className: 'dsh-todo-planner-plan-summary-metrics', 'aria-live': 'polite' },
          h('div', null, h('dt', null, h(IconCheckCircleOutlineRegular, { size: 14, 'aria-hidden': true }), '剩余任务'), h('dd', null, h('strong', null, formatNumber(summary.remainingCount)), h('span', null, '项'))),
          h('div', null, h('dt', null, h(IconClockOutlineRegular, { size: 14, 'aria-hidden': true }), '预计工时'), h('dd', null, h('strong', null, hours), h('span', null, '小时'))))
  );
}

function PlanWeekStrip({ now, selectedDate, rangeDays = 7, onSelect }) {
  const start = startOfPlanRange(`${selectedDate}T12:00:00`);
  const days = Array.from({ length: Math.min(rangeDays, 366) }, (_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    return date;
  });
  const todayKey = localDateKey(new Date(now));
  return h('div', { className: 'dsh-todo-planner-plan-week-strip', 'aria-label': '计划日期' },
    h(IconActionButton, { type: 'button', variant: 'ghost', size: 'sm', className: 'dsh-todo-planner-plan-week-arrow', icon: h(IconChevronLeftOutlineRegular, { size: 15 }), label: rangeDays === 7 ? '前七天' : `前${rangeDays}天`, onClick: () => onSelect(localDateKey(startOfPlanRange(start, -1, rangeDays))) }),
    h('div', { className: `dsh-todo-planner-plan-week-days${rangeDays > 7 ? ' is-long-range' : ''}` }, days.map((date) => {
      const key = localDateKey(date);
      const selected = key === selectedDate;
      return h('button', { type: 'button', key, 'data-plan-day': key, 'aria-label': formatDateWithWeekday(date), 'aria-pressed': selected, 'aria-current': key === todayKey ? 'date' : undefined, className: `dsh-todo-planner-plan-week-day${selected ? ' is-selected' : ''}`, onClick: () => onSelect(key) },
        h('strong', null, key === todayKey ? '今天' : formatIsoWeekday(date.getDay() || 7)),
        h('span', null, String(date.getDate())));
    })),
    h(IconActionButton, { type: 'button', variant: 'ghost', size: 'sm', className: 'dsh-todo-planner-plan-week-arrow', icon: h(IconChevronRightOutlineRegular, { size: 15 }), label: rangeDays === 7 ? '后七天' : `后${rangeDays}天`, onClick: () => onSelect(localDateKey(startOfPlanRange(start, 1, rangeDays))) })
  );
}

function PlanCalendar({ todos = [], now, selectedDate, rangeDays = 7, onApply }) {
  const [month, setMonth] = useState(() => new Date(`${selectedDate}T12:00:00`));
  const [yearInput, setYearInput] = useState(() => String(month.getFullYear()));
  const [focusedDate, setFocusedDate] = useState(selectedDate);
  const [draftStart, setDraftStart] = useState(selectedDate);
  const [draftEnd, setDraftEnd] = useState(() => planDateRange(selectedDate, rangeDays).last);
  const [rangeMode, setRangeMode] = useState([7, 30].includes(rangeDays) ? String(rangeDays) : 'custom');
  const [rangeEdge, setRangeEdge] = useState('start');
  const [agendaDate, setAgendaDate] = useState(selectedDate);
  const calendarRef = useRef(null);
  const days = planCalendarDays(month);
  const today = localDateKey(new Date(now));
  const count = planRangeLength(draftStart, draftEnd);
  const tasksByDate = planCalendarTasks(todos);
  const agendaTasks = tasksByDate.get(agendaDate) ?? [];
  const focusKey = days.some((day) => localDateKey(day) === focusedDate) ? focusedDate : localDateKey(new Date(month.getFullYear(), month.getMonth(), 1));
  const chooseStart = (key) => {
    setDraftStart(key);
    setAgendaDate(key);
    if (rangeMode !== 'custom') setDraftEnd(planDateRange(key, Number(rangeMode)).last);
    else if (draftEnd < key) setDraftEnd(key);
  };
  const choosePreset = (mode) => {
    setRangeMode(mode);
    setRangeEdge('start');
    if (mode !== 'custom') setDraftEnd(planDateRange(draftStart, Number(mode)).last);
  };
  const chooseDay = (key) => {
    if (rangeMode === 'custom' && rangeEdge === 'end') {
      if (key < draftStart) { setDraftStart(key); setDraftEnd(draftStart); }
      else setDraftEnd(key);
      setAgendaDate(key);
      setRangeEdge('start');
    } else {
      chooseStart(key);
      if (rangeMode === 'custom') setRangeEdge('end');
    }
  };
  const changeMonth = (next) => {
    if (next.getFullYear() < 1900 || next.getFullYear() > 9999) return;
    setMonth(next);
    setYearInput(String(next.getFullYear()));
  };
  const stepMonth = (amount) => changeMonth(new Date(month.getFullYear(), month.getMonth() + amount, 1, 12));
  useEffect(() => {
    calendarRef.current?.querySelector(`[data-calendar-date="${focusedDate}"]`)?.focus();
  }, [focusedDate]);
  const moveFocus = (event, date) => {
    const next = new Date(date);
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
    if (delta) next.setDate(next.getDate() + delta);
    else if (event.key === 'Home') next.setDate(next.getDate() - (next.getDay() + 6) % 7);
    else if (event.key === 'End') next.setDate(next.getDate() + 6 - (next.getDay() + 6) % 7);
    else if (event.key === 'PageUp' || event.key === 'PageDown') {
      const day = next.getDate();
      next.setDate(1);
      next.setMonth(next.getMonth() + (event.key === 'PageUp' ? -1 : 1));
      next.setDate(Math.min(day, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
    } else return;
    event.preventDefault();
    if (next.getFullYear() < 1900 || next.getFullYear() > 9999) return;
    changeMonth(next);
    setFocusedDate(localDateKey(next));
  };
  return h('div', { className: 'dsh-todo-planner-plan-calendar', ref: calendarRef },
    h('div', { className: 'dsh-todo-planner-calendar-range-controls' },
      h('div', { className: 'dsh-todo-planner-calendar-range-presets', role: 'group', 'aria-label': '计划范围长度' },
        [['7', '七天'], ['30', '三十天'], ['custom', '自定义']].map(([value, label]) => h('button', { type: 'button', key: value, 'aria-pressed': rangeMode === value, onClick: () => choosePreset(value) }, label))),
      h('div', { className: 'dsh-todo-planner-calendar-range-inputs' },
        h('label', { className: rangeEdge === 'start' ? 'is-active' : undefined }, '开始', h('input', { type: 'date', min: '1900-01-01', max: '9999-12-31', 'aria-label': '范围开始日期', value: draftStart, onFocus: () => setRangeEdge('start'), onChange: (event) => {
          const key = event.target.value;
          if (planRangeLength(key, key)) { chooseStart(key); changeMonth(new Date(`${key}T12:00:00`)); }
        } })),
        h('label', { className: rangeMode === 'custom' && rangeEdge === 'end' ? 'is-active' : undefined }, '结束', h('input', { type: 'date', min: draftStart, max: '9999-12-31', 'aria-label': '范围结束日期', value: draftEnd, onFocus: () => { setRangeEdge('end'); }, onChange: (event) => { setRangeMode('custom'); setDraftEnd(event.target.value); } })))),
    h('div', { className: 'dsh-todo-planner-calendar-toolbar' },
      h(IconActionButton, { type: 'button', variant: 'ghost', size: 'sm', icon: h(IconChevronLeftOutlineRegular, { size: 16 }), label: '上个月', disabled: month.getFullYear() === 1900 && month.getMonth() === 0, onClick: () => stepMonth(-1) }),
      h('label', { className: 'dsh-todo-planner-calendar-year' },
        h('input', { type: 'number', min: 1900, max: 9999, 'aria-label': '年份', value: yearInput,
          onChange: (event) => {
            const value = event.target.value;
            setYearInput(value);
            if (/^\d{4}$/.test(value) && Number(value) >= 1900) setMonth(new Date(Number(value), month.getMonth(), 1, 12));
          },
          onBlur: () => setYearInput(String(month.getFullYear())),
          onKeyDown: (event) => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); } } }), '年'),
      h('select', { 'aria-label': '月份', value: month.getMonth(), onChange: (event) => changeMonth(new Date(month.getFullYear(), Number(event.target.value), 1, 12)) },
        Array.from({ length: 12 }, (_, index) => h('option', { key: index, value: index }, `${index + 1}月`))),
      h(IconActionButton, { type: 'button', variant: 'ghost', size: 'sm', icon: h(IconChevronRightOutlineRegular, { size: 16 }), label: '下个月', disabled: month.getFullYear() === 9999 && month.getMonth() === 11, onClick: () => stepMonth(1) })
    ),
    h('div', { className: 'dsh-todo-planner-calendar-layout' },
    h('div', { className: 'dsh-todo-planner-calendar-grid', role: 'grid', 'aria-label': `${month.getFullYear()}年${month.getMonth() + 1}月` },
      h('div', { className: 'dsh-todo-planner-calendar-weekdays', role: 'row' }, ['一', '二', '三', '四', '五', '六', '日'].map((label) => h('span', { key: label, role: 'columnheader', 'aria-label': `星期${label}` }, label))),
      Array.from({ length: 6 }, (_, week) => h('div', { className: 'dsh-todo-planner-calendar-week', role: 'row', key: week }, days.slice(week * 7, week * 7 + 7).map((date) => {
        const key = localDateKey(date);
        const selected = key === draftStart;
        const tasks = tasksByDate.get(key) ?? [];
        const highestPriority = ['urgent', 'high', 'normal', 'low'].find((priority) => tasks.some((todo) => (todo.priority ?? 'normal') === priority)) ?? 'normal';
        const valid = date.getFullYear() >= 1900 && date.getFullYear() <= 9999;
        return h('div', { role: 'gridcell', 'aria-selected': key >= draftStart && key <= draftEnd, key, className: `dsh-todo-planner-calendar-cell${key >= draftStart && key <= draftEnd ? ' is-in-range' : ''}${selected || key === draftEnd ? ' is-selected' : ''}${date.getMonth() !== month.getMonth() ? ' is-outside' : ''}` },
          h('button', {
          type: 'button',
          'data-calendar-date': key,
          'data-modal-autofocus': key === selectedDate ? true : undefined,
          'aria-label': `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`,
          'aria-current': key === today ? 'date' : undefined,
          tabIndex: key === focusKey ? 0 : -1,
          disabled: !valid,
          className: 'dsh-todo-planner-calendar-day',
          onClick: () => chooseDay(key),
          onKeyDown: (event) => moveFocus(event, date)
        },
          h('span', { className: 'dsh-todo-planner-calendar-day-heading' },
            h('span', { className: 'dsh-todo-planner-calendar-day-number' }, date.getDate()),
            tasks.length ? h('span', { className: `dsh-todo-planner-calendar-day-count dsh-todo-planner-task-priority-${highestPriority}`, 'aria-label': `${tasks.length}项计划` }, tasks.length, h('span', { className: 'dsh-todo-planner-calendar-count-unit' }, '项')) : null),
          h('span', { className: 'dsh-todo-planner-calendar-tasks' }, tasks.slice(0, 2).map((todo) => h('span', { key: todo.id, title: `${todo.title} · ${priorityLabel(todo.priority)}优先级`, className: `dsh-todo-planner-calendar-task dsh-todo-planner-task-priority-${todo.priority ?? 'normal'}${todo.status === 'done' ? ' is-done' : ''}` }, todo.title))),
          tasks.length > 2 ? h('span', { className: 'dsh-todo-planner-calendar-more' }, `+${tasks.length - 2} 项`) : null));
      })))
    ),
    h('section', { className: 'dsh-todo-planner-calendar-agenda', 'aria-label': '当日计划' },
      h('div', { className: 'dsh-todo-planner-calendar-agenda-heading' },
        h('h3', null, formatDateWithWeekday(`${agendaDate}T12:00:00`)),
        h('span', null, `${agendaTasks.length} 项计划`)),
      agendaTasks.length ? h('ul', null, agendaTasks.map((todo) => h('li', { key: todo.id },
        h('div', { className: 'dsh-todo-planner-calendar-agenda-time' },
          h('time', null, formatTime(todo.startAt)),
          h('span', null, todo.estimatedMinutes ? formatDurationMinutes(todo.estimatedMinutes) : '未估时')),
        h('div', { className: 'dsh-todo-planner-calendar-agenda-copy' },
          h('span', { className: `dsh-todo-planner-calendar-task dsh-todo-planner-task-priority-${todo.priority ?? 'normal'}${todo.status === 'done' ? ' is-done' : ''}` }, todo.title),
          h('span', { className: 'dsh-todo-planner-calendar-task-meta' }, `${priorityLabel(todo.priority)} · ${statusLabel(todo.status)}`))))) : h('p', null, '当天暂无计划'))),
    h('div', { className: 'dsh-todo-planner-calendar-footer' },
      h('span', { role: 'status', className: count < 1 || count > 366 ? 'dsh-todo-planner-error' : undefined }, count < 1 ? '结束日期不能早于开始日期' : count > 366 ? '请选择不超过 366 天的范围' : `${draftStart.replaceAll('-', '/')} - ${draftEnd.replaceAll('-', '/')} · ${count} 天`),
      h('div', null,
        h(Button, { type: 'button', variant: 'ghost', size: 'sm', onClick: () => { chooseStart(today); changeMonth(new Date(`${today}T12:00:00`)); } }, '回到今天'),
        h(Button, { type: 'button', variant: 'primary', size: 'sm', disabled: count < 1 || count > 366, onClick: () => onApply(draftStart, count) }, '应用范围')))
  );
}

function planCalendarDays(value) {
  const start = new Date(value);
  start.setHours(12, 0, 0, 0);
  start.setDate(1);
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + index);
    return date;
  });
}

function startOfPlanRange(value, offset = 0, rangeDays = 7) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset * rangeDays);
  return date;
}

function planDateRange(dateKey, rangeDays = 7) {
  const end = startOfPlanRange(`${dateKey}T12:00:00`, 1, rangeDays);
  const last = new Date(end);
  last.setDate(last.getDate() - 1);
  return { start: dateKey, end: localDateKey(end), last: localDateKey(last) };
}

function planRangeLength(start, end) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) return 0;
  const first = Date.parse(`${start}T00:00:00Z`);
  const last = Date.parse(`${end}T00:00:00Z`);
  if (!Number.isFinite(first) || !Number.isFinite(last) || new Date(first).toISOString().slice(0, 10) !== start || new Date(last).toISOString().slice(0, 10) !== end) return 0;
  return Math.max(0, Math.round((last - first) / 86400000) + 1);
}

function planCalendarTasks(todos) {
  const groups = new Map();
  for (const todo of todos) {
    if (!todo.startAt || ['canceled', 'archived'].includes(todo.status)) continue;
    const date = new Date(todo.startAt);
    if (!Number.isFinite(date.getTime())) continue;
    const key = localDateKey(date);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(todo);
  }
  for (const tasks of groups.values()) tasks.sort(compareTimeline);
  return groups;
}

function planDateShortcuts(now = Date.now()) {
  const today = new Date(now);
  today.setHours(12, 0, 0, 0);
  const offsetDay = (amount) => {
    const date = new Date(today);
    date.setDate(date.getDate() + amount);
    return localDateKey(date);
  };
  return [
    { label: '昨天', date: offsetDay(-1) },
    { label: '今天', date: offsetDay(0) },
    { label: '明天', date: offsetDay(1) }
  ];
}

function summarizePlan(todos, selectedDate, rangeDays = 7, now = Date.now()) {
  const today = localDateKey(new Date(now));
  const range = planDateRange(selectedDate ?? today, rangeDays);
  const active = todos.filter(isActiveTodo);
  const parents = new Set(active.map((todo) => todo.parentId).filter(Boolean));
  const result = { ...range, remainingCount: 0, estimatedMinutes: 0, unestimatedCount: 0, unscheduledCount: 0, carriedCount: 0 };
  // Count executable steps once; parent estimates commonly include their subtasks.
  for (const todo of active) {
    if (parents.has(todo.id)) continue;
    const date = new Date(todo.startAt ?? '');
    if (Number.isNaN(date.getTime())) {
      result.unscheduledCount += 1;
      continue;
    }
    const key = localDateKey(date);
    if (key >= range.end || key < range.start) continue;
    result.remainingCount += 1;
    if (Number.isFinite(todo.estimatedMinutes) && todo.estimatedMinutes > 0) result.estimatedMinutes += todo.estimatedMinutes;
    else result.unestimatedCount += 1;
  }
  return result;
}

function TodoPanel() {
  const ctx = runtimeContext;
  const [collapsed, setCollapsed] = useState(false);
  const [segment, setSegment] = useState('today');
  const [showCompleted, setShowCompleted] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [planStartDate, setPlanStartDate] = useState(null);
  const [planRangeDays, setPlanRangeDays] = useState(7);
  const listRef = useRef(null);
  const [dialog, setDialog] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState('');
  const [mutation, setMutation] = useState(false);
  const [dispatchingId, setDispatchingId] = useState(null);
  const [clock, setClock] = useState(Date.now());
  const selectedPlanDate = planStartDate ?? localDateKey(new Date(clock));
  const { data, error, refresh } = useApiData('todos', 5000);
  const [schedule, setSchedule] = useState({ status: 'idle', records: [], error: '' });
  const [scheduleRevision, setScheduleRevision] = useState(0);
  const [scheduleQuery, setScheduleQuery] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState('all');
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [scheduleDetailTab, setScheduleDetailTab] = useState('rule');
  const todos = data?.todos ?? [];
  const visible = selectTodos(todos, segment, showCompleted, clock, selectedPlanDate, planRangeDays).filter((todo) => {
    if (segment === 'today' && isOverdueTodo(todo, clock)) return true;
    const matchesQuery = !query.trim() || `${todo.title} ${todo.notes ?? ''}`.toLocaleLowerCase('zh-CN').includes(query.trim().toLocaleLowerCase('zh-CN'));
    const matchesPriority = priorityFilter === 'all' || todo.priority === priorityFilter;
    return matchesQuery && matchesPriority;
  });
  const stats = data?.stats ?? {};

  useEffect(() => {
    if (segment !== 'scheduled') return undefined;
    let active = true;
    const load = async () => {
      setSchedule((current) => ({ ...current, status: current.records.length ? 'refreshing' : 'loading' }));
      try {
        await waitForTodoPlannerRemote();
        if (!active) return;
        const result = await ctx.remote.schedule.catalog();
        if (!active) return;
        if (!result.ok) {
          setSchedule((current) => ({ ...current, status: 'error', error: result.error?.message ?? '无法读取定时任务' }));
          return;
        }
        setSchedule({ status: 'ready', records: result.value, error: '' });
      } catch (failure) {
        if (active) setSchedule((current) => ({ ...current, status: 'error', error: failure.message }));
      }
    };
    load();
    const timer = window.setInterval(load, 10000);
    const unsubscribeChange = ctx.remote.$on('schedule/changed', load);
    const unsubscribeReset = ctx.on('connection/reset', load);
    return () => {
      active = false;
      window.clearInterval(timer);
      unsubscribeChange?.();
      unsubscribeReset?.();
    };
  }, [segment, scheduleRevision]);

  const retrySchedule = () => {
    setSchedule((current) => ({ ...current, status: 'loading' }));
    setScheduleRevision((revision) => revision + 1);
  };
  const scheduleRecords = [...schedule.records].sort((left, right) => {
    if (left.status !== right.status) return left.status === 'active' ? -1 : 1;
    return Date.parse(left.scheduledAt) - Date.parse(right.scheduledAt);
  });
  const filteredScheduleRecords = scheduleRecords.filter((record) => {
    if (scheduleFilter === 'active' && record.status !== 'active') return false;
    if (scheduleFilter === 'inactive' && record.status !== 'inactive') return false;
    const queryText = scheduleQuery.trim().toLocaleLowerCase('zh-CN');
    return !queryText || `${record.title} ${record.prompt} ${record.sessionId}`.toLocaleLowerCase('zh-CN').includes(queryText);
  });
  const selectedSchedule = schedule.records.find((record) => record.id === selectedScheduleId) ?? null;
  const activeSchedules = schedule.records.filter((record) => record.status === 'active').length;

  useEffect(() => {
    if (schedule.status === 'ready' && selectedScheduleId && !schedule.records.some((record) => record.id === selectedScheduleId)) {
      setSelectedScheduleId(null);
    }
  }, [schedule.status, schedule.records, selectedScheduleId]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (segment === 'plan' && listRef.current) listRef.current.scrollTop = 0;
  }, [segment, selectedPlanDate, planRangeDays]);

  useEffect(() => {
    const onMobileTodoOpen = (event) => {
      if (event.detail?.open) setCollapsed(false);
    };
    window.addEventListener('dsh-todo-planner:mobile-todo-open', onMobileTodoOpen);
    return () => window.removeEventListener('dsh-todo-planner:mobile-todo-open', onMobileTodoOpen);
  }, []);

  if (collapsed) {
    return h('section', { className: 'dsh-todo-planner-panel dsh-todo-planner-panel-collapsed', 'data-dsh-todo-planner-collapsed': true, 'aria-label': '待办统计' },
      h(IconActionButton, { type: 'button', variant: 'ghost', size: 'sm', className: 'dsh-todo-planner-expand-button', icon: h(IconChevronLeftOutlineRegular, { size: 16 }), label: '展开待办栏', onClick: () => setCollapsed(false) }),
      h('div', { className: 'dsh-todo-planner-compact-stats' }, [
        ['全部', stats.total ?? todos.length], ['待办', stats.todo ?? 0], ['进行', stats.inProgress ?? 0], ['完成', stats.done ?? 0]
      ].map(([label, value]) => h('div', { className: 'dsh-todo-planner-compact-stat', key: label, title: `${label} ${formatNumber(value)}` }, h('span', null, label), h('strong', null, formatNumber(value)))))
    );
  }

  const mutateTodo = async (method, path, value) => {
    setMutation(true);
    setNotice('');
    try {
      const todoId = decodeURIComponent(path.slice('todos/'.length));
      if (method === 'DELETE') await callTodoPlannerRemote('deleteTodo', [todoId]);
      else await callTodoPlannerRemote('updateTodo', [{ id: todoId, patch: value ?? {} }]);
      await refresh();
      setNotice(method === 'DELETE' ? '待办已删除' : '待办已更新');
    } catch (failure) {
      setNotice(`操作失败：${failure.message}`);
    } finally {
      setMutation(false);
    }
  };

  const dispatchTodo = async (todo, { markInProgress = true, dispatchId = todo.id, modelSelection, workspacePath, directoryMode = 'choose', preferenceKey = todo.id } = {}) => {
    setDispatchingId(dispatchId ?? 'dispatching');
    setNotice('');
    let newSessionId;
    let modelSaveFailed = false;
    try {
      const workspaceClient = ctx.workspaces ?? ctx.get?.('workspaces');
      const sessionClient = ctx.sessions ?? ctx.get?.('sessions');
      if (!workspacePath) throw new Error('请先选择工作目录');
      if (!workspaceClient) throw new Error('工作区服务尚未连接');
      if (!sessionClient) throw new Error('会话服务尚未连接');
      const workspace = await workspaceClient.create({ path: workspacePath });
      // ClientSessions.create() resolves to the new id and throws a typed error on failure.
      newSessionId = await sessionClient.create({ workspaceId: workspace.workspaceId });
      if (modelSelection) {
        const selected = await ctx.remote.session.selectModel({ sessionId: newSessionId, ...modelSelection });
        if (!selected.ok) throw new Error(selected.error?.message ?? '无法为新会话选择模型');
        try {
          await waitForTodoPlannerRemote();
          const saved = await todoPlannerRemote(ctx).setDefaultModel(modelSelection);
          if (!saved.ok) modelSaveFailed = true;
        } catch {
          modelSaveFailed = true;
        }
      }
      const content = [
        todo.id
          ? `请完成以下任务。开始前先调用 todo_list，执行过程中持续更新这条待办的状态和进展，完成后说明结果并将它标记为 done。`
          : '请处理以下定时任务，并在完成后说明结果。',
        todo.id ? `待办 ID：${todo.id}` : '',
        `标题：${todo.title}`,
        `工作目录：${workspace.path}\n请在此目录中查找相关文件并保存本任务的产物；完成后列出产物的完整路径。`,
        todo.notes ? `详情：\n${todo.notes}` : '',
        `优先级：${priorityLabel(todo.priority)}`,
        todo.startAt ? `计划开始：${todo.startAt}` : '',
        todo.dueAt ? `截止时间：${todo.dueAt}` : '',
        todo.estimatedMinutes ? `预估工作量：${formatMinutes(todo.estimatedMinutes)}` : ''
      ].filter(Boolean).join('\n\n');
      const sent = await ctx.remote.session.prompt({ requestId: crypto.randomUUID(), sessionId: newSessionId, mode: 'queue', content: [{ type: 'text', text: content }], clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      if (!sent.ok) throw new Error(sent.error?.message ?? '任务未能发送到新会话');
      const dispatchOptions = { modelSelection, directoryMode, directoryPath: workspace.path };
      rememberDispatchOptions(preferenceKey, dispatchOptions);
      let noticeText = modelSaveFailed ? '任务已交给 Harness，但所选模型未能保存为默认值' : '任务已交给 Harness';
      if (todo.id) {
        try {
          const patch = { sessionId: newSessionId, dispatchOptions };
          if (markInProgress) patch.status = 'in_progress';
          await callTodoPlannerRemote('updateTodo', [{ id: todo.id, patch }]);
          await refresh();
        } catch {
          noticeText = '任务已交给 Harness，但会话关联未能保存';
        }
      }
      setNotice(noticeText);
      try { openHarnessSession(ctx, newSessionId); }
      catch (failure) { setNotice(`任务已交给 Harness，但会话打开失败：${failure.message}`); }
      return true;
    } catch (failure) {
      throw new Error(`交给 Harness 失败：${failure.message}`);
    } finally {
      setDispatchingId(null);
    }
  };
  const loadDispatchModels = async (confirmationId, previousOptions) => {
    setConfirmation((current) => current?.id === confirmationId
      ? { ...current, modelStatus: 'loading', modelError: '' }
      : current);
    try {
      const result = await ctx.remote.session.modelCatalog();
      if (!result.ok) throw new Error(result.error?.message ?? '模型目录读取失败');
      const { choices, selectedKey, previousUnavailable } = buildDispatchModelChoices(result.value, previousOptions?.modelSelection);
      if (!choices.length) throw new Error('没有可用模型，请先在设置中配置 Provider');
      const initialChoice = choices.find((choice) => choice.key === selectedKey) ?? choices[0];
      setConfirmation((current) => current?.id === confirmationId
        ? { ...current, modelStatus: 'ready', modelError: '', modelOptions: choices, modelSelection: initialChoice.selection, modelNotice: previousUnavailable ? '上次的模型或思考深度已不可用，已切换为可用设置。' : '' }
        : current);
    } catch (failure) {
      setConfirmation((current) => current?.id === confirmationId
        ? { ...current, modelStatus: 'error', modelError: failure.message }
        : current);
    }
  };
  const dispatchSchedule = (record) => askConfirmation('dispatch', {
    title: record.title,
    notes: record.prompt,
    priority: 'normal',
    dispatchKey: `schedule:${record.sessionId}:${record.id}`
  }, (modelSelection, workspacePath, directoryMode) => dispatchTodo({ title: record.title, notes: record.prompt, priority: 'normal' }, {
    markInProgress: false,
    dispatchId: record.id,
    modelSelection,
    workspacePath,
    directoryMode,
    preferenceKey: `schedule:${record.sessionId}:${record.id}`
  }));
  const handleScheduleDelete = async (record) => {
    const result = await ctx.remote.schedule.delete({ sessionId: record.sessionId, id: record.id });
    if (!result.ok || !result.value.deleted) throw new Error(result.value?.code ?? result.error?.message ?? '删除未完成');
    setScheduleRevision((revision) => revision + 1);
    setSelectedScheduleId(null);
    setNotice('定时任务已删除');
    return true;
  };
  const saveSchedule = async (record, values, change) => {
    const result = await ctx.remote.schedule.update({ sessionId: record.sessionId, id: record.id, expected: scheduleExpectedRecord(record), title: values.title.trim(), prompt: values.prompt.trim(), ...(change ? { change } : {}) });
    if (!result.ok) throw new Error(result.error?.message ?? '保存失败');
    if (!result.value.updated) throw new Error(result.value.code ?? result.value.message ?? '任务已变化，请刷新后重试');
    setScheduleRevision((revision) => revision + 1);
    setDialog(null);
    setNotice('定时任务已更新');
    return true;
  };
  const createSchedule = async (request) => {
    await waitForTodoPlannerRemote();
    const sessionId = ctx.sidebarRight.mounted.getSnapshot();
    if (!sessionId) throw new Error('请先打开一个会话');
    const result = await todoPlannerRemote(ctx).createSchedule({ sessionId, request });
    if (!result.ok) throw new Error(result.error?.message ?? '定时任务创建失败');
    setScheduleRevision((revision) => revision + 1);
    setDialog(null);
    setNotice('定时任务已创建');
  };

  const askConfirmation = (kind, todo, action) => {
    const next = { id: crypto.randomUUID(), kind, todo, action };
    if (kind === 'dispatch') {
      next.modelStatus = 'loading';
      next.modelOptions = [];
      next.modelSelection = null;
      next.modelError = '';
      const sessionClient = ctx.sessions ?? ctx.get?.('sessions');
      const sessionSummaries = sessionClient?.list?.getSnapshot?.().byId ?? {};
      const currentSession = Object.values(sessionSummaries).find((session) => session.retainedBy?.mainView > 0)
        ?? sessionSummaries[ctx.sidebarRight.mounted.getSnapshot()];
      const workspaceClient = ctx.workspaces ?? ctx.get?.('workspaces');
      next.currentWorkspace = workspaceClient?.list?.getSnapshot?.().items?.find((item) => item.sessionIds.includes(currentSession?.id))
        ?? (currentSession?.cwd ? { path: currentSession.cwd } : undefined);
      next.previousOptions = readDispatchOptions(todo.dispatchKey ?? todo.id) ?? todo.dispatchOptions;
      next.directoryMode = next.previousOptions?.directoryMode === 'current' && next.previousOptions.directoryPath === next.currentWorkspace?.path ? 'current' : 'choose';
      next.directoryPath = next.previousOptions?.directoryPath ?? '';
      next.directoryPickerOpen = false;
    }
    setConfirmation(next);
    if (kind === 'dispatch') loadDispatchModels(next.id, next.previousOptions);
  };
  const confirmAction = async () => {
    if (!confirmation) return;
    const pending = confirmation;
    const workspacePath = pending.directoryMode === 'current' ? pending.currentWorkspace?.path : pending.directoryPath;
    if (pending.kind === 'dispatch' && (!pending.modelSelection || pending.modelStatus !== 'ready' || !workspacePath || pending.directoryPickerOpen)) return;
    setConfirming(true);
    try {
      const result = await pending.action(pending.modelSelection, workspacePath, pending.directoryMode);
      if (result !== false) setConfirmation(null);
    } catch (failure) {
      setConfirmation((current) => current?.id === pending.id ? { ...current, error: failure.message } : current);
    } finally {
      setConfirming(false);
    }
  };
  const todoAction = (todo, kind) => {
    if (kind === 'dispatch') return askConfirmation('dispatch', todo, (modelSelection, workspacePath, directoryMode) => dispatchTodo(todo, { modelSelection, workspacePath, directoryMode }));
    if (kind === 'delete') return askConfirmation('delete', todo, () => mutateTodo('DELETE', `todos/${encodeURIComponent(todo.id)}`));
    if (todo.status === 'done') return mutateTodo('PATCH', `todos/${encodeURIComponent(todo.id)}`, { status: 'todo' });
    return askConfirmation('complete', todo, () => mutateTodo('PATCH', `todos/${encodeURIComponent(todo.id)}`, { status: 'done' }));
  };
  const confirmationCopy = confirmation
    ? {
      dispatch: { title: '确认交给 Harness', body: `将“${confirmation.todo.title}”交给 Harness 后，会在新会话中开始执行。`, action: '开始执行' },
      complete: { title: '确认完成待办', body: `确认“${confirmation.todo.title}”已经完成吗？`, action: '标记完成' },
      delete: { title: '确认删除待办', body: `删除“${confirmation.todo.title}”后将无法从待办列表恢复。`, action: '删除' },
      'schedule-delete': { title: '确认删除定时任务', body: `删除“${confirmation.todo.title}”后将停止后续投递，并同时移除已保存的运行记录。`, action: '删除任务' }
    }[confirmation.kind]
    : null;
  const updateDispatch = (values) => setConfirmation((current) => current?.id === confirmation.id ? { ...current, ...values, error: '' } : current);
  const selectedDispatchModel = confirmation?.kind === 'dispatch'
    ? confirmation.modelOptions.find((choice) => choice.key === (confirmation.modelSelection ? modelSelectionKey(confirmation.modelSelection) : ''))
    : null;
  const dispatchEfforts = selectedDispatchModel?.reasoningEfforts ?? [];
  const dispatchPath = confirmation?.directoryMode === 'current' ? confirmation.currentWorkspace?.path : confirmation?.directoryPath;
  const dispatchControls = confirmation?.kind === 'dispatch' ? h(React.Fragment, null,
    h('div', { className: 'dsh-todo-planner-dispatch-model-grid' },
      h(DispatchModelSelect, {
        key: confirmation.id, choices: confirmation.modelOptions, selection: confirmation.modelSelection,
        status: confirmation.modelStatus, disabled: confirming,
        onChange: (selection) => updateDispatch({ modelSelection: selection })
      }),
      h(DispatchModelSelect, {
        key: `${confirmation.id}:effort`, id: 'effort', label: '思考深度',
        helpId: 'dsh-todo-planner-dispatch-reasoning-help',
        choices: [{ id: '', name: selectedDispatchModel?.defaultEffort ? `模型默认（${reasoningEffortLabel({ id: selectedDispatchModel.defaultEffort })}）` : '模型默认' }, ...dispatchEfforts.map((effort) => ({ id: effort.id, name: reasoningEffortLabel(effort) }))].map((effort) => ({
          key: modelSelectionKey({ provider: 'effort', model: effort.id }),
          modelName: effort.name,
          selection: { provider: 'effort', model: effort.id }
        })),
        selection: { provider: 'effort', model: confirmation.modelSelection?.reasoningEffort ?? '' },
        status: 'ready', disabled: confirming || confirmation.modelStatus !== 'ready' || !dispatchEfforts.length,
        onChange: (selection) => updateDispatch({ modelSelection: { ...confirmation.modelSelection, reasoningEffort: selection.model || undefined } })
      })
    ),
    h('p', { className: 'dsh-todo-planner-settings-help', id: 'dsh-todo-planner-dispatch-reasoning-help' },
      confirmation.modelStatus !== 'ready' ? '模型与思考深度将在执行前应用。'
        : dispatchEfforts.length ? '更深的思考通常需要更多时间和 Token。'
          : '此模型未提供可选的思考深度，将使用模型默认设置。'),
    confirmation.modelNotice ? h('p', { className: 'dsh-todo-planner-settings-help', role: 'status' }, confirmation.modelNotice) : null,
    h('section', { className: 'dsh-todo-planner-dispatch-directory', 'aria-labelledby': 'dsh-todo-planner-dispatch-directory-label' },
      h('h3', { id: 'dsh-todo-planner-dispatch-directory-label' }, '工作目录'),
      h('p', { className: 'dsh-todo-planner-settings-help', id: 'dsh-todo-planner-dispatch-directory-help' }, '建议选择任务相关目录，便于找到源文件和执行产物。'),
      h('div', { className: 'dsh-todo-planner-dispatch-directory-modes', role: 'radiogroup', 'aria-label': '工作目录来源', 'aria-describedby': 'dsh-todo-planner-dispatch-directory-help' },
        h('label', null, h('input', { type: 'radio', name: 'dsh-todo-planner-dispatch-directory-mode', checked: confirmation.directoryMode === 'choose', disabled: confirming, onChange: () => updateDispatch({ directoryMode: 'choose' }) }), '选择任务目录', h('span', { className: 'dsh-todo-planner-dispatch-recommended' }, '推荐')),
        h('label', null, h('input', { type: 'radio', name: 'dsh-todo-planner-dispatch-directory-mode', checked: confirmation.directoryMode === 'current', disabled: confirming || !confirmation.currentWorkspace?.path, onChange: () => updateDispatch({ directoryMode: 'current' }) }), '使用当前目录')),
      confirmation.directoryMode === 'choose' ? h('button', {
        type: 'button', className: 'dsh-todo-planner-dispatch-directory-trigger', disabled: confirming,
        onClick: () => updateDispatch({ directoryPickerOpen: true })
      }, h(IconFolderCloseRegular, { size: 19, 'aria-hidden': true }),
      h('span', { className: 'dsh-todo-planner-dispatch-directory-copy' },
        h('strong', null, confirmation.directoryPath ? '已选目录' : '选择工作目录'),
        h('span', null, confirmation.directoryPath || '选择已有文件夹，或新建一个任务文件夹')),
      h(IconChevronRightOutlineRegular, { size: 16, 'aria-hidden': true }))
        : h('div', { className: 'dsh-todo-planner-dispatch-current-directory' },
          h(IconFolderCloseRegular, { size: 19, 'aria-hidden': true }),
          h('span', { className: 'dsh-todo-planner-dispatch-directory-copy' }, h('strong', null, confirmation.currentWorkspace?.title ?? '当前目录'), h('span', null, confirmation.currentWorkspace?.path))),
      h('p', { className: 'dsh-todo-planner-settings-help', role: 'status' }, dispatchPath ? '会在此目录中新建会话，完成后列出产物路径。' : '选择一个目录，或使用当前目录后即可开始。'))
  ) : null;
  const confirmationActions = confirmationCopy ? h('div', { className: 'dsh-todo-planner-editor-actions' },
    h(Button, { type: 'button', variant: 'ghost', size: 'sm', disabled: confirming, onClick: () => setConfirmation(null) }, '取消'),
    h(Button, { type: 'button', variant: confirmation.kind === 'delete' ? 'outline' : 'primary', size: 'sm', disabled: confirming || (confirmation.kind === 'dispatch' && (confirmation.modelStatus !== 'ready' || !confirmation.modelSelection || !dispatchPath || confirmation.directoryPickerOpen)), onClick: confirmAction }, confirmation.kind === 'dispatch' ? h(IconPlayOutlineRegular, { size: 14 }) : null, confirming ? '处理中' : confirmationCopy.action)) : null;

  const renderTodo = (todo, plan = false) => h(TodoRow, {
    key: todo.id,
    todo,
    todos,
    now: clock,
    plan,
    disabled: mutation || dispatchingId !== null || confirming,
    dispatching: dispatchingId === todo.id,
    onEdit: () => setDialog({ type: plan ? 'plan' : 'todo', todo }),
    onToggle: () => todoAction(todo, 'complete'),
    onDelete: () => todoAction(todo, 'delete'),
    onDispatch: () => todoAction(todo, 'dispatch'),
    onOpenSession: () => { try { openHarnessSession(ctx, todo.sessionId); } catch (failure) { setNotice(`无法打开会话：${failure.message}`); } }
  });

  const createEditor = () => setDialog(segment === 'scheduled' ? { type: 'schedule-create' } : { type: segment === 'plan' ? 'plan' : 'todo', todo: null });
  const selectPlanDate = (key) => {
    setPlanStartDate(key === localDateKey(new Date(clock)) ? null : key);
  };
  return h('section', { className: 'dsh-todo-planner-panel' },
    h(TodoTopNavigation, {
      segment,
      onChange: (next) => { setSegment(next); setSearchOpen(false); setFilterOpen(false); },
      onSearch: { open: searchOpen, toggle: () => setSearchOpen((open) => !open) },
      onFilter: { open: filterOpen, toggle: () => setFilterOpen((open) => !open) },
      onCreate: { disabled: mutation || dispatchingId !== null, run: createEditor },
      onRefresh: segment === 'scheduled' ? retrySchedule : refresh,
      onCollapse: () => setCollapsed(true)
    }),
    h('div', { className: `dsh-todo-planner-panel-tools${searchOpen || filterOpen ? ' is-open' : ''}` },
      searchOpen ? h('label', { className: 'dsh-todo-planner-search-field' }, h(IconSearchOutlineRegular, { size: 15 }), h('input', { autoFocus: true, value: query, placeholder: '搜索待办和计划', onChange: (event) => setQuery(event.target.value) })) : null,
      filterOpen ? h('div', { className: 'dsh-todo-planner-filter-menu', role: 'group', 'aria-label': '优先级筛选' },
        h('span', null, '优先级'),
        [['all', '全部'], ['urgent', '紧急'], ['high', '高'], ['normal', '普通'], ['low', '低']].map(([value, label]) => h('button', { type: 'button', key: value, className: priorityFilter === value ? 'is-selected' : '', onClick: () => setPriorityFilter(value) }, label)),
        segment !== 'scheduled' ? h('label', { className: 'dsh-todo-planner-filter-completed' }, h('input', { type: 'checkbox', checked: showCompleted, onChange: (event) => setShowCompleted(event.target.checked) }), '显示已完成') : null
      ) : null
    ),
    h(TodoPanelTitle, {
      segment, todos, activeSchedules, scheduleCount: scheduleRecords.length, now: clock, selectedPlanDate, planRangeDays,
      onPlanDateSelect: selectPlanDate,
      onPlanRangeSelect: (key, days) => { selectPlanDate(key); setPlanRangeDays(days); },
      dataStatus: error ? 'error' : data ? 'ready' : 'loading'
    }),
    notice ? h('p', { className: 'dsh-todo-planner-notice', role: 'status' }, notice) : null,
    h('div', { id: `dsh-todo-planner-todo-view-${segment}-panel`, role: 'tabpanel', className: 'dsh-todo-planner-list', ref: listRef }, error && segment !== 'scheduled'
      ? h('div', { className: 'dsh-todo-planner-state dsh-todo-planner-error' }, h('p', null, '暂时无法读取待办'), h(Button, { type: 'button', variant: 'outline', size: 'sm', onClick: refresh }, '重试'))
      : segment === 'scheduled'
        ? h(ScheduleManager, {
          records: filteredScheduleRecords,
          total: scheduleRecords.length,
          query: scheduleQuery,
          onQueryChange: setScheduleQuery,
          filter: scheduleFilter,
          onFilterChange: setScheduleFilter,
          selected: selectedSchedule,
          selectedTab: scheduleDetailTab,
          onSelect: (record) => { setSelectedScheduleId(record.id); setScheduleDetailTab('rule'); setDialog(null); },
          onBack: () => setSelectedScheduleId(null),
          onTabChange: setScheduleDetailTab,
          status: schedule.status,
          error: schedule.error,
          onRetry: retrySchedule,
          onEdit: (record) => setDialog({ type: 'schedule', record }),
          onDelete: (record) => askConfirmation('schedule-delete', { title: record.title }, () => handleScheduleDelete(record)),
          onDispatch: dispatchSchedule,
          onOpenSession: (record) => { try { openHarnessSession(ctx, record.sessionId); } catch (failure) { setNotice(`无法打开会话：${failure.message}`); } },
          dispatching: dispatchingId !== null
        })
        : visible.length || segment === 'plan'
          ? segment === 'plan'
            ? renderPlanGroups(visible, clock, (todo) => renderTodo(todo, true), { selectedDate: selectedPlanDate })
            : renderTodayGroups(visible, clock, (todo) => renderTodo(todo))
          : h('div', { className: 'dsh-todo-planner-state' }, h('p', null, emptyLabel(segment)))
    ),
    h(Modal, { open: dialog !== null, onClose: () => setDialog(null), title: dialog?.type === 'todo' ? (dialog.todo ? '编辑待办' : '新建待办') : dialog?.type === 'plan' ? (dialog.todo ? '编辑计划' : '新建计划') : dialog?.type === 'schedule-create' ? '新建定时任务' : '编辑定时任务', closeLabel: '关闭', className: 'dsh-todo-planner-modal', contentClassName: 'dsh-todo-planner-modal-content' },
      dialog?.type === 'todo' ? h(TodoEditor, { todo: dialog.todo, todos, kind: 'todo', onClose: () => setDialog(null), onSaved: async () => { await refresh(); setDialog(null); setNotice(dialog.todo ? '待办已保存' : '待办已创建'); } })
        : dialog?.type === 'plan' ? h(TodoEditor, { todo: dialog.todo, todos, initialDate: selectedPlanDate, kind: 'plan', onClose: () => setDialog(null), onSaved: async () => { await refresh(); setDialog(null); setNotice(dialog.todo ? '计划已保存' : '计划已创建'); } })
        : dialog?.type === 'schedule-create' ? h(ScheduleCreateEditor, { onClose: () => setDialog(null), onCreate: createSchedule })
            : dialog?.type === 'schedule' ? h(ScheduleEditor, { record: dialog.record, onClose: () => setDialog(null), onSave: (values, change) => saveSchedule(dialog.record, values, change) }) : null),
    h(Modal, { open: confirmation !== null, onClose: () => { if (!confirming && !confirmation?.directoryPickerOpen) setConfirmation(null); }, title: confirmationCopy?.title ?? '确认操作', closeLabel: '取消', className: `dsh-todo-planner-confirm-modal${confirmation?.kind === 'dispatch' ? ' dsh-todo-planner-dispatch-modal' : ''}`, contentClassName: 'dsh-todo-planner-confirm-content', footer: confirmation?.kind === 'dispatch' ? confirmationActions : undefined },
      confirmationCopy ? h('div', { className: 'dsh-todo-planner-confirmation' },
        h('p', null, confirmationCopy.body),
        confirmation.error ? h('p', { className: 'dsh-todo-planner-settings-error', role: 'alert' }, confirmation.error) : null,
        dispatchControls,
        confirmation.kind === 'dispatch' && confirmation.modelStatus === 'loading' ? h('span', { className: 'dsh-todo-planner-settings-help' }, '正在读取可用模型…') : null,
        confirmation.kind === 'dispatch' && confirmation.modelError ? h('span', { className: 'dsh-todo-planner-settings-error', role: 'alert' }, confirmation.modelError) : null,
        confirmation.kind === 'dispatch' && confirmation.modelStatus === 'error' ? h(Button, { type: 'button', variant: 'outline', size: 'sm', disabled: confirming, onClick: () => loadDispatchModels(confirmation.id, confirmation.previousOptions) }, '重试读取模型') : null,
        confirmation.kind !== 'dispatch' ? confirmationActions : null
      ) : null),
    confirmation?.directoryPickerOpen ? h(DispatchDirectoryDialog, {
      key: confirmation.id,
      initialPath: confirmation.directoryPath || confirmation.currentWorkspace?.path,
      onClose: () => updateDispatch({ directoryPickerOpen: false }),
      onSelect: (path) => updateDispatch({ directoryPath: path, directoryMode: 'choose', directoryPickerOpen: false })
    }) : null
  );
}

function IconActionButton({ label, ...props }) {
  return h(Tooltip, { label, delayMs: 350, focusDelayMs: 0 }, h(Button, { ...props, 'aria-label': props['aria-label'] ?? label }));
}

function TokenUsageSidebarItem({ wide }) {
  return wide ? h(TokenUsageSidebarContent) : null;
}

function TokenUsageSidebarContent() {
  const usage = useApiData('usage', 15000).data;
  const settings = useSettingsState();
  const today = sumUsage((usage?.entries ?? []).filter((entry) => isToday(entry.createdAt)));
  const budget = settings.dailyTokenBudget;
  const percent = budget > 0 ? Math.min(100, today.totalTokens / budget * 100) : 0;
  return h('div', { className: 'dsh-todo-planner-token-usage' },
    h('div', { className: 'dsh-todo-planner-token-usage-label' },
      h('span', null, '今日 Token'),
      h('strong', null, `${formatNumber(today.totalTokens)} / ${budget ? formatNumber(budget) : '不限'}`)),
    budget > 0 ? h('div', {
      className: 'dsh-todo-planner-token-usage-track',
      role: 'progressbar',
      'aria-label': '今日 Token 用量',
      'aria-valuemin': 0,
      'aria-valuemax': budget,
      'aria-valuenow': Math.min(today.totalTokens, budget)
    }, h('span', { style: { width: `${percent}%` } })) : null
  );
}

function TodoEditor({ todo, todos = [], initialDate = '', kind = 'todo', onClose, onSaved }) {
  const dueParts = inputDateTimeParts(todo?.dueAt);
  const startParts = inputDateTimeParts(todo?.startAt);
  const [values, setValues] = useState({
    title: todo?.title ?? '',
    notes: todo?.notes ?? '',
    status: todo?.status ?? 'todo',
    priority: todo?.priority ?? 'normal',
    dueDate: dueParts.date,
    dueTime: dueParts.time,
    startDate: startParts.date || (!todo ? initialDate : ''),
    startTime: startParts.time,
    estimatedMinutes: String(todo?.estimatedMinutes ?? 60),
    parentId: todo?.parentId ?? '',
    dependsOn: todo?.dependsOn ?? []
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (key) => (event) => {
    const value = event.target.value;
    setValues((current) => ({ ...current, [key]: value, ...(!value && key === 'startDate' ? { startTime: '' } : {}), ...(!value && key === 'dueDate' ? { dueTime: '' } : {}) }));
  };
  const relatedTodos = todos.filter((candidate) => candidate.id !== todo?.id);
  const plannedStart = localInputToIso(values.startDate, values.startTime, false);
  const deadline = localInputToIso(values.dueDate, values.dueTime, true);
  const deadlineRisk = plannedStart && deadline && Date.parse(plannedStart) + Number(values.estimatedMinutes) * 60_000 > Date.parse(deadline);
  return h('form', {
    className: `dsh-todo-planner-editor dsh-todo-planner-editor-${kind}`,
    onSubmit: async (event) => {
      event.preventDefault();
      setSaving(true);
      setError('');
      try {
        const estimatedMinutes = Number(values.estimatedMinutes);
        if (!Number.isSafeInteger(estimatedMinutes) || estimatedMinutes < 1) throw new Error('预估工作量必须是至少 1 分钟的整数');
        const dueAt = todo && values.dueDate === dueParts.date && values.dueTime === dueParts.time
          ? todo.dueAt ?? null : localInputToIso(values.dueDate, values.dueTime, true);
        const startAt = todo && values.startDate === startParts.date && values.startTime === startParts.time
          ? todo.startAt ?? null : localInputToIso(values.startDate, values.startTime, false);
        if (values.startTime && !values.startDate) throw new Error('请选择计划执行日期');
        if (values.dueTime && !values.dueDate) throw new Error('请选择截止日期');
        const input = { title: values.title, notes: values.notes, status: values.status, priority: values.priority, dueAt, startAt, estimatedMinutes, parentId: values.parentId || null, dependsOn: values.dependsOn };
        const remoteMethod = todo ? 'updateTodo' : 'createTodo';
        if (todo) await callTodoPlannerRemote(remoteMethod, [{ id: todo.id, patch: input }]);
        else await callTodoPlannerRemote(remoteMethod, [input]);
        await onSaved();
      } catch (failure) {
        setError(failure.message);
      } finally {
        setSaving(false);
      }
    }
  },
  h('label', { className: 'dsh-todo-planner-editor-field dsh-todo-planner-editor-title' }, '标题', h('input', { autoFocus: true, maxLength: 240, required: true, value: values.title, placeholder: kind === 'plan' ? '例如：整理下一版本的发布计划' : '例如：准备演示材料', onChange: set('title') })),
  h('label', { className: 'dsh-todo-planner-editor-field' }, '备注', h('textarea', { maxLength: 4000, rows: 4, value: values.notes, placeholder: '目标、对接人、交付物、等待回复或跟进时间', onChange: set('notes') })),
  h('div', { className: 'dsh-todo-planner-editor-grid dsh-todo-planner-todo-fields' },
    h('label', { className: 'dsh-todo-planner-editor-field' }, '截止日期', h('input', { type: 'date', value: values.dueDate, onChange: set('dueDate') })),
    h('label', { className: 'dsh-todo-planner-editor-field' }, '截止时间', h('input', { type: 'time', step: 60, value: values.dueTime, onChange: set('dueTime') })),
    h('label', { className: 'dsh-todo-planner-editor-field' }, '优先级', h('select', { value: values.priority, onChange: set('priority') },
      h('option', { value: 'low' }, '低'), h('option', { value: 'normal' }, '普通'), h('option', { value: 'high' }, '高'), h('option', { value: 'urgent' }, '紧急'))),
    h('label', { className: 'dsh-todo-planner-editor-field' }, '预估工作量', h('div', { className: 'dsh-todo-planner-input-with-suffix' }, h('input', { type: 'number', min: 1, max: 43200, step: 1, required: true, value: values.estimatedMinutes, onChange: set('estimatedMinutes') }), h('span', null, '分钟'))),
    h('label', { className: 'dsh-todo-planner-editor-field' }, '计划执行日期', h('input', { type: 'date', value: values.startDate, onChange: set('startDate') })),
    h('label', { className: 'dsh-todo-planner-editor-field' }, '计划执行时间', h('input', { type: 'time', step: 60, value: values.startTime, onChange: set('startTime') })),
    todo ? h('label', { className: 'dsh-todo-planner-editor-field' }, '状态', h('select', { value: values.status, onChange: set('status') },
      h('option', { value: 'todo' }, '待处理'), h('option', { value: 'in_progress' }, '进行中'), h('option', { value: 'blocked' }, '受阻'), h('option', { value: 'done' }, '已完成'), h('option', { value: 'canceled' }, '已取消'), h('option', { value: 'archived' }, '已归档'))) : null),
  relatedTodos.length ? h('details', { className: 'dsh-todo-planner-editor-relations' },
    h('summary', null, '协作与拆解'),
    h('label', { className: 'dsh-todo-planner-editor-field' }, '所属任务', h('select', { value: values.parentId, onChange: set('parentId') },
      h('option', { value: '' }, '无'), relatedTodos.map((candidate) => h('option', { key: candidate.id, value: candidate.id }, candidate.title)))),
    h('fieldset', { className: 'dsh-todo-planner-dependencies' }, h('legend', null, '前置任务'),
      relatedTodos.filter((candidate) => isActiveTodo(candidate) || values.dependsOn.includes(candidate.id)).map((candidate) => h('label', { key: candidate.id },
        h('input', { type: 'checkbox', checked: values.dependsOn.includes(candidate.id), onChange: (event) => setValues((current) => ({ ...current, dependsOn: event.target.checked ? [...current.dependsOn, candidate.id] : current.dependsOn.filter((id) => id !== candidate.id) })) }),
        h('span', null, candidate.title))))) : null,
  deadlineRisk && isActiveTodo({ status: values.status }) ? h('p', { className: 'dsh-todo-planner-settings-error', role: 'status' }, '当前排期预计晚于截止时间') : null,
  error ? h('p', { className: 'dsh-todo-planner-settings-error', role: 'alert' }, error) : null,
  h('div', { className: 'dsh-todo-planner-editor-actions' },
    h(Button, { type: 'button', variant: 'ghost', size: 'sm', onClick: onClose }, '取消'),
    h(Button, { type: 'submit', variant: 'primary', size: 'sm', disabled: saving || !values.title.trim() }, saving ? '保存中' : '保存'))
  );
}

function ScheduleCreateEditor({ onClose, onCreate }) {
  const localNow = new Date();
  localNow.setMinutes(0, 0, 0);
  localNow.setHours(localNow.getHours() + 1);
  const [values, setValues] = useState({ title: '', prompt: '', kind: 'at', date: localDateKey(localNow), time: `${String(localNow.getHours()).padStart(2, '0')}:00`, amount: '1', unit: 'hour', weekdays: [1, 2, 3, 4, 5], cron: '0 9 * * 1-5' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  return h('form', { className: 'dsh-todo-planner-editor dsh-todo-planner-schedule-editor', onSubmit: async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      if (values.kind === 'at') {
        const scheduledAt = new Date(`${values.date}T${values.time}:00`);
        if (!Number.isFinite(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) throw new Error('指定时间需要晚于当前时间');
      }
      await onCreate(buildScheduleRequest(values, timeZone));
    } catch (failure) { setError(failure.message); } finally { setSaving(false); }
  } },
  h('div', { className: 'dsh-todo-planner-editor-intro' }, h('span', { className: 'dsh-todo-planner-editor-kicker' }, '定时任务'), h('p', null, '按设定时间在当前会话中启动工作')),
  h('label', { className: 'dsh-todo-planner-editor-field dsh-todo-planner-editor-title' }, '名称', h('input', { autoFocus: true, maxLength: 120, required: true, value: values.title, placeholder: '例如：工作日巡检', onChange: set('title') })),
  h('label', { className: 'dsh-todo-planner-editor-field' }, '执行内容', h('textarea', { rows: 4, required: true, value: values.prompt, placeholder: '描述到时间后需要 Harness 执行的工作', onChange: set('prompt') })),
  h('label', { className: 'dsh-todo-planner-editor-field' }, '执行频率', h('select', { value: values.kind, onChange: set('kind') }, h('option', { value: 'at' }, '指定时间'), h('option', { value: 'after' }, '延迟后执行'), h('option', { value: 'every' }, '固定间隔'), h('option', { value: 'daily' }, '每天'), h('option', { value: 'weekly' }, '每周'), h('option', { value: 'cron' }, 'Cron'))),
  values.kind === 'at' ? h('div', { className: 'dsh-todo-planner-editor-grid' }, h('label', { className: 'dsh-todo-planner-editor-field' }, '日期', h('input', { type: 'date', min: localDateKey(new Date()), required: true, value: values.date, onChange: set('date') })), h('label', { className: 'dsh-todo-planner-editor-field' }, '时间', h('input', { type: 'time', required: true, value: values.time, onChange: set('time') }))) : null,
  values.kind === 'after' || values.kind === 'every' ? h('div', { className: 'dsh-todo-planner-editor-grid' }, h('label', { className: 'dsh-todo-planner-editor-field' }, values.kind === 'after' ? '延迟时长' : '间隔', h('input', { type: 'number', min: 1, step: 1, required: true, value: values.amount, onChange: set('amount') })), h('label', { className: 'dsh-todo-planner-editor-field' }, '单位', h('select', { value: values.unit, onChange: set('unit') }, h('option', { value: 'minute' }, '分钟'), h('option', { value: 'hour' }, '小时'), h('option', { value: 'day' }, '天')))) : null,
  values.kind === 'daily' || values.kind === 'weekly' ? h('div', { className: 'dsh-todo-planner-editor-grid' }, h('label', { className: 'dsh-todo-planner-editor-field' }, '时间', h('input', { type: 'time', required: true, value: values.time, onChange: set('time') })), values.kind === 'weekly' ? h('fieldset', { className: 'dsh-todo-planner-weekdays' }, h('legend', null, '重复日期'), ['一', '二', '三', '四', '五', '六', '日'].map((label, index) => { const weekday = index + 1; return h('label', { className: 'dsh-todo-planner-weekday', key: weekday }, h('input', { type: 'checkbox', checked: values.weekdays.includes(weekday), onChange: (event) => setValues((current) => ({ ...current, weekdays: event.target.checked ? [...current.weekdays, weekday].sort() : current.weekdays.filter((day) => day !== weekday) })) }), label); })) : h('div', { className: 'dsh-todo-planner-editor-timezone' }, `时区：${timeZone}`)) : null,
  values.kind === 'cron' ? h('label', { className: 'dsh-todo-planner-editor-field' }, 'Cron 表达式', h('input', { required: true, value: values.cron, onChange: set('cron') })) : null,
  values.kind === 'cron' ? h('p', { className: 'dsh-todo-planner-editor-help' }, `按当前时区 ${timeZone} 解释`) : null,
  error ? h('p', { className: 'dsh-todo-planner-settings-error', role: 'alert' }, error) : null,
  h('div', { className: 'dsh-todo-planner-editor-actions' }, h(Button, { type: 'button', variant: 'ghost', size: 'sm', onClick: onClose }, '取消'), h(Button, { type: 'submit', variant: 'primary', size: 'sm', disabled: saving || !values.title.trim() || !values.prompt.trim() || (values.kind === 'weekly' && values.weekdays.length === 0) }, saving ? '创建中' : '创建定时任务'))
  );
}

function buildScheduleRequest(values, timeZone) {
  const request = { title: values.title.trim(), prompt: values.prompt.trim() };
  if (values.kind === 'at') request.at = { date: values.date, time: `${values.time}:00`, time_zone: timeZone };
  else if (values.kind === 'after') request.after_seconds = Number(values.amount) * scheduleUnitSeconds(values.unit);
  else if (values.kind === 'every') request.every_seconds = Number(values.amount) * scheduleUnitSeconds(values.unit);
  else if (values.kind === 'daily') request.daily = { time: `${values.time}:00`, time_zone: timeZone };
  else if (values.kind === 'weekly') request.weekly = { time: `${values.time}:00`, time_zone: timeZone, weekdays: values.weekdays };
  else if (values.kind === 'cron') request.cron = { expression: values.cron.trim(), time_zone: timeZone };
  return request;
}

function scheduleUnitSeconds(unit) {
  return unit === 'day' ? 86400 : unit === 'hour' ? 3600 : unit === 'minute' ? 60 : 1;
}

function ScheduleEditor({ record, onClose, onSave }) {
  const [values, setValues] = useState(() => scheduleEditorDefaults(record));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));
  return h('form', {
    className: 'dsh-todo-planner-editor',
    onSubmit: async (event) => {
      event.preventDefault();
      setSaving(true);
      setError('');
      try { await onSave(values, buildScheduleUpdateChange(record, values)); }
      catch (failure) { setError(failure.message); }
      finally { setSaving(false); }
    }
  },
  h('label', { className: 'dsh-todo-planner-editor-field' }, '名称', h('input', { autoFocus: true, maxLength: 120, required: true, value: values.title, onChange: set('title') })),
  h('label', { className: 'dsh-todo-planner-editor-field' }, '提醒内容', h('textarea', { rows: 4, required: true, value: values.prompt, onChange: set('prompt') })),
  h('label', { className: 'dsh-todo-planner-editor-field' }, '重复', h('select', { value: values.kind, onChange: set('kind') },
    h('option', { value: 'at' }, '仅一次'), h('option', { value: 'every' }, '固定间隔'), h('option', { value: 'daily' }, '每天'), h('option', { value: 'weekly' }, '每周'), h('option', { value: 'cron' }, '自定义 Cron')
  )),
  values.kind === 'at' ? h('div', { className: 'dsh-todo-planner-editor-grid' },
    h('label', { className: 'dsh-todo-planner-editor-field' }, '日期', h('input', { type: 'date', min: localDateKey(new Date()), required: true, value: values.date, onChange: set('date') })),
    h('label', { className: 'dsh-todo-planner-editor-field' }, '时间', h('input', { type: 'time', step: '0.001', required: true, value: values.time, onChange: set('time') }))
  ) : null,
  values.kind === 'every' ? h('div', { className: 'dsh-todo-planner-editor-grid' },
    h('label', { className: 'dsh-todo-planner-editor-field' }, '间隔', h('input', { type: 'number', min: values.unit === 'second' ? 60 : 1, step: 1, required: true, value: values.amount, onChange: set('amount') })),
    h('label', { className: 'dsh-todo-planner-editor-field' }, '单位', h('select', { value: values.unit, onChange: set('unit') }, h('option', { value: 'second' }, '秒'), h('option', { value: 'minute' }, '分钟'), h('option', { value: 'hour' }, '小时'), h('option', { value: 'day' }, '天')))
  ) : null,
  values.kind === 'daily' || values.kind === 'weekly' ? h('div', { className: 'dsh-todo-planner-editor-grid' },
    h('label', { className: 'dsh-todo-planner-editor-field' }, '时间', h('input', { type: 'time', step: '0.001', required: true, value: values.time, onChange: set('time') })),
    h('label', { className: 'dsh-todo-planner-editor-field' }, '时区', h('input', { required: true, value: values.timeZone, onChange: set('timeZone') })),
    values.kind === 'weekly' ? h('fieldset', { className: 'dsh-todo-planner-weekdays' }, h('legend', null, '星期'), ['一', '二', '三', '四', '五', '六', '日'].map((label, index) => {
      const weekday = index + 1;
      return h('label', { className: 'dsh-todo-planner-weekday', key: weekday }, h('input', { type: 'checkbox', checked: values.weekdays.includes(weekday), onChange: (event) => setValues((current) => ({ ...current, weekdays: event.target.checked ? [...current.weekdays, weekday].sort() : current.weekdays.filter((day) => day !== weekday) })) }), label);
    })) : null
  ) : null,
  values.kind === 'cron' ? h('div', { className: 'dsh-todo-planner-editor-grid' },
    h('label', { className: 'dsh-todo-planner-editor-field' }, 'Cron 表达式', h('input', { required: true, value: values.cron, onChange: set('cron') })),
    h('label', { className: 'dsh-todo-planner-editor-field' }, '时区', h('input', { required: true, value: values.timeZone, onChange: set('timeZone') }))
  ) : null,
  values.kind === 'at' ? h('p', { className: 'dsh-todo-planner-editor-help' }, `一次性时间按本机时区 ${values.timeZone} 解释。`) : null,
  error ? h('p', { className: 'dsh-todo-planner-settings-error', role: 'alert' }, error) : null,
  h('div', { className: 'dsh-todo-planner-editor-actions' },
    h(Button, { type: 'button', variant: 'ghost', size: 'sm', onClick: onClose }, '取消'),
    h(Button, { type: 'submit', variant: 'primary', size: 'sm', disabled: saving || !values.title.trim() || !values.prompt.trim() || (values.kind === 'weekly' && values.weekdays.length === 0) }, saving ? '保存中' : '保存修改'))
  );
}

function scheduleEditorDefaults(record) {
  const kind = record.kind === 'after' ? 'at' : record.kind;
  const timeZone = record.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
  const dateTime = preciseDateTimeParts(record.scheduledAt);
  let amount = '1';
  let unit = 'hour';
  if (record.kind === 'every') {
    amount = String(record.everySeconds);
    unit = 'second';
    for (const candidate of ['day', 'hour', 'minute']) {
      const seconds = scheduleUnitSeconds(candidate);
      if (record.everySeconds % seconds === 0) { amount = String(record.everySeconds / seconds); unit = candidate; break; }
    }
  }
  return {
    title: record.title,
    prompt: record.prompt,
    kind,
    date: dateTime.date,
    time: record.time || dateTime.time || '09:00:00',
    amount,
    unit,
    weekdays: record.weekdays ?? [1, 2, 3, 4, 5],
    cron: record.expression ?? '0 9 * * 1-5',
    timeZone
  };
}

function preciseDateTimeParts(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: '', time: '' };
  return {
    date: localDateKey(date),
    time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}.${String(date.getMilliseconds()).padStart(3, '0')}`
  };
}

function buildScheduleUpdateChange(record, values) {
  const time = values.time?.length === 5 ? `${values.time}:00` : values.time;
  if (values.kind === 'at') {
    const target = new Date(`${values.date}T${time}`);
    if (!Number.isFinite(target.getTime()) || target.getTime() <= Date.now()) throw new Error('指定时间需要晚于当前时间');
    if (['at', 'after'].includes(record.kind) && target.getTime() === Date.parse(record.scheduledAt)) return undefined;
    return { kind: 'at', at: target.toISOString() };
  }
  if (values.kind === 'every') {
    const everySeconds = Number(values.amount) * scheduleUnitSeconds(values.unit);
    if (!Number.isSafeInteger(everySeconds) || everySeconds < 60) throw new Error('固定间隔至少为 60 秒');
    if (record.kind === 'every' && record.everySeconds === everySeconds) return undefined;
    return { kind: 'every', every_seconds: everySeconds };
  }
  if (values.kind === 'daily') {
    if (record.kind === 'daily' && record.time === time && record.timeZone === values.timeZone) return undefined;
    return { kind: 'daily', daily: { time, time_zone: values.timeZone.trim() } };
  }
  if (values.kind === 'weekly') {
    const weekdays = [...values.weekdays].sort((left, right) => left - right);
    if (record.kind === 'weekly' && record.time === time && record.timeZone === values.timeZone && record.weekdays.length === weekdays.length && record.weekdays.every((day, index) => day === weekdays[index])) return undefined;
    return { kind: 'weekly', weekly: { time, time_zone: values.timeZone.trim(), weekdays } };
  }
  if (values.kind === 'cron') {
    const expression = values.cron.trim();
    if (record.kind === 'cron' && record.expression === expression && record.timeZone === values.timeZone) return undefined;
    return { kind: 'cron', cron: { expression, time_zone: values.timeZone.trim() } };
  }
  throw new Error('不支持的运行规则');
}

function TodoRow({ todo, todos = [], now = Date.now(), plan = false, disabled, dispatching, onEdit, onToggle, onDelete, onDispatch, onOpenSession }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const urgency = deadlineUrgency(todo, now);
  const urgencyTag = !plan && urgency === 'overdue'
    ? h('span', { className: 'dsh-todo-planner-urgency-tag dsh-todo-planner-urgency-tag-overdue' }, '已逾期')
    : !plan && (urgency === 'critical' || urgency === 'soon')
      ? h('span', { className: 'dsh-todo-planner-urgency-tag dsh-todo-planner-urgency-tag-soon' }, '即将到期')
      : null;
  return h('div', { className: `dsh-todo-planner-timeline-item dsh-todo-planner-task-priority-${todo.priority ?? 'normal'}` },
    h('div', { className: 'dsh-todo-planner-timeline-marker', 'aria-hidden': true },
      h('span', { className: `dsh-todo-planner-dot dsh-todo-planner-dot-${todo.status}` })),
    h('article', { className: `dsh-todo-planner-row dsh-todo-planner-${plan ? 'plan' : 'today'}-row dsh-todo-planner-status-${todo.status} dsh-todo-planner-urgency-${urgency}${todo.status === 'done' ? ' dsh-todo-planner-task-done' : ''}` },
      h('div', { className: 'dsh-todo-planner-row-copy' },
        h('div', { className: 'dsh-todo-planner-row-head' },
          h('div', { className: 'dsh-todo-planner-row-title' },
            h('input', { className: 'dsh-todo-planner-task-check', type: 'checkbox', checked: todo.status === 'done', 'aria-label': todo.status === 'done' ? `重新打开 ${todo.title}` : `完成 ${todo.title}`, disabled, onChange: onToggle }),
            h('strong', null, todo.title),
            todo.priority !== 'normal' ? h('span', { className: `dsh-todo-planner-priority dsh-todo-planner-priority-${todo.priority}` }, priorityLabel(todo.priority)) : null,
            urgencyTag
          ),
          h('span', { className: `dsh-todo-planner-status dsh-todo-planner-status-${todo.status}` }, statusLabel(todo.status))
        ),
        h('div', { className: 'dsh-todo-planner-row-time-range' },
          h('span', null, h(IconClockOutlineRegular, { size: 12 }), formatTodoWindow(todo)),
          h('span', null, todo.dueAt ? formatDue(todo.dueAt) : '无截止日期'),
          h('span', { className: 'dsh-todo-planner-effort' }, todo.estimatedMinutes ? `约 ${formatDurationMinutes(todo.estimatedMinutes)}` : '未估工时')
        ),
        todo.notes ? h('p', { className: 'dsh-todo-planner-notes' }, todo.notes) : null,
        h(TodoRelations, { todo, todos }),
        h('div', { className: 'dsh-todo-planner-row-footer' },
          todo.tags?.length ? h('div', { className: 'dsh-todo-planner-tags dsh-todo-planner-row-tags' }, [
            ...todo.tags.map((tag, index) => h('span', { key: tag, className: index ? 'dsh-todo-planner-tag-extra' : undefined }, tag)),
            todo.tags.length > 1 ? h('span', { className: 'dsh-todo-planner-tag-overflow', title: todo.tags.slice(1).join(', '), 'aria-label': `还有 ${todo.tags.length - 1} 个标签` }, `+${todo.tags.length - 1}`) : null
          ]) : null,
          h('div', { className: 'dsh-todo-planner-row-actions' },
            !['done', 'canceled', 'archived'].includes(todo.status) ? h(Button, { type: 'button', variant: 'ghost', size: 'sm', className: 'dsh-todo-planner-action-button dsh-todo-planner-action-text-button dsh-todo-planner-dispatch-button', disabled: disabled || dispatching, onClick: onDispatch }, dispatching ? '提交中' : '交给 Harness') : null,
            todo.sessionId ? h(Button, { type: 'button', variant: 'ghost', size: 'sm', className: 'dsh-todo-planner-action-button dsh-todo-planner-action-text-button dsh-todo-planner-open-session-button', disabled, onClick: onOpenSession }, '查看会话') : null,
            h(Button, { type: 'button', variant: 'ghost', size: 'sm', className: 'dsh-todo-planner-action-button dsh-todo-planner-action-text-button', disabled, onClick: onEdit }, urgency === 'overdue' ? '调整日期' : '编辑'),
            h('details', { className: 'dsh-todo-planner-row-more', open: menuOpen, onToggle: (event) => setMenuOpen(event.currentTarget.open) },
              h('summary', { title: '更多操作' }, '更多'),
              h('button', { type: 'button', disabled, onClick: () => { setMenuOpen(false); onDelete(); } }, '删除'))
          )
        )
      )
    )
  );
}

function TodoRelations({ todo, todos }) {
  const parent = todos.find((candidate) => candidate.id === todo.parentId);
  const dependencies = (todo.dependsOn ?? []).map((id) => todos.find((candidate) => candidate.id === id)).filter(Boolean);
  if (!parent && !dependencies.length) return null;
  return h('div', { className: 'dsh-todo-planner-task-relations' },
    parent ? h('span', null, `所属：${parent.title}`) : null,
    dependencies.length ? h('span', null, `前置：${dependencies.map((candidate) => `${candidate.title}${candidate.status === 'done' ? '（已完成）' : '（未完成）'}`).join('、')}`) : null);
}

function renderTodayGroups(todos, now, renderTodo) {
  const today = localDateKey(new Date(now));
  const groups = new Map();
  for (const todo of todos) {
    const dueDate = todo.dueAt ? localDateKey(new Date(todo.dueAt)) : null;
    const startDate = todo.startAt ? localDateKey(new Date(todo.startAt)) : dueDate;
    const startTime = Date.parse(todo.startAt ?? todo.dueAt ?? '');
    let key = 'unscheduled';
    if (isOverdueTodo(todo, now)) key = 'overdue';
    else if (startDate && startDate < today) key = 'cross-day';
    else if (Number.isFinite(startTime)) {
      const hour = new Date(startTime).getHours();
      const minuteOfDay = hour * 60 + new Date(startTime).getMinutes();
      key = minuteOfDay < 10 * 60 ? 'morning' : minuteOfDay < 15.5 * 60 ? 'project' : minuteOfDay < 18 * 60 ? 'daily' : 'evening';
    }
    const group = groups.get(key) ?? { key, todos: [] };
    group.todos.push(todo);
    groups.set(key, group);
  }
  const order = ['overdue', 'cross-day', 'morning', 'project', 'daily', 'evening', 'unscheduled'];
  const labels = { overdue: '已逾期', 'cross-day': '跨日安排', morning: '晨间工作', project: '项目推进', daily: '日常事务', evening: '收尾工作', unscheduled: '待安排' };
  return [...groups.values()].sort((left, right) => order.indexOf(left.key) - order.indexOf(right.key)).map((group) => {
    group.todos.sort(compareTimeline);
    const firstScheduled = group.todos.find((todo) => todo.startAt || todo.dueAt);
    const marker = group.key === 'overdue' ? '' : firstScheduled ? formatTimelineMarker(firstScheduled) : '—';
    return h('section', { className: `dsh-todo-planner-task-group dsh-todo-planner-timeline-group dsh-todo-planner-timeline-group-${group.key}`, key: group.key },
      h('header', { className: 'dsh-todo-planner-group-header dsh-todo-planner-timeline-group-header' },
        h('span', { className: 'dsh-todo-planner-group-dot', 'aria-hidden': true }),
        h('div', { className: 'dsh-todo-planner-group-heading' },
          marker ? h('div', { className: 'dsh-todo-planner-timeline-group-marker' }, h(IconClockOutlineRegular, { size: 13, 'aria-hidden': true }), h('time', null, marker)) : null,
          h('div', { className: 'dsh-todo-planner-timeline-group-copy' }, h('strong', null, labels[group.key])),
          h('span', null, `${group.todos.length} 项`))),
      h('div', { className: 'dsh-todo-planner-task-timeline' }, group.todos.map(renderTodo))
    );
  });
}

function renderPlanGroups(todos, now, renderTodo, { selectedDate } = {}) {
  const groups = new Map();
  for (const todo of todos) {
    const key = todo.startAt ? localDateKey(new Date(todo.startAt)) : 'unscheduled';
    const group = groups.get(key) ?? { key, todos: [] };
    group.todos.push(todo);
    groups.set(key, group);
  }
  if (selectedDate && !groups.has(selectedDate)) groups.set(selectedDate, { key: selectedDate, todos: [] });
  const sorted = [...groups.values()].sort((left, right) => {
    if (left.key === 'unscheduled') return 1;
    if (right.key === 'unscheduled') return -1;
    return left.key.localeCompare(right.key);
  });
  const renderGroup = (group) => {
    group.todos.sort(compareTimeline);
    const date = planDateInfo(group.key, now);
    return h('section', { className: `dsh-todo-planner-task-group dsh-todo-planner-plan-group${group.key === selectedDate ? ' is-selected' : ''}`, key: group.key, 'data-plan-date': group.key },
      h('header', { className: 'dsh-todo-planner-group-header dsh-todo-planner-plan-group-header' },
        h('span', { className: 'dsh-todo-planner-group-dot', 'aria-hidden': true }),
        h('div', { className: 'dsh-todo-planner-group-heading' },
          h('div', { className: 'dsh-todo-planner-plan-day' },
            h('div', { className: 'dsh-todo-planner-plan-day-copy' }, h('strong', null, date.distance), h('span', null, `${date.monthDay} · ${date.weekday}`))),
          h('div', { className: 'dsh-todo-planner-plan-group-summary' }, h('span', null, `${group.todos.length} 项`)))),
      group.todos.length
        ? h('div', { className: 'dsh-todo-planner-task-timeline' }, group.todos.map(renderTodo))
        : h('p', { className: 'dsh-todo-planner-plan-date-empty', role: 'status' }, '当天暂无计划')
    );
  };
  return h(React.Fragment, null, sorted.map(renderGroup));
}

function compareTimeline(left, right) {
  const leftStart = Date.parse(left.startAt ?? left.dueAt ?? '') || Number.MAX_SAFE_INTEGER;
  const rightStart = Date.parse(right.startAt ?? right.dueAt ?? '') || Number.MAX_SAFE_INTEGER;
  if (leftStart !== rightStart) return leftStart - rightStart;
  const priorityRank = { urgent: 0, high: 1, normal: 2, low: 3 };
  return (priorityRank[left.priority] ?? 2) - (priorityRank[right.priority] ?? 2);
}

function ScheduleManager({ records, total, query, onQueryChange, filter, onFilterChange, selected, selectedTab, onSelect, onBack, onTabChange, status, error, onRetry, onEdit, onDelete, onDispatch, onOpenSession, dispatching }) {
  const filters = [['all', '全部'], ['active', '已开启'], ['inactive', '未运行']];
  return h('div', { className: `dsh-todo-planner-schedule-manager${selected ? ' has-detail' : ''}` },
    h('div', { className: 'dsh-todo-planner-schedule-layout' },
      h('section', { className: 'dsh-todo-planner-schedule-list-pane', 'aria-label': '自动化任务列表' },
        h('label', { className: 'dsh-todo-planner-schedule-search' },
          h(IconSearchOutlineRegular, { size: 15, 'aria-hidden': true }),
          h('input', { type: 'search', value: query, placeholder: '搜索名称、指令或会话 ID', 'aria-label': '搜索自动化任务', onChange: (event) => onQueryChange(event.target.value) }),
          query ? h('button', { type: 'button', className: 'dsh-todo-planner-schedule-clear', 'aria-label': '清除搜索', onClick: () => onQueryChange('') }, '×') : null
        ),
        h('div', { className: 'dsh-todo-planner-schedule-filters', role: 'group', 'aria-label': '任务状态' }, filters.map(([value, label]) => h('button', { type: 'button', key: value, className: filter === value ? 'is-selected' : '', 'aria-pressed': filter === value, onClick: () => onFilterChange(value) }, label))),
        h('div', { className: 'dsh-todo-planner-schedule-list', 'aria-busy': status === 'loading' || status === 'refreshing' },
          status === 'error' ? h('div', { className: 'dsh-todo-planner-schedule-feedback dsh-todo-planner-error', role: 'alert' }, h('p', null, error || '无法读取定时任务'), h(Button, { type: 'button', variant: 'outline', size: 'sm', onClick: onRetry }, '重试')) : null,
          status === 'loading' || status === 'idle' ? h('div', { className: 'dsh-todo-planner-schedule-feedback', role: 'status' }, '正在读取定时任务') : null,
          status === 'refreshing' ? h('div', { className: 'dsh-todo-planner-schedule-refreshing', role: 'status' }, '正在更新') : null,
          records.length ? h('ul', { className: 'dsh-todo-planner-schedule-rows' }, records.map((record) => h('li', { key: record.id },
            h('button', { type: 'button', className: `dsh-todo-planner-schedule-entry${selected?.id === record.id ? ' is-selected' : ''}${record.status === 'inactive' ? ' is-inactive' : ''}`, 'aria-label': record.title, 'aria-expanded': selected?.id === record.id, onClick: () => onSelect(record) },
              h(IconClockOutlineRegular, { className: 'dsh-todo-planner-schedule-entry-icon', size: 16, 'aria-hidden': true }),
              h('span', { className: 'dsh-todo-planner-schedule-entry-copy' },
                h('span', { className: 'dsh-todo-planner-schedule-entry-title' }, record.title),
                h('span', { className: 'dsh-todo-planner-schedule-entry-summary' },
                  record.status === 'inactive' ? h('span', { className: 'dsh-todo-planner-schedule-entry-status' }, '未运行') : null,
                  h('span', null, scheduleFrequency(record)),
                  record.status === 'active' ? h('span', null, '下次运行 ', h('time', { dateTime: record.scheduledAt }, formatScheduleMoment(record.scheduledAt))) : record.lastDelivery ? h('span', null, '最近运行 ', h('time', { dateTime: record.lastDelivery.scheduledAt }, formatScheduleMoment(record.lastDelivery.scheduledAt))) : null
                )
              )
            )
          ))) : status === 'ready' ? h('div', { className: 'dsh-todo-planner-schedule-empty', role: 'status' },
            h(IconClockOutlineRegular, { size: 23, 'aria-hidden': true }),
            h('p', null, total === 0 ? '还没有自动化任务' : '没有匹配的任务'),
            query || filter !== 'all' ? h('button', { type: 'button', onClick: () => { onQueryChange(''); onFilterChange('all'); } }, '清除筛选') : null
          ) : null
        )
      ),
      selected ? h(ScheduleDetail, { record: selected, tab: selectedTab, onTabChange, onBack, onEdit, onDelete, onDispatch, onOpenSession, dispatching }) : null
    )
  );
}

function ScheduleDetail({ record, tab, onTabChange, onBack, onEdit, onDelete, onDispatch, onOpenSession, dispatching }) {
  const tabs = [['rule', '规则'], ['history', '任务运行记录']];
  const active = record.status === 'active';
  return h('section', { className: 'dsh-todo-planner-schedule-detail', 'aria-label': `自动化任务：${record.title}` },
    h('header', { className: 'dsh-todo-planner-schedule-detail-header' },
      h('button', { type: 'button', className: 'dsh-todo-planner-schedule-back', onClick: onBack }, h(IconChevronLeftOutlineRegular, { size: 15 }), '全部任务'),
      h('div', { className: 'dsh-todo-planner-schedule-detail-actions' },
        active ? h(Button, { type: 'button', variant: 'ghost', size: 'sm', onClick: () => onDispatch(record), disabled: dispatching }, h(IconPlayOutlineRegular, { size: 14 }), '交给 Harness') : null,
        active ? h(Button, { type: 'button', variant: 'ghost', size: 'sm', onClick: () => onEdit(record) }, h(IconEditOutlineRegular, { size: 14 }), '编辑') : null,
        h(IconActionButton, { type: 'button', variant: 'ghost', size: 'sm', className: 'dsh-todo-planner-action-button dsh-todo-planner-action-danger', icon: h(IconTrashOutlineRegular, { size: 15 }), label: '删除任务', onClick: () => onDelete(record) })
      )
    ),
    h('div', { className: 'dsh-todo-planner-schedule-detail-heading' },
      h('span', { className: `dsh-todo-planner-schedule-status${active ? ' is-active' : ' is-inactive'}` }, active ? '已开启' : '未运行'),
      h('h2', null, record.title),
      active ? h('p', null, h(IconAlarmClockOutlineRegular, { size: 15, 'aria-hidden': true }), '下次运行 ', h('time', { dateTime: record.scheduledAt }, formatScheduleMoment(record.scheduledAt))) : null
    ),
    h('div', { className: 'dsh-todo-planner-schedule-detail-tabs', role: 'tablist', 'aria-label': '任务详情' }, tabs.map(([value, label], index) => h('button', {
      type: 'button', role: 'tab', key: value, id: `dsh-todo-planner-schedule-tab-${record.id}-${value}`, 'aria-selected': tab === value,
      'aria-controls': `dsh-todo-planner-schedule-panel-${record.id}`, tabIndex: tab === value ? 0 : -1,
      onClick: () => onTabChange(value),
      onKeyDown: (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
        onTabChange(tabs[next][0]);
        event.currentTarget.parentElement?.querySelectorAll('[role="tab"]')[next]?.focus();
      }
    }, label))),
    h('div', { id: `dsh-todo-planner-schedule-panel-${record.id}`, role: 'tabpanel', 'aria-labelledby': `dsh-todo-planner-schedule-tab-${record.id}-${tab}`, className: 'dsh-todo-planner-schedule-detail-scroll' },
      tab === 'history' ? h(ScheduleHistory, { key: record.id, record }) : h(React.Fragment, null,
        h('section', { className: 'dsh-todo-planner-schedule-rule-section' },
          h('h3', null, '运行时间'),
          h('div', { className: 'dsh-todo-planner-schedule-rule-rows' },
            h('div', { className: 'dsh-todo-planner-schedule-rule-row' }, h('span', null, '重复'), h('strong', null, scheduleFrequency(record))),
            record.timeZone ? h('div', { className: 'dsh-todo-planner-schedule-rule-row' }, h('span', null, '时区'), h('strong', null, record.timeZone)) : null,
            h('div', { className: 'dsh-todo-planner-schedule-rule-row' }, h('span', null, '状态'), h('strong', null, active ? '已开启' : '未运行'))
          )
        ),
        h('section', { className: 'dsh-todo-planner-schedule-rule-section' }, h('h3', null, '执行内容'), h('p', { className: 'dsh-todo-planner-schedule-prompt' }, record.prompt)),
        h('button', { type: 'button', className: 'dsh-todo-planner-schedule-linked-session', onClick: () => onOpenSession(record) },
          h('span', null, '关联会话'), h('code', null, record.sessionId), h('span', { className: 'dsh-todo-planner-schedule-open-session' }, '打开')
        ),
        h('p', { className: 'dsh-todo-planner-schedule-id' }, '任务 ID ', h('code', null, record.id))
      )
    )
  );
}

function ScheduleHistory({ record }) {
  const [history, setHistory] = useState({ status: 'loading', records: [], nextBefore: null, earlierRecordsPruned: false, retention: null, error: '' });
  const requestEpoch = useRef(0);
  const load = useCallback(async (before) => {
    const epoch = ++requestEpoch.current;
    setHistory((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      const result = await runtimeContext.remote.schedule.history({ sessionId: record.sessionId, id: record.id, limit: 20, ...(before ? { before } : {}) });
      if (epoch !== requestEpoch.current) return;
      if (!result.ok) throw new Error(result.error?.message ?? '无法读取运行记录');
      if ('code' in result.value) throw new Error(result.value.code === 'delivery_cursor_not_found' ? '记录分页已变化，请重新加载' : '任务记录不存在');
      setHistory((current) => ({
        status: 'ready',
        records: before ? [...current.records, ...result.value.records.filter((item) => !current.records.some((existing) => existing.messageId === item.messageId))] : result.value.records,
        nextBefore: result.value.nextBefore ?? null,
        earlierRecordsPruned: result.value.earlierRecordsPruned,
        retention: result.value.retention,
        error: ''
      }));
    } catch (failure) {
      if (epoch === requestEpoch.current) setHistory((current) => ({ ...current, status: 'error', error: failure.message }));
    }
  }, [record.id, record.sessionId]);
  useEffect(() => {
    load();
    return () => { requestEpoch.current += 1; };
  }, [load, record.lastDelivery?.messageId]);
  return h('div', { className: 'dsh-todo-planner-schedule-history', 'aria-busy': history.status === 'loading' },
    history.status === 'loading' && !history.records.length ? h('div', { className: 'dsh-todo-planner-schedule-feedback', role: 'status' }, '正在读取运行记录') : null,
    history.status === 'error' ? h('div', { className: 'dsh-todo-planner-schedule-history-error', role: 'alert' }, h('p', null, history.error), h(Button, { type: 'button', variant: 'outline', size: 'sm', onClick: () => load() }, '重新加载')) : null,
    history.status === 'ready' && !history.records.length ? h('div', { className: 'dsh-todo-planner-schedule-empty' }, h(IconClockOutlineRegular, { size: 22, 'aria-hidden': true }), h('p', null, '还没有已保存的运行记录')) : null,
    history.records.map((item) => h('article', { className: 'dsh-todo-planner-schedule-delivery', key: item.messageId },
      h(IconClockOutlineRegular, { size: 15, 'aria-hidden': true }),
      h('div', { className: 'dsh-todo-planner-schedule-delivery-copy' },
        h('time', { dateTime: item.scheduledAt }, formatScheduleOccurrence(item.scheduledAt, record.timeZone)),
        item.prompt ? h('details', { className: 'dsh-todo-planner-schedule-delivery-prompt' }, h('summary', null, '查看已发送内容'), h('p', null, item.prompt)) : null
      )
    )),
    history.nextBefore ? h(Button, { type: 'button', variant: 'outline', size: 'sm', disabled: history.status === 'loading', onClick: () => load(history.nextBefore) }, history.status === 'loading' ? '加载中' : '加载更早记录') : null,
    history.status === 'ready' && history.records.length && history.earlierRecordsPruned && !history.nextBefore ? h('details', { className: 'dsh-todo-planner-schedule-retention' }, h('summary', null, '旧记录已按保留规则清理'), h('p', null, `最多保留 ${history.retention?.records ?? '配置'} 条记录，保留期 ${history.retention?.days ?? '配置'} 天。`)) : null
  );
}

function formatScheduleMoment(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '时间未知';
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
}

function formatScheduleOccurrence(value, timeZone) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '时间未知';
  try {
    return new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false, ...(timeZone ? { timeZone } : {}) }).format(date);
  } catch {
    return formatScheduleMoment(value);
  }
}

function scheduleFrequency(record) {
  if (record.kind === 'after') return `延迟 ${formatDuration(record.afterSeconds)} 后执行`;
  if (record.kind === 'at') return '指定时间执行';
  if (record.kind === 'every') return `每 ${formatDuration(record.everySeconds)}`;
  if (record.kind === 'daily') return `每天 ${formatScheduleClock(record.time)}`;
  if (record.kind === 'weekly') return `每周 ${record.weekdays.map(formatIsoWeekday).join('、')} ${formatScheduleClock(record.time)}`;
  if (record.kind === 'cron') return `Cron ${record.expression}`;
  return record.kind;
}

function formatIsoWeekday(day) {
  const labels = { 1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日' };
  return labels[day] ?? `周${day}`;
}

function formatScheduleClock(value) {
  return typeof value === 'string' ? value.slice(0, 5) : '';
}

function scheduleExpectedRecord(record) {
  const expected = { id: record.id, kind: record.kind, title: record.title, prompt: record.prompt, scheduledAt: record.scheduledAt };
  for (const field of ['afterSeconds', 'everySeconds', 'time', 'timeZone', 'weekdays', 'expression']) {
    if (record[field] !== undefined) expected[field] = record[field];
  }
  return expected;
}

function formatDuration(seconds) {
  if (seconds % 86400 === 0) return `${seconds / 86400} 天`;
  if (seconds % 3600 === 0) return `${seconds / 3600} 小时`;
  if (seconds % 60 === 0) return `${seconds / 60} 分钟`;
  return `${seconds} 秒`;
}

function useApiData(resource, intervalMs) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const refresh = useCallback(async () => {
    try {
      const remoteMethod = resource === 'todos' ? 'listTodos' : resource === 'usage' ? 'getUsage' : null;
      if (!remoteMethod) throw new Error(`Unsupported Todo resource: ${resource}`);
      const result = await callTodoPlannerRemote(remoteMethod, resource === 'todos' ? [{ includeArchived: true }] : []);
      setData(result);
      setError(null);
    } catch (failure) {
      setError(failure);
    }
  }, [resource]);

  useEffect(() => {
    let active = true;
    const safeRefresh = async () => {
      if (!active) return;
      await refresh();
    };
    safeRefresh();
    const timer = window.setInterval(safeRefresh, intervalMs);
    window.addEventListener('focus', safeRefresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', safeRefresh);
    };
  }, [intervalMs, refresh]);
  return { data, error, refresh };
}

function selectTodos(todos, segment, showCompleted = false, now = Date.now(), planStartDate, rangeDays = 7) {
  const today = localDateKey(new Date(now));
  const rangeStart = planStartDate ?? today;
  const rangeEnd = segment === 'plan' ? planDateRange(rangeStart, rangeDays).end : null;
  return todos.filter((todo) => {
    const isDone = todo.status === 'done';
    const dueDate = todo.dueAt ? localDateKey(new Date(todo.dueAt)) : null;
    const startDate = todo.startAt ? localDateKey(new Date(todo.startAt)) : null;
    if (segment === 'plan') return (!startDate || (startDate >= rangeStart && startDate < rangeEnd)) && (isActiveTodo(todo) || (showCompleted && isDone));
    if (isDone) return showCompleted && (startDate === today || dueDate === today || (todo.completedAt && localDateKey(new Date(todo.completedAt)) === today));
    return isActiveTodo(todo) && (isOverdueTodo(todo, now) || (startDate && startDate <= today) || (dueDate && dueDate <= today) || (!startDate && !dueDate));
  });
}

function emptyLabel(segment) {
  if (segment === 'today') return '今天没有待办';
  if (segment === 'scheduled') return '没有定时任务';
  return '计划列表为空';
}

function isActiveTodo(todo) {
  return !['done', 'canceled', 'archived'].includes(todo.status);
}

function isOverdueTodo(todo, now = Date.now()) {
  return isActiveTodo(todo) && Boolean(todo.dueAt) && Date.parse(todo.dueAt) < now;
}

function statusLabel(status) {
  return ({ todo: '待处理', in_progress: '进行中', blocked: '受阻', done: '已完成', canceled: '已取消', archived: '已归档' })[status] ?? status;
}

function priorityLabel(priority) {
  return priority === 'urgent' ? '紧急' : priority === 'high' ? '高' : priority === 'low' ? '低' : '普通';
}

function formatDue(value) {
  if (!value) return '';
  const date = new Date(value);
  return `截止 ${new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)}`;
}

function inputDateTimeParts(value) {
  if (!value) return { date: '', time: '' };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: '', time: '' };
  return {
    date: localDateKey(date),
    time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  };
}

function localInputToIso(dateValue, timeValue, endOfDay) {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split('-').map(Number);
  if (![year, month, day].every(Number.isInteger)) return null;
  const [hours, minutes] = (timeValue || (endOfDay ? '23:59' : '00:00')).split(':').map(Number);
  const date = new Date(year, month - 1, day, hours || 0, minutes || 0, endOfDay && !timeValue ? 59 : 0, 0);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function formatDateWithWeekday(value) {
  return new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date(value));
}

function formatMonthDayTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
}

function formatTimelineMarker(todo) {
  const value = todo.startAt;
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return formatTime(value);
}

function formatTodoWindow(todo) {
  const start = todo.startAt;
  if (start && todo.estimatedMinutes) {
    const end = new Date(Date.parse(start) + todo.estimatedMinutes * 60_000).toISOString();
    const crossesDay = localDateKey(new Date(start)) !== localDateKey(new Date(end));
    return crossesDay ? `计划 ${formatMonthDayTime(start)} - ${formatMonthDayTime(end)}` : `计划 ${formatMonthDayTime(start)} - ${formatTime(end)}`;
  }
  if (start) return `计划 ${formatMonthDayTime(start)}`;
  return '待排期';
}

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
}

function planDateInfo(key, now = Date.now()) {
  if (key === 'unscheduled') return { weekday: '待安排', monthDay: '执行日期未定', distance: '待排期' };
  const date = new Date(`${key}T12:00:00`);
  const today = new Date(now);
  const dateOrdinal = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOrdinal = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const daysFromToday = Math.round((dateOrdinal - todayOrdinal) / 86_400_000);
  const distance = daysFromToday === 0 ? '今天' : daysFromToday === 1 ? '明天' : daysFromToday === 2 ? '后天' : daysFromToday > 0 ? `还有 ${daysFromToday} 天` : `${Math.abs(daysFromToday)} 天前`;
  return {
    weekday: new Intl.DateTimeFormat('zh-CN', { weekday: 'short' }).format(date),
    monthDay: new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(date),
    distance
  };
}

function formatMinutes(value) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes)) return '';
  return `预估 ${formatDurationMinutes(minutes)}`;
}

function formatDurationMinutes(value) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes)) return '';
  if (minutes % 1440 === 0) return `${minutes / 1440} 天`;
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60} 小时`;
  return `${minutes} 分钟`;
}

function deadlineUrgency(todo, now = Date.now()) {
  if (todo.status === 'done' || todo.status === 'canceled' || todo.status === 'archived') return 'done';
  if (!todo.dueAt) return 'unscheduled';
  const difference = Date.parse(todo.dueAt) - now;
  if (difference < 0) return 'overdue';
  if (difference <= 2 * 60 * 60 * 1000) return 'critical';
  if (difference <= 24 * 60 * 60 * 1000) return 'soon';
  return 'normal';
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isToday(value) {
  return typeof value === 'string' && localDateKey(new Date(value)) === localDateKey(new Date());
}

function sumUsage(entries) {
  return entries.reduce((total, entry) => {
    total.inputTokens += (entry.inputTokens ?? 0) + (entry.cacheReadTokens ?? 0) + (entry.cacheWriteTokens ?? 0);
    total.outputTokens += entry.outputTokens ?? 0;
    total.totalTokens += entry.totalTokens ?? ((entry.inputTokens ?? 0) + (entry.outputTokens ?? 0));
    total.calls += 1;
    return total;
  }, { inputTokens: 0, outputTokens: 0, totalTokens: 0, calls: 0 });
}

function formatNumber(value) {
  return new Intl.NumberFormat('zh-CN').format(value ?? 0);
}

function installStyles() {
  const existing = document.querySelector('style[data-dsh-todo-planner]');
  if (existing) return () => {};
  const style = document.createElement('style');
  style.dataset.dshTodoPlanner = 'true';
  style.textContent = `
    @media(min-width:1024px){
      #root [data-slot=root]>div:has(>[data-rightbar-col]){grid-template-columns:auto minmax(0,1fr) minmax(0,33.333vw)!important}
      #root [data-slot=root]>div:has(>[data-rightbar-col])>[data-rightbar-col]{min-width:0!important}
      #root [data-slot=root]>div:has(>[data-rightbar-col])>[data-side=rightbar]{display:none!important}
      [data-sidebar-right-open]{width:33.333vw!important;min-width:0!important;max-width:33.333vw;--dsh-sidebar-width:33.333vw!important}
    }
    .dsh-todo-planner-panel{box-sizing:border-box;display:flex;flex:1;flex-direction:column;gap:12px;min-width:0;min-height:0;width:100%;padding:14px 16px 12px;color:var(--dsw-alias-label-primary)}
    .dsh-todo-planner-expand-button,.dsh-todo-planner-action-button{background:transparent!important;border-color:transparent!important;box-shadow:none!important}
    .dsh-todo-planner-expand-button:hover:not(:disabled){background:transparent!important;color:var(--dsw-alias-label-primary)!important}
    .dsh-todo-planner-action-button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)!important;color:var(--dsw-alias-label-primary)!important}
    .dsh-todo-planner-expand-button:focus-visible,.dsh-todo-planner-action-button:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
    .dsh-todo-planner-action-danger:hover:not(:disabled){color:var(--dsw-alias-state-error-primary)!important;background:var(--dsw-alias-interactive-bg-hover-danger)!important}
    .dsh-todo-planner-panel-collapsed{align-items:center;gap:12px;width:64px;padding:12px 6px;border-left:1px solid var(--dsw-alias-border-l3)}
    .dsh-todo-planner-expand-button{width:32px;height:32px;flex:none;justify-content:center}
    .dsh-todo-planner-compact-stats{display:grid;width:100%;gap:8px}
    .dsh-todo-planner-compact-stat{display:grid;justify-items:center;gap:3px;min-width:0;padding:5px 0;border-bottom:1px solid var(--dsw-alias-border-l3);font-variant-numeric:tabular-nums}
    .dsh-todo-planner-compact-stat span{color:var(--dsw-alias-label-tertiary);font-size:9px;line-height:13px;white-space:nowrap}
    .dsh-todo-planner-compact-stat strong{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:600;line-height:17px;overflow-wrap:anywhere}
    .dsh-todo-planner-list{flex:1;min-height:0;overflow:auto;padding:0 2px 4px;overscroll-behavior:contain}
    .dsh-todo-planner-row{display:flex;align-items:flex-start;gap:10px;min-width:0;padding:13px 2px;border-bottom:1px solid var(--dsw-alias-border-l3)}
    .dsh-todo-planner-dot{width:8px;height:8px;margin-top:6px;border-radius:50%;background:#88929b;flex:none}
    .dsh-todo-planner-dot-in_progress{background:#4d9a73}.dsh-todo-planner-dot-blocked{background:#c57446}.dsh-todo-planner-dot-done{background:#6e9b7e}.dsh-todo-planner-dot-canceled,.dsh-todo-planner-dot-archived{background:#89929b}
    .dsh-todo-planner-row-copy{min-width:0;flex:1}
    .dsh-todo-planner-row-actions{display:flex;align-items:center;flex:none;gap:2px;margin-left:auto}.dsh-todo-planner-row-actions>button{width:30px;height:30px;min-width:30px;flex:none;padding:0}
    .dsh-todo-planner-row-copy strong{display:block;overflow-wrap:anywhere;font-size:13px;font-weight:500;line-height:19px}
    .dsh-todo-planner-priority{font-weight:600}.dsh-todo-planner-priority-low{color:var(--dsw-alias-label-tertiary)}.dsh-todo-planner-priority-normal{color:var(--dsw-alias-label-secondary)}.dsh-todo-planner-priority-high{color:#b17a2f}.dsh-todo-planner-priority-urgent{color:#b45f54}
    .dsh-todo-planner-effort{padding-left:5px;color:var(--dsw-alias-label-tertiary)}
    .dsh-todo-planner-timeline-group{margin:2px 0 16px}.dsh-todo-planner-timeline-group-header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 1px 8px;border-bottom:1px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:14px}.dsh-todo-planner-timeline-group-header>div{display:flex;align-items:baseline;flex-wrap:wrap;gap:7px;min-width:0}.dsh-todo-planner-timeline-group-header strong{color:var(--dsw-alias-label-primary);font-size:12px;font-weight:600}.dsh-todo-planner-timeline-group-header>span{flex:none;font-variant-numeric:tabular-nums}.dsh-todo-planner-timeline-group-overdue .dsh-todo-planner-timeline-group-header strong{color:#ad574e}
    .dsh-todo-planner-task-timeline{display:flex;flex-direction:column;min-width:0;padding:3px 0 2px}
    .dsh-todo-planner-task-group{--dsh-todo-planner-timeline-rail:clamp(20px,5%,32px);--dsh-todo-planner-timeline-gap:8px;--dsh-todo-planner-timeline-dot-size:12px}
    .dsh-todo-planner-timeline-item{display:grid;grid-template-columns:var(--dsh-todo-planner-timeline-rail) minmax(0,1fr);column-gap:var(--dsh-todo-planner-timeline-gap);min-width:0}
    .dsh-todo-planner-timeline-marker{display:grid;grid-column:1;grid-row:1;place-items:center;min-width:0}
    .dsh-todo-planner-timeline-marker:before{grid-area:1/1;align-self:stretch;width:1px;background:var(--dsw-alias-border-l3);content:""}
    .dsh-todo-planner-timeline-marker .dsh-todo-planner-dot{grid-area:1/1;z-index:1;box-sizing:border-box;width:var(--dsh-todo-planner-timeline-dot-size);height:var(--dsh-todo-planner-timeline-dot-size);margin:0;border:2px solid var(--dsw-alias-bg-base);box-shadow:none}
    .dsh-todo-planner-timeline-item>.dsh-todo-planner-row{grid-column:2;grid-row:1;margin-block:9px}
    .dsh-todo-planner-row{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:9px;min-width:0;margin:7px 0;padding:10px 8px;border:1px solid var(--dsw-alias-border-l3);border-radius:5px;background:var(--dsw-alias-bg-base);transition:border-color .15s ease,background .15s ease}
    .dsh-todo-planner-row:hover{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base))}.dsh-todo-planner-row.dsh-todo-planner-urgency-overdue{border-left:3px solid #b45f54;background:color-mix(in srgb,#b45f54 4%,var(--dsw-alias-bg-base))}.dsh-todo-planner-row.dsh-todo-planner-urgency-critical{border-left:3px solid #c57446}.dsh-todo-planner-row.dsh-todo-planner-urgency-soon{border-left:3px solid #b17a2f}.dsh-todo-planner-row.dsh-todo-planner-task-done{opacity:.72}
    .dsh-todo-planner-row-copy{grid-column:1;min-width:0}.dsh-todo-planner-row-title{display:flex;align-items:center;flex-wrap:wrap;gap:5px;min-width:0}.dsh-todo-planner-row-title>strong{flex:1 1 125px;min-width:0;overflow-wrap:anywhere;color:var(--dsw-alias-label-primary);font-size:13px;font-weight:550;line-height:18px}.dsh-todo-planner-task-done .dsh-todo-planner-row-title>strong{color:var(--dsw-alias-label-secondary);text-decoration:line-through;text-decoration-color:var(--dsw-alias-label-dimmed)}
    .dsh-todo-planner-status,.dsh-todo-planner-priority{display:inline-flex;align-items:center;min-height:18px;max-width:100%;padding:1px 5px;border-radius:4px;font-size:10px;font-weight:600;line-height:14px;white-space:nowrap}.dsh-todo-planner-status{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}.dsh-todo-planner-status-in_progress{background:color-mix(in srgb,#4d9a73 14%,var(--dsw-alias-bg-base));color:#36724f}.dsh-todo-planner-status-blocked{background:color-mix(in srgb,#c57446 14%,var(--dsw-alias-bg-base));color:#a85e3e}.dsh-todo-planner-status-done{background:color-mix(in srgb,#6e9b7e 13%,var(--dsw-alias-bg-base));color:#56846e}.dsh-todo-planner-priority-low{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-tertiary)}.dsh-todo-planner-priority-normal{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}.dsh-todo-planner-priority-high{background:color-mix(in srgb,#b17a2f 13%,var(--dsw-alias-bg-base));color:#9a6827}.dsh-todo-planner-priority-urgent{background:color-mix(in srgb,#b45f54 13%,var(--dsw-alias-bg-base));color:#a34f45}
    .dsh-todo-planner-row-time-range{display:flex;align-items:center;flex-wrap:wrap;gap:5px 9px;margin-top:5px;color:var(--dsw-alias-label-secondary);font-size:10px;line-height:15px;font-variant-numeric:tabular-nums}
    .dsh-todo-planner-row-actions{grid-column:2;grid-row:1;align-self:start;gap:1px;margin:0}.dsh-todo-planner-row-actions>button{width:27px;height:27px;min-width:27px}.dsh-todo-planner-action-button{color:var(--dsw-alias-label-tertiary)!important}.dsh-todo-planner-action-button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)!important}.dsh-todo-planner-action-danger:hover:not(:disabled){color:var(--dsw-alias-state-error-primary)!important}
    .dsh-todo-planner-plan-day{display:flex;align-items:center;gap:8px;min-width:0}.dsh-todo-planner-plan-day-copy{display:flex;flex-direction:column;gap:1px;min-width:0}.dsh-todo-planner-plan-day-copy strong{color:var(--dsw-alias-label-primary);font-size:12px;font-weight:600;line-height:16px}.dsh-todo-planner-plan-day-copy span{color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:13px}.dsh-todo-planner-plan-group-summary{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:4px 8px;min-width:0;text-align:right}.dsh-todo-planner-plan-group-summary>span{white-space:nowrap}
    .dsh-todo-planner-notes{margin:6px 0 0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:17px;white-space:pre-wrap;overflow-wrap:anywhere}
    .dsh-todo-planner-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px}.dsh-todo-planner-tags span{border-radius:4px;background:var(--dsw-alias-interactive-bg-hover);padding:2px 6px;color:var(--dsw-alias-label-secondary);font-size:10px;line-height:14px}
    .dsh-todo-planner-state{display:grid;min-height:150px;place-content:center;justify-items:center;gap:8px;color:var(--dsw-alias-label-tertiary);font-size:13px;text-align:center}.dsh-todo-planner-state p{margin:0}.dsh-todo-planner-error{color:#a85f54}
    .dsh-todo-planner-notice{margin:0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;overflow-wrap:anywhere}
    .dsh-todo-planner-token-usage{box-sizing:border-box;display:flex;flex-direction:column;gap:7px;width:100%;padding:0 2px 12px;color:var(--dsw-alias-label-tertiary)}
    .dsh-todo-planner-token-usage-label{display:flex;flex-direction:column;gap:4px;min-width:0;font-size:11px;line-height:15px}
    .dsh-todo-planner-token-usage-label strong{overflow-wrap:anywhere;color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:500;font-variant-numeric:tabular-nums}
    .dsh-todo-planner-token-usage-track{height:5px;overflow:hidden;border-radius:3px;background:var(--dsw-alias-interactive-bg-hover)}
    .dsh-todo-planner-token-usage-track span{display:block;height:100%;border-radius:inherit;background:#56846e;transition:width .2s ease}
    .dsh-todo-planner-modal{box-sizing:border-box;width:min(520px,calc(100vw - 32px));max-width:calc(100vw - 32px);max-height:min(82vh,760px)}.dsh-todo-planner-modal-content{box-sizing:border-box;width:100%;min-width:0;max-width:100%;max-height:100%;overflow:auto}
    .dsh-todo-planner-editor{display:flex;flex-direction:column;gap:14px;min-width:0}.dsh-todo-planner-editor-field{display:flex;flex-direction:column;gap:7px;min-width:0;color:var(--dsw-alias-label-secondary);font-size:12px}.dsh-todo-planner-editor-title input{height:42px;font-size:14px}.dsh-todo-planner-editor-field input,.dsh-todo-planner-editor-field select,.dsh-todo-planner-editor-field textarea{box-sizing:border-box;width:100%;min-width:0;border:1px solid var(--dsw-alias-border-l3);border-radius:5px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;padding:8px 10px}.dsh-todo-planner-editor-field input,.dsh-todo-planner-editor-field select{height:38px}.dsh-todo-planner-editor-field textarea{resize:vertical;line-height:18px}.dsh-todo-planner-editor-field input:focus,.dsh-todo-planner-editor-field select:focus,.dsh-todo-planner-editor-field textarea:focus{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}.dsh-todo-planner-editor-field input::placeholder,.dsh-todo-planner-editor-field textarea::placeholder{color:var(--dsw-alias-label-dimmed)}.dsh-todo-planner-editor-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.dsh-todo-planner-todo-fields{align-items:start}.dsh-todo-planner-editor-actions{display:flex;justify-content:flex-end;gap:8px;padding-top:10px;border-top:1px solid var(--dsw-alias-border-l3)}.dsh-todo-planner-editor-help{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}.dsh-todo-planner-editor-timezone{align-self:end;padding:9px 0;color:var(--dsw-alias-label-tertiary);font-size:12px}.dsh-todo-planner-weekdays{display:flex;align-items:center;flex-wrap:wrap;gap:7px;border:0;margin:0;padding:0}.dsh-todo-planner-weekdays legend{width:100%;margin-bottom:0;color:var(--dsw-alias-label-secondary);font-size:12px}.dsh-todo-planner-weekday{display:inline-flex;align-items:center;gap:4px;color:var(--dsw-alias-label-tertiary);font-size:12px}.dsh-todo-planner-weekday input{accent-color:var(--dsw-alias-state-business-primary)}
    .dsh-todo-planner-input-with-suffix{display:flex;align-items:center;gap:8px}.dsh-todo-planner-input-with-suffix input{min-width:0;flex:1}.dsh-todo-planner-input-with-suffix span{color:var(--dsw-alias-label-tertiary);font-size:12px;white-space:nowrap}.dsh-todo-planner-confirm-modal{width:min(460px,calc(100vw - 32px));max-width:calc(100vw - 32px)}.dsh-todo-planner-confirmation{display:flex;flex-direction:column;gap:14px;color:var(--dsw-alias-label-primary);font-size:14px;line-height:22px}.dsh-todo-planner-confirmation p{margin:0;overflow-wrap:anywhere}
    .dsh-todo-planner-dispatch-modal{box-sizing:border-box;width:min(540px,calc(100vw - 32px));max-height:calc(100dvh - 32px);letter-spacing:0}
    .dsh-todo-planner-confirm-content{min-width:0;min-height:0;overflow:auto}
    .dsh-todo-planner-dispatch-model-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;align-items:start}
    .dsh-todo-planner-dispatch-model-menu{display:block;width:100%;min-width:0}
    .dsh-todo-planner-dispatch-model-trigger{box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-width:0;height:64px;padding:6px 10px;border:1px solid var(--dsw-alias-border-l3);border-radius:5px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer}
    .dsh-todo-planner-dispatch-model-trigger>svg{flex:none;color:var(--dsw-alias-label-tertiary)}
    .dsh-todo-planner-dispatch-model-trigger:disabled{opacity:.55;cursor:default}
    .dsh-todo-planner-dispatch-model-value{display:flex;flex:1;flex-direction:column;gap:1px;min-width:0}
    .dsh-todo-planner-dispatch-model-value strong{display:-webkit-box;overflow:hidden;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:13px;font-weight:500;line-height:18px;white-space:normal;overflow-wrap:anywhere}
    .dsh-todo-planner-dispatch-model-value small{overflow:hidden;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:15px;text-overflow:ellipsis;white-space:nowrap}
    .dsh-todo-planner-dispatch-model-list{box-sizing:border-box;min-width:0;max-width:calc(100vw - 48px);max-height:min(360px,48dvh);overflow:auto;letter-spacing:0}
    .dsh-todo-planner-dispatch-model-list [role=menuitem]{min-height:36px;height:auto}
    .dsh-todo-planner-dispatch-model-option{display:flex;flex-direction:column;min-width:0;padding:3px 0;white-space:normal;overflow-wrap:anywhere}
    .dsh-todo-planner-dispatch-model-option small{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}
    .dsh-todo-planner-dispatch-model-grid+.dsh-todo-planner-settings-help{margin-top:-6px}
    .dsh-todo-planner-dispatch-directory{display:flex;flex-direction:column;gap:10px;min-width:0;padding-top:16px;border-top:1px solid var(--dsw-alias-border-l3)}
    .dsh-todo-planner-dispatch-directory h3{margin:0;color:var(--dsw-alias-label-primary);font-size:13px;font-weight:600;line-height:20px}
    .dsh-todo-planner-dispatch-directory h3+.dsh-todo-planner-settings-help{margin-top:-5px}
    .dsh-todo-planner-dispatch-directory-modes{display:flex;align-items:center;flex-wrap:wrap;gap:10px 20px;padding:2px 0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:20px}
    .dsh-todo-planner-dispatch-directory-modes label{display:inline-flex;align-items:center;gap:6px;cursor:pointer}
    .dsh-todo-planner-dispatch-directory-modes input,.dsh-todo-planner-directory-hidden input{flex:none;width:14px;height:14px;margin:0;accent-color:var(--dsw-alias-state-business-primary)}
    .dsh-todo-planner-dispatch-recommended{color:var(--dsw-alias-state-business-primary);font-size:11px}
    .dsh-todo-planner-dispatch-directory-trigger,.dsh-todo-planner-dispatch-current-directory{box-sizing:border-box;display:flex;align-items:center;gap:10px;width:100%;min-width:0;min-height:68px;padding:12px;border:1px solid var(--dsw-alias-border-l3);border-radius:6px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font:inherit;text-align:left}
    .dsh-todo-planner-dispatch-directory-trigger{cursor:pointer}
    .dsh-todo-planner-dispatch-directory-trigger:hover{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-interactive-bg-hover)}
    .dsh-todo-planner-dispatch-directory-trigger>svg,.dsh-todo-planner-dispatch-current-directory>svg{flex:none;color:var(--dsw-alias-label-tertiary)}
    .dsh-todo-planner-dispatch-directory-copy{display:flex;flex:1;flex-direction:column;gap:3px;min-width:0;overflow-wrap:anywhere}
    .dsh-todo-planner-dispatch-directory-copy strong{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:19px}
    .dsh-todo-planner-dispatch-directory-copy>span{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px;white-space:normal}
    .dsh-todo-planner-dispatch-modal .dsh-todo-planner-editor-actions{width:100%;margin:0;padding:0;border:0}
    .dsh-todo-planner-dispatch-modal .dsh-todo-planner-editor-actions button{gap:6px;min-height:34px}
    .dsh-todo-planner-dispatch-model-trigger:focus-visible,.dsh-todo-planner-dispatch-directory-trigger:focus-visible,.dsh-todo-planner-directory-entry:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
    .dsh-todo-planner-directory-modal{box-sizing:border-box;width:min(580px,calc(100vw - 32px));max-height:calc(100dvh - 32px);letter-spacing:0}
    .dsh-todo-planner-directory-content{display:flex;min-height:0;min-width:0;overflow:auto}
    .dsh-todo-planner-directory-browser{display:flex;flex:1;flex-direction:column;gap:10px;min-width:0;min-height:0}
    .dsh-todo-planner-directory-address{box-sizing:border-box;display:flex;align-items:center;gap:3px;width:100%;min-width:0;padding:3px;border:1px solid var(--dsw-alias-border-l3);border-radius:5px}
    .dsh-todo-planner-directory-address input,.dsh-todo-planner-directory-create input{box-sizing:border-box;flex:1;width:0;min-width:0;height:32px;padding:0 5px;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px}
    .dsh-todo-planner-directory-address:focus-within{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
    .dsh-todo-planner-directory-address input:focus{outline:none}
    .dsh-todo-planner-directory-toolbar{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--dsw-alias-label-tertiary);font-size:12px}
    .dsh-todo-planner-directory-toolbar button{gap:5px;font-size:12px}
    .dsh-todo-planner-directory-create{display:flex;align-items:center;gap:8px;min-width:0}
    .dsh-todo-planner-directory-create input{border:1px solid var(--dsw-alias-border-l3);border-radius:4px;padding:0 8px}
    .dsh-todo-planner-directory-entries{height:min(270px,35dvh);min-height:90px;overflow:auto;overscroll-behavior:contain}
    .dsh-todo-planner-directory-entries>p{padding:12px 6px}
    .dsh-todo-planner-directory-native{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;height:100%;color:var(--dsw-alias-label-tertiary);text-align:center}
    .dsh-todo-planner-directory-entry{box-sizing:border-box;display:flex;align-items:center;gap:9px;width:100%;min-width:0;min-height:36px;padding:7px 6px;border:0;border-radius:4px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:13px;text-align:left;cursor:pointer}
    .dsh-todo-planner-directory-entry:hover{background:var(--dsw-alias-interactive-bg-hover)}
    .dsh-todo-planner-directory-entry>span{flex:1;min-width:0;overflow-wrap:anywhere}
    .dsh-todo-planner-directory-entry>svg{flex:none;color:var(--dsw-alias-label-tertiary)}
    .dsh-todo-planner-directory-location{margin:0;padding-top:8px;border-top:1px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px;overflow-wrap:anywhere}
    .dsh-todo-planner-directory-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;width:100%;min-width:0}
    .dsh-todo-planner-directory-hidden{display:flex;align-items:center;gap:6px;color:var(--dsw-alias-label-tertiary);font-size:12px}
    .dsh-todo-planner-directory-actions{display:flex;justify-content:flex-end;gap:8px;margin-left:auto}
    @media(max-width:420px){.dsh-todo-planner-dispatch-directory-modes{gap:8px 14px}.dsh-todo-planner-dispatch-directory-trigger,.dsh-todo-planner-dispatch-current-directory{padding:10px}.dsh-todo-planner-directory-footer{align-items:flex-start}.dsh-todo-planner-directory-actions{flex:1}}
    .dsh-todo-planner-settings-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:10px 12px;padding:14px 0;border-bottom:1px solid var(--dsw-alias-border-l3)}.dsh-todo-planner-settings-field{display:flex;flex-direction:column;gap:7px;min-width:0;color:var(--dsw-alias-label-secondary);font-size:13px}.dsh-todo-planner-settings-field input,.dsh-todo-planner-settings-field select{box-sizing:border-box;width:100%;height:36px;padding:0 10px;border:1px solid var(--dsw-alias-border-l3);border-radius:5px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit}.dsh-todo-planner-settings-field input:focus,.dsh-todo-planner-settings-field select:focus{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}.dsh-todo-planner-settings-help{grid-column:1/-1;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}.dsh-todo-planner-settings-error{grid-column:1/-1;color:var(--dsw-alias-state-error-primary);font-size:12px;overflow-wrap:anywhere}
    [data-sidebar-right-guide]{display:none!important}
    [data-sidebar-right-open] [data-dockkit-pane]:has([role="tab"][aria-selected="true"] [data-dsh-todo-planner-tab-title])>div:has(>[data-dockkit-strip]){display:none!important}
    [role="tab"]:has([data-dsh-todo-planner-tab-title]) [data-dockkit-tab-close]{display:none!important}
    #root [data-slot=root]>div:has(>[data-rightbar-col]):has([data-dsh-todo-planner-collapsed]){grid-template-columns:auto minmax(0,1fr) 64px!important}
    [data-sidebar-right-open]:has([data-dsh-todo-planner-collapsed]){width:64px!important;max-width:64px!important;--dsh-sidebar-width:64px!important}
    .dsh-todo-planner-model-url-field{display:flex;flex-direction:column;gap:6px;margin-top:8px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
    .dsh-todo-planner-model-url-field input{box-sizing:border-box;width:100%;height:34px;padding:0 10px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit}
    .dsh-todo-planner-model-url-field input:focus{border-color:var(--dsw-alias-state-business-primary);outline:none}
    .dsh-todo-planner-model-url-field input::placeholder{color:var(--dsw-alias-label-dimmed)}
    @media(max-width:767px){
      #root [data-slot=root]>div:has(>[data-rightbar-col]){grid-template-columns:56px minmax(0,1fr)!important;grid-template-rows:minmax(0,1fr)!important}
      #root [data-slot=root]>div:has(>[data-rightbar-col])>.pI_x6G_sidebarCol{grid-column:1;grid-row:1;z-index:30}
      #root [data-slot=root]>div:has(>[data-rightbar-col])>.pI_x6G_centerCol{grid-column:2;grid-row:1;min-height:0}
      #root [data-slot=root]>div:has(>[data-rightbar-col])>.pI_x6G_rightbarCol{grid-column:2;grid-row:1;min-height:0;overflow:visible;z-index:20}
      #root [data-slot=root]>div:has(>[data-rightbar-col]):has([data-dsh-todo-planner-collapsed]){grid-template-columns:56px minmax(0,1fr)!important}
      #root [data-slot=root]>div:has(>[data-rightbar-col]):not([data-dsh-todo-planner-mobile-todo-open="true"])>.pI_x6G_rightbarCol{pointer-events:none}
      #root [data-slot=root]>div:has(>[data-rightbar-col])[data-dsh-todo-planner-mobile-todo-open="true"]>.pI_x6G_rightbarCol{pointer-events:auto}
      [data-sidebar-right-open]:has([data-dsh-todo-planner-collapsed]){width:100%!important;max-width:none!important;--dsh-sidebar-width:100%!important}
      #root [data-slot=root]>div:has(>[data-rightbar-col]):not([data-dsh-todo-planner-mobile-todo-open="true"])>.pI_x6G_rightbarCol [data-sidebar-right-open]{display:none!important}
      #root [data-slot=root]>div:has(>[data-rightbar-col])[data-dsh-todo-planner-mobile-todo-open="true"]>.pI_x6G_centerCol{display:none!important}
      [data-sidebar-right-open]{box-sizing:border-box!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;min-width:0!important;--dsh-sidebar-width:100%!important}
      [data-sidebar-right-expand]{display:none!important}
      .dsh-todo-planner-collapse-button{display:none!important}
      .dsh-todo-planner-panel{height:100%;min-width:0;padding:12px}
      .dsh-todo-planner-modal{width:calc(100vw - 32px);max-width:calc(100vw - 32px);max-height:calc(100vh - 32px)}
      .dsh-todo-planner-settings-row{grid-template-columns:minmax(0,1fr) auto}
      .dsh-todo-planner-editor-grid{grid-template-columns:minmax(0,1fr)}
      .dsh-todo-planner-modal-content{width:100%;min-width:0;max-width:100%;max-height:100%}
      .dsh-todo-planner-plan-row{grid-template-columns:44px minmax(0,1fr);column-gap:12px}
      .dsh-todo-planner-plan-row .dsh-todo-planner-row-copy{grid-column:2;grid-row:1}
      .dsh-todo-planner-plan-row .dsh-todo-planner-row-actions{grid-column:2;grid-row:2;justify-self:start;margin:10px 0 0}
      .dsh-todo-planner-list{padding-right:0}
      .dsh-todo-planner-row{grid-template-columns:minmax(0,1fr);gap:0;margin:7px 0;padding:9px 8px}
      .dsh-todo-planner-row-copy,.dsh-todo-planner-plan-row .dsh-todo-planner-row-copy{grid-column:1;grid-row:1}
      .dsh-todo-planner-row-actions,.dsh-todo-planner-plan-row .dsh-todo-planner-row-actions{grid-column:1;grid-row:2;justify-self:start;margin:7px 0 0}
      .dsh-todo-planner-row-actions>button{width:30px;height:30px;min-width:30px}
      .dsh-todo-planner-plan-group-header{align-items:flex-start;gap:6px;padding:8px 1px}.dsh-todo-planner-plan-day{gap:6px}.dsh-todo-planner-plan-day-copy strong{font-size:11px}.dsh-todo-planner-plan-day-copy span{font-size:9px}.dsh-todo-planner-plan-group-summary{gap:3px 5px;font-size:9px}
      .dsh-todo-planner-timeline-group-header{align-items:flex-start}.dsh-todo-planner-timeline-group-header>span{font-size:9px}
    }
    .dsh-todo-planner-compact-stat{border-bottom:0}
    .dsh-todo-planner-timeline-group-header,.dsh-todo-planner-plan-group-header{border-bottom:1px solid var(--dsw-alias-border-l3)}
    .dsh-todo-planner-timeline-group-header{padding:9px 2px 10px}
    .dsh-todo-planner-plan-group-header{padding:10px 3px}
    .dsh-todo-planner-plan-group{margin:5px 0 22px}
    .dsh-todo-planner-row{margin:7px 0 12px;padding:12px 10px;border:1px solid color-mix(in srgb,var(--dsw-alias-border-l3) 78%,transparent);border-radius:6px;background:var(--dsw-alias-bg-base);transition:border-color .15s ease,background .15s ease}
    .dsh-todo-planner-row:hover{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base))}
    .dsh-todo-planner-row.dsh-todo-planner-urgency-overdue,.dsh-todo-planner-row.dsh-todo-planner-urgency-critical,.dsh-todo-planner-row.dsh-todo-planner-urgency-soon{border-left-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base)}
    .dsh-todo-planner-row.dsh-todo-planner-urgency-overdue:hover,.dsh-todo-planner-row.dsh-todo-planner-urgency-critical:hover,.dsh-todo-planner-row.dsh-todo-planner-urgency-soon:hover{background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base))}
    @media(max-width:767px){
      .dsh-todo-planner-row{margin:7px 0 12px;padding:11px 9px}
      .dsh-todo-planner-timeline-group-header{padding:8px 2px 9px}
      .dsh-todo-planner-plan-group-header{padding:9px 2px}
    }
    /* Reference layout: compact navigation, overview bands and timeline cards. */
    @media(min-width:1024px){
      #root [data-slot=root]>div:has(>[data-rightbar-col]){grid-template-columns:auto minmax(0,1fr) minmax(0,33.333vw)!important}
      #root [data-slot=root]>div:has(>[data-rightbar-col])>[data-rightbar-col]{width:33.333vw!important;min-width:0!important;max-width:33.333vw!important}
      [data-sidebar-right-open]{box-sizing:border-box;width:100%!important;min-width:0!important;max-width:100%;--dsh-sidebar-width:33.333vw!important}
    }
    .dsh-todo-planner-panel{container-type:inline-size;gap:0;padding:0 20px 18px;background:#f5f9fc;color:#1d2b3d}
    .dsh-todo-planner-topnav{display:flex;align-items:stretch;justify-content:space-between;gap:12px;min-height:56px;margin:0 -20px;border-bottom:1px solid #e1ebf1;background:rgba(255,255,255,.58)}
    .dsh-todo-planner-topnav-tabs{display:flex;align-items:stretch;gap:4px;min-width:0;padding-left:20px}
    .dsh-todo-planner-topnav-tab{position:relative;display:inline-flex;align-items:center;gap:9px;height:56px;padding:0 13px;border:0;background:transparent;color:#5f7186;font:inherit;font-size:14px;white-space:nowrap;cursor:pointer}
    .dsh-todo-planner-topnav-tab:hover{color:#21364b}.dsh-todo-planner-topnav-tab.is-active{color:#182b40;font-weight:650}
    .dsh-todo-planner-topnav-tab.is-active::after{position:absolute;right:10px;bottom:-1px;left:10px;height:2px;border-radius:2px;background:#10a875;content:""}
    .dsh-todo-planner-topnav-actions{display:flex;align-items:center;gap:2px;padding:0 14px 0 0}
    .dsh-todo-planner-topnav-action{width:32px!important;height:32px!important;min-width:32px!important;padding:0!important;color:#536a80!important}
    .dsh-todo-planner-topnav-action:hover:not(:disabled){color:#173a59!important;background:#eaf2f5!important}
    .dsh-todo-planner-panel-tools{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:8px;min-height:0;margin:0;padding:0}
    .dsh-todo-planner-panel-tools.is-open{padding:8px 0 0}
    .dsh-todo-planner-search-field{display:flex;align-items:center;gap:7px;width:100%;height:32px;padding:0 10px;border:1px solid #dbe7ed;border-radius:6px;background:#fff;color:#7590a0}
    .dsh-todo-planner-search-field input{min-width:0;flex:1;border:0;outline:0;background:transparent;color:#1d2b3d;font:inherit;font-size:12px}.dsh-todo-planner-search-field input::placeholder{color:#a1b2bd}
    .dsh-todo-planner-filter-menu{display:flex;align-items:center;flex-wrap:wrap;gap:5px;width:100%;padding:7px 9px;border:1px solid #dbe7ed;border-radius:6px;background:#fff;color:#7990a0;font-size:11px}
    .dsh-todo-planner-filter-menu button{height:24px;padding:0 8px;border:1px solid transparent;border-radius:4px;background:#f3f7f9;color:#617789;font:inherit;cursor:pointer}
    .dsh-todo-planner-filter-menu button.is-selected{border-color:#bde8d8;background:#e4f6ef;color:#138561;font-weight:600}.dsh-todo-planner-filter-completed{display:inline-flex;align-items:center;gap:5px;margin-left:auto;color:#708596;white-space:nowrap}
    .dsh-todo-planner-panel-title{display:grid;grid-template-columns:minmax(145px,1fr) auto;align-items:center;gap:15px;min-height:86px;padding:15px 0 10px}
    .dsh-todo-planner-panel-title-copy{display:flex;flex-direction:column;gap:3px;min-width:0}.dsh-todo-planner-panel-title-copy h1{margin:0;color:#172b40;font-size:22px;font-weight:650;line-height:28px}.dsh-todo-planner-panel-title-copy span{color:#708398;font-size:12px;line-height:17px}
    .dsh-todo-planner-panel-title-metrics{display:flex;align-items:stretch;justify-content:flex-end;min-width:0}.dsh-todo-planner-panel-title-metric{display:flex;flex-direction:column;gap:1px;min-width:52px;padding:2px 10px;border-left:1px solid #e4edf2;text-align:center}
    .dsh-todo-planner-panel-title-metric strong{color:#172b40;font-size:17px;font-weight:650;line-height:22px;font-variant-numeric:tabular-nums}.dsh-todo-planner-panel-title-metric span{color:#7e90a0;font-size:10px;line-height:15px;white-space:nowrap}
    .dsh-todo-planner-panel-title-plan{grid-template-columns:minmax(112px,.65fr) minmax(290px,1.75fr)}.dsh-todo-planner-panel-title-plan .dsh-todo-planner-panel-title-metrics{grid-column:1/-1;justify-content:flex-start}
    .dsh-todo-planner-plan-week-strip{display:flex;align-items:center;justify-content:center;gap:3px;min-width:0}.dsh-todo-planner-plan-week-days{display:grid;grid-template-columns:repeat(7,minmax(34px,1fr));gap:2px;min-width:0}
    .dsh-todo-planner-plan-week-day{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-width:0;height:48px;padding:2px 3px;border:0;border-radius:6px;background:transparent;color:#667d91;font:inherit;cursor:pointer}
    .dsh-todo-planner-plan-week-day:hover{background:#edf5f7;color:#24435b}.dsh-todo-planner-plan-week-day.is-selected{background:#e1f4ee;color:#146c58}.dsh-todo-planner-plan-week-day strong{font-size:11px;font-weight:600;line-height:15px;white-space:nowrap}.dsh-todo-planner-plan-week-day span{font-size:10px;line-height:14px;white-space:nowrap}
    .dsh-todo-planner-plan-week-arrow{width:25px!important;height:30px!important;min-width:25px!important;padding:0!important;color:#8096a8!important}
    .dsh-todo-planner-list{padding:0 0 10px}.dsh-todo-planner-timeline-group{margin:0 0 16px}.dsh-todo-planner-timeline-group-header{justify-content:flex-start;gap:8px;padding:8px 2px 9px;border:0;color:#738a9c}.dsh-todo-planner-timeline-group-header>div{gap:8px}.dsh-todo-planner-timeline-group-header strong{font-size:14px;font-weight:650}.dsh-todo-planner-timeline-group-header>span{font-size:11px}
    .dsh-todo-planner-timeline-group-marker{display:flex;flex:0 0 86px;align-items:center;gap:8px;min-width:0;color:#536c82}.dsh-todo-planner-timeline-group-marker time{font-size:12px;font-weight:600;font-variant-numeric:tabular-nums}
    .dsh-todo-planner-group-dot{display:inline-block;width:9px;height:9px;border:2px solid #c7d7e0;border-radius:50%;background:#f7fbfd;box-shadow:0 0 0 2px #f7fbfd}.dsh-todo-planner-timeline-group-copy{display:flex;align-items:baseline;gap:8px}.dsh-todo-planner-timeline-group-copy span{color:#8093a2;font-size:11px}
    .dsh-todo-planner-task-timeline{padding:1px 0}
    .dsh-todo-planner-row{grid-template-columns:minmax(0,1fr) auto;gap:9px;margin:1px 0 0;padding:8px 10px;border-color:#dfebf0;border-radius:6px;background:rgba(255,255,255,.52)}.dsh-todo-planner-row:hover{border-color:#c6dfe6;background:#fff}
    .dsh-todo-planner-today-row .dsh-todo-planner-row-title>strong{flex:0 1 auto}.dsh-todo-planner-row-title{gap:6px}.dsh-todo-planner-row-title>strong{font-size:13px;font-weight:600;line-height:18px}.dsh-todo-planner-task-check{width:16px;height:16px;margin:0 5px 0 1px;accent-color:#10a875}
    .dsh-todo-planner-row-tags{display:flex;align-items:center;gap:5px;margin-left:auto}.dsh-todo-planner-status,.dsh-todo-planner-priority{min-height:18px;padding:1px 8px;border-radius:10px;font-size:10px;line-height:15px}
    .dsh-todo-planner-urgency-tag{display:inline-flex;align-items:center;min-height:18px;padding:1px 8px;border-radius:10px;font-size:10px;line-height:15px;white-space:nowrap}.dsh-todo-planner-urgency-tag-soon{background:#fff0d6;color:#d89018}.dsh-todo-planner-urgency-tag-overdue{background:#ffe7e4;color:#eb6256}
    .dsh-todo-planner-status{background:#eef3f5;color:#6a7f90}.dsh-todo-planner-status-in_progress{background:#e0f4ed;color:#168263}.dsh-todo-planner-status-done{background:#e5f5ef;color:#23866d}.dsh-todo-planner-priority-urgent{background:#ffe7e4;color:#eb6256}.dsh-todo-planner-priority-high{background:#fff0d6;color:#d89018}
    .dsh-todo-planner-row-time-range{gap:7px 13px;margin-top:5px;color:#6e8497;font-size:10px}.dsh-todo-planner-row-time-range svg{color:#8ca2b0}.dsh-todo-planner-row-actions>button{width:28px;height:28px;min-width:28px}
    .dsh-todo-planner-row-more{position:relative;flex:none}.dsh-todo-planner-row-more>summary{display:grid;place-items:center;width:28px;height:28px;border-radius:4px;color:#687f92;list-style:none;cursor:pointer}.dsh-todo-planner-row-more>summary::-webkit-details-marker{display:none}.dsh-todo-planner-row-more>summary:hover{background:#eaf2f5;color:#1d3a53}
    .dsh-todo-planner-row-more>button{position:absolute;top:30px;right:0;z-index:5;display:flex;align-items:center;gap:7px;min-width:98px;height:32px;padding:0 9px;border:1px solid #dfe9ee;border-radius:5px;background:#fff;color:#b0524c;font:inherit;font-size:11px;box-shadow:0 5px 14px rgba(33,57,76,.1);cursor:pointer}
    .dsh-todo-planner-row-more>button:disabled{cursor:not-allowed;opacity:.55}.dsh-todo-planner-plan-group.is-selected .dsh-todo-planner-plan-group-header .dsh-todo-planner-group-dot{border-color:#1aa67b;background:#dff4ec}
    .dsh-todo-planner-row{grid-template-columns:minmax(0,1fr) auto;column-gap:7px}
    .dsh-todo-planner-row-copy{grid-column:1;min-width:0}
    .dsh-todo-planner-row-actions{grid-column:2;grid-row:1;display:flex;align-items:center;align-self:center;gap:7px;margin:0}
    .dsh-todo-planner-row-actions>button{width:26px;height:26px;min-width:26px}
    .dsh-todo-planner-row-more>summary{width:26px;height:26px}
    .dsh-todo-planner-plan-group{margin:0 0 13px}.dsh-todo-planner-plan-group-header{position:relative;top:auto;justify-content:flex-start;gap:7px;padding:8px 2px;border:0;background:transparent}.dsh-todo-planner-plan-day{gap:8px}.dsh-todo-planner-plan-day-copy{gap:0}.dsh-todo-planner-plan-day-copy strong{font-size:13px;line-height:18px}.dsh-todo-planner-plan-day-copy span{font-size:10px}.dsh-todo-planner-plan-group-summary{justify-content:flex-start;gap:5px 10px;font-size:10px;text-align:left}
    .dsh-todo-planner-plan-group .dsh-todo-planner-task-timeline{padding:1px 0}
    .dsh-todo-planner-plan-row{grid-template-columns:minmax(0,1fr) auto;align-items:start;column-gap:7px;margin:1px 0 0;padding:9px 8px}
    .dsh-todo-planner-plan-row .dsh-todo-planner-row-copy{grid-column:1;grid-row:1}
    .dsh-todo-planner-plan-row .dsh-todo-planner-row-actions{grid-column:2;grid-row:1}
    .dsh-todo-planner-plan-row .dsh-todo-planner-row-title>strong{font-size:12px}
    .dsh-todo-planner-plan-row .dsh-todo-planner-row-time-range{gap:4px 9px;margin-top:3px;font-size:10px}
    .dsh-todo-planner-plan-row.dsh-todo-planner-task-done{opacity:.72}
    .dsh-todo-planner-notice{padding:5px 0;color:#5c8c7f;font-size:11px}
    @media(max-width:1250px){
      .dsh-todo-planner-panel-title-today{grid-template-columns:1fr;gap:8px}.dsh-todo-planner-panel-title-today .dsh-todo-planner-panel-title-metrics{justify-content:flex-start}
      .dsh-todo-planner-panel-title-plan{grid-template-columns:110px minmax(0,1fr);gap:8px}.dsh-todo-planner-plan-week-days{grid-template-columns:repeat(7,minmax(28px,1fr))}
    }
    @media(max-width:767px){
      .dsh-todo-planner-panel{gap:0;padding:0 12px 12px;background:#f5f9fc}.dsh-todo-planner-topnav{margin:0 -12px}.dsh-todo-planner-topnav-tabs{gap:0;padding-left:6px}.dsh-todo-planner-topnav-tab{gap:5px;padding:0 7px;font-size:11px}.dsh-todo-planner-topnav-actions{gap:0;padding-right:5px}.dsh-todo-planner-topnav-action{width:29px!important;height:29px!important;min-width:29px!important}
      .dsh-todo-planner-panel-title{grid-template-columns:1fr;gap:8px;min-height:0;padding:12px 0}.dsh-todo-planner-panel-title-copy h1{font-size:19px}.dsh-todo-planner-panel-title-metrics{justify-content:flex-start;overflow:auto}.dsh-todo-planner-panel-title-metric{min-width:47px;padding:2px 8px}.dsh-todo-planner-panel-title-metric strong{font-size:15px}
      .dsh-todo-planner-panel-title-plan{grid-template-columns:1fr}.dsh-todo-planner-plan-week-strip{justify-content:space-between}.dsh-todo-planner-plan-week-days{grid-template-columns:repeat(7,minmax(0,1fr));flex:1}.dsh-todo-planner-plan-week-day{height:43px}.dsh-todo-planner-plan-week-day strong{font-size:10px}
      .dsh-todo-planner-timeline-group{margin-bottom:12px}.dsh-todo-planner-timeline-group-header{gap:5px;padding:7px 1px}.dsh-todo-planner-timeline-group-marker{min-width:50px;gap:5px}.dsh-todo-planner-timeline-group-marker time{font-size:10px}.dsh-todo-planner-timeline-group-header strong{font-size:12px}.dsh-todo-planner-timeline-group-header>span{font-size:9px}.dsh-todo-planner-timeline-group-copy span{display:none}
      .dsh-todo-planner-row{grid-template-columns:minmax(0,1fr) auto;margin:4px 0 6px;padding:9px 7px}.dsh-todo-planner-row-title{align-items:flex-start;gap:4px}.dsh-todo-planner-row-title>strong{flex:1 1 100px;font-size:12px}.dsh-todo-planner-row-tags{gap:3px}.dsh-todo-planner-status,.dsh-todo-planner-priority{min-height:16px;padding:1px 6px;font-size:9px}.dsh-todo-planner-row-time-range{gap:4px 8px;font-size:9px}.dsh-todo-planner-row-actions{gap:0}.dsh-todo-planner-row-actions>button{width:25px;height:25px;min-width:25px}
      .dsh-todo-planner-plan-group{margin-bottom:9px}.dsh-todo-planner-plan-group-header{padding:7px 1px}.dsh-todo-planner-plan-day{gap:6px}.dsh-todo-planner-plan-day-copy strong{font-size:12px}.dsh-todo-planner-plan-group-summary{gap:3px 6px;font-size:9px}.dsh-todo-planner-plan-group-summary>span{white-space:nowrap}
      .dsh-todo-planner-plan-row{grid-template-columns:minmax(0,1fr) auto;row-gap:4px}
      .dsh-todo-planner-plan-row .dsh-todo-planner-row-copy{grid-column:1;grid-row:1}
      .dsh-todo-planner-plan-row .dsh-todo-planner-row-actions{grid-column:2;grid-row:1}
    }
    @container (max-width:500px){
      .dsh-todo-planner-panel-title-plan{grid-template-columns:minmax(0,1fr);align-items:start}
      .dsh-todo-planner-plan-week-strip{justify-content:space-between;gap:2px}
      .dsh-todo-planner-plan-week-days{grid-template-columns:repeat(7,minmax(0,1fr));flex:1;gap:1px}
      .dsh-todo-planner-plan-week-day{width:100%;padding-right:0;padding-left:0}
      .dsh-todo-planner-topnav{gap:4px;padding-right:8px;padding-left:8px}
      .dsh-todo-planner-topnav-tabs{display:flex;flex:0 1 auto;width:max-content;max-width:calc(100% - 136px);min-width:0}
      .dsh-todo-planner-topnav-tabs>button[role="tab"]{min-width:0;padding:0 7px!important;font-size:11px;white-space:nowrap}
      .dsh-todo-planner-topnav-actions{gap:0;padding:0}
      .dsh-todo-planner-topnav-action{width:26px!important;height:28px!important;min-width:26px!important}
    }
    .dsh-todo-planner-panel{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}
    .dsh-todo-planner-topnav{box-sizing:border-box;align-items:center;min-height:52px;margin:0 -20px;padding:0 16px;border:0;border-bottom:1px solid var(--dsw-alias-border-l3);background:transparent}
    .dsh-todo-planner-topnav-tabs{box-sizing:border-box;display:flex;align-items:stretch;gap:12px;flex:0 1 auto;width:max-content;max-width:100%;min-width:0;padding:0 4px;background:transparent}
    .dsh-todo-planner-topnav-tab{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:0 1 auto;min-width:0;min-height:52px;padding:0 8px;border:0;border-radius:0;background:transparent;color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13);font-weight:500;white-space:nowrap;cursor:pointer}
    .dsh-todo-planner-topnav-tab::after{position:absolute;right:8px;bottom:0;left:8px;height:2px;border-radius:var(--dsw-radius-xs);background:transparent;content:""}
    .dsh-todo-planner-topnav-tab:hover,.dsh-todo-planner-topnav-tab.is-active{color:var(--dsw-alias-label-primary)}
    .dsh-todo-planner-topnav-tab.is-active::after{background:var(--dsw-alias-state-business-primary)}
    .dsh-todo-planner-topnav-tab:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-3px}
    .dsh-todo-planner-topnav-tab{color:var(--dsw-alias-label-secondary)}
    .dsh-todo-planner-topnav-tab:hover{color:var(--dsw-alias-label-primary)}
    .dsh-todo-planner-topnav-tab.is-active{color:var(--dsw-alias-label-primary)}
    .dsh-todo-planner-topnav-tab.is-active::after{background:var(--dsw-alias-state-business-primary)}
    .dsh-todo-planner-topnav-action{color:var(--dsw-alias-label-secondary)!important}
    .dsh-todo-planner-topnav-action:hover:not(:disabled){color:var(--dsw-alias-label-primary)!important;background:var(--dsw-alias-interactive-bg-hover)!important}
    .dsh-todo-planner-search-field,.dsh-todo-planner-filter-menu{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-secondary)}
    .dsh-todo-planner-search-field input{color:var(--dsw-alias-label-primary)}
    .dsh-todo-planner-search-field input::placeholder{color:var(--dsw-alias-label-caption)}
    .dsh-todo-planner-filter-menu button{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}
    .dsh-todo-planner-filter-menu button.is-selected{border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 38%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 12%,var(--dsw-alias-bg-base));color:var(--dsw-alias-state-business-primary)}
    .dsh-todo-planner-filter-completed{color:var(--dsw-alias-label-secondary)}
    .dsh-todo-planner-panel-title-copy h1,.dsh-todo-planner-panel-title-metric strong{color:var(--dsw-alias-label-primary)}
    .dsh-todo-planner-panel-title-copy span,.dsh-todo-planner-panel-title-metric span{color:var(--dsw-alias-label-tertiary)}
    .dsh-todo-planner-panel-title-metric{border-color:var(--dsw-alias-border-l3)}
    .dsh-todo-planner-plan-week-day{color:var(--dsw-alias-label-secondary)}
    .dsh-todo-planner-plan-week-day:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
    .dsh-todo-planner-plan-week-day.is-selected{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 16%,var(--dsw-alias-bg-base));color:var(--dsw-alias-state-business-primary)}
    .dsh-todo-planner-plan-week-arrow{color:var(--dsw-alias-label-tertiary)!important}
    .dsh-todo-planner-timeline-group-header,.dsh-todo-planner-plan-group-header{color:var(--dsw-alias-label-tertiary)}
    .dsh-todo-planner-timeline-group-header strong,.dsh-todo-planner-plan-day-copy strong{color:var(--dsw-alias-label-primary)}
    .dsh-todo-planner-timeline-group-overdue .dsh-todo-planner-timeline-group-header strong{color:var(--dsw-alias-state-error-primary)}
    .dsh-todo-planner-timeline-group-marker{color:var(--dsw-alias-label-secondary)}
    .dsh-todo-planner-timeline-group-marker svg{flex:none;color:var(--dsw-alias-label-tertiary)}
    .dsh-todo-planner-timeline-group-copy span,.dsh-todo-planner-plan-day-copy span{color:var(--dsw-alias-label-tertiary)}
    .dsh-todo-planner-group-dot{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);box-shadow:0 0 0 2px var(--dsw-alias-bg-base)}
    .dsh-todo-planner-timeline-item{--dsh-todo-planner-priority-color:var(--dsw-alias-state-business-primary)}
    .dsh-todo-planner-task-priority-urgent{--dsh-todo-planner-priority-color:var(--dsw-alias-state-error-primary)}
    .dsh-todo-planner-task-priority-high{--dsh-todo-planner-priority-color:var(--dsw-alias-state-warn-label)}
    .dsh-todo-planner-task-priority-low{--dsh-todo-planner-priority-color:var(--dsw-alias-label-tertiary)}
    .dsh-todo-planner-timeline-item .dsh-todo-planner-dot{background:var(--dsh-todo-planner-priority-color)}
    .dsh-todo-planner-row{position:relative;border-color:var(--dsw-alias-border-l3);border-left:1px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));box-shadow:none}
    .dsh-todo-planner-row::before{content:none}
    .dsh-todo-planner-row:hover{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base)}
    .dsh-todo-planner-row.dsh-todo-planner-urgency-overdue,.dsh-todo-planner-row.dsh-todo-planner-urgency-critical,.dsh-todo-planner-row.dsh-todo-planner-urgency-soon{border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));box-shadow:none}
    .dsh-todo-planner-timeline-item>.dsh-todo-planner-row{border-left:2px solid var(--dsh-todo-planner-priority-color)}
    .dsh-todo-planner-row-time-range{color:var(--dsw-alias-label-secondary)}
    .dsh-todo-planner-row-time-range{gap:7px 12px}
    .dsh-todo-planner-row-time-range>span{display:inline-flex;align-items:center;gap:4px}
    .dsh-todo-planner-row-time-range svg{width:14px;height:14px;flex:none;color:var(--dsw-alias-label-tertiary)}
    .dsh-todo-planner-row .dsh-todo-planner-row-time-range{font-size:12px;line-height:17px}
    .dsh-todo-planner-notes{font-size:12px;line-height:17px}
    .dsh-todo-planner-tags span{font-size:10px;line-height:14px}
    .dsh-todo-planner-today-row .dsh-todo-planner-row-title>strong,.dsh-todo-planner-plan-row .dsh-todo-planner-row-title>strong{font-size:13px;line-height:19px}
    .dsh-todo-planner-task-check{margin-right:6px;accent-color:var(--dsw-alias-state-business-primary)}
    .dsh-todo-planner-status{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}
    .dsh-todo-planner-status-in_progress{background:color-mix(in srgb,var(--dsw-alias-state-success-primary,var(--dsw-alias-state-business-primary)) 14%,var(--dsw-alias-bg-base));color:var(--dsw-alias-state-success-primary,var(--dsw-alias-state-business-primary))}
    .dsh-todo-planner-status-done{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}
    .dsh-todo-planner-status-blocked,.dsh-todo-planner-priority-high,.dsh-todo-planner-urgency-tag-soon{background:color-mix(in srgb,var(--dsw-alias-state-warn-label) 14%,var(--dsw-alias-bg-base));color:var(--dsw-alias-state-warn-label)}
    .dsh-todo-planner-priority-urgent,.dsh-todo-planner-urgency-tag-overdue{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 14%,var(--dsw-alias-bg-base));color:var(--dsw-alias-state-error-primary)}
    .dsh-todo-planner-error{color:var(--dsw-alias-state-error-primary)}
    .dsh-todo-planner-row-copy{grid-column:1;grid-row:1;min-width:0}
    .dsh-todo-planner-today-row{grid-template-columns:minmax(0,1fr) auto;column-gap:8px}
    .dsh-todo-planner-today-row .dsh-todo-planner-row-actions{grid-column:2;grid-row:1;align-self:start;justify-self:end;gap:5px;margin:0}
    .dsh-todo-planner-plan-row .dsh-todo-planner-row-actions{align-self:start;justify-self:end;gap:5px;margin:0}
    .dsh-todo-planner-action-button,.dsh-todo-planner-row-more>summary{color:var(--dsw-alias-label-tertiary)!important}
    .dsh-todo-planner-action-button:hover:not(:disabled),.dsh-todo-planner-row-more>summary:hover{background:var(--dsw-alias-interactive-bg-hover)!important;color:var(--dsw-alias-label-primary)!important}
    .dsh-todo-planner-row-more>button{border-color:var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-state-error-primary);box-shadow:var(--dsw-elevation-panel)}
    .dsh-todo-planner-row{border-radius:var(--dsw-radius-sm)}
    .dsh-todo-planner-status,.dsh-todo-planner-priority,.dsh-todo-planner-urgency-tag{border-radius:var(--dsw-radius-xs)}
    .dsh-todo-planner-row-more>summary,.dsh-todo-planner-plan-week-day,.dsh-todo-planner-tags span{border-radius:var(--dsw-radius-sm)}
    .dsh-todo-planner-search-field,.dsh-todo-planner-filter-menu{border-radius:var(--dsw-radius-md)}
    .dsh-todo-planner-filter-menu button{border-radius:var(--dsw-radius-sm)}
    .dsh-todo-planner-plan-group-header{border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base)}
    .dsh-todo-planner-plan-group-summary,.dsh-todo-planner-effort{color:var(--dsw-alias-label-tertiary)}
    .dsh-todo-planner-plan-group.is-selected .dsh-todo-planner-plan-group-header .dsh-todo-planner-group-dot{border-color:var(--dsw-alias-bg-base);background:var(--dsw-alias-state-business-primary)}
    .dsh-todo-planner-token-usage-track span{background:var(--dsw-alias-state-success-primary,var(--dsw-alias-state-business-primary))}
    .dsh-todo-planner-plan-week-days{flex:1;grid-template-columns:repeat(7,minmax(0,1fr))}
    .dsh-todo-planner-panel-title-plan{grid-template-columns:minmax(0,1fr);gap:14px;min-height:0;padding:16px 0 14px}
    .dsh-todo-planner-plan-title-heading{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;min-width:0}
    .dsh-todo-planner-plan-title-heading h1{flex:none}
    .dsh-todo-planner-plan-title-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;min-width:0;max-width:100%;margin-left:auto}
    .dsh-todo-planner-panel-title-plan .dsh-todo-planner-plan-week-strip{box-sizing:border-box;width:100%;min-width:0;max-width:100%}
    .dsh-todo-planner-panel-title-plan{flex:none}
    .dsh-todo-planner-plan-date-navigation{display:grid;grid-template-columns:minmax(164px,.8fr) minmax(260px,1.4fr);align-items:center;gap:16px;min-width:0;padding-top:12px;border-top:1px solid var(--dsw-alias-border-l3)}
    .dsh-todo-planner-plan-shortcuts{display:flex;align-items:center;flex:none;min-width:0}
    .dsh-todo-planner-plan-day-shortcuts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px;min-width:0;padding:3px;border-radius:6px;background:var(--dsw-alias-interactive-bg-hover)}
    .dsh-todo-planner-plan-day-shortcuts button{box-sizing:border-box;min-width:0;min-height:28px;padding:3px 5px;border:0;border-radius:4px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;cursor:pointer}
    .dsh-todo-planner-plan-day-shortcuts button:hover{color:var(--dsw-alias-label-primary)}
    .dsh-todo-planner-plan-day-shortcuts button[aria-pressed=true]{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-state-business-primary);font-weight:600;box-shadow:0 1px 3px color-mix(in srgb,var(--dsw-alias-label-primary) 8%,transparent)}
    .dsh-todo-planner-plan-shortcuts button:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
    .dsh-todo-planner-plan-date-navigation .dsh-todo-planner-plan-week-strip{gap:4px}
    .dsh-todo-planner-plan-date-navigation .dsh-todo-planner-plan-week-days{gap:4px}
    .dsh-todo-planner-plan-date-navigation .dsh-todo-planner-plan-week-days.is-long-range{display:flex;overflow-x:auto;scrollbar-width:thin;overscroll-behavior:contain}
    .dsh-todo-planner-plan-date-navigation .dsh-todo-planner-plan-week-days.is-long-range>button{flex:0 0 34px}
    .dsh-todo-planner-plan-date-navigation .dsh-todo-planner-plan-week-day{box-sizing:border-box;height:50px;gap:4px;padding:5px 0;border:1px solid transparent;border-radius:6px}
    .dsh-todo-planner-plan-date-navigation .dsh-todo-planner-plan-week-day strong{font-size:10px;font-weight:400;line-height:14px}
    .dsh-todo-planner-plan-date-navigation .dsh-todo-planner-plan-week-day span{font-size:13px;font-weight:550;line-height:18px;font-variant-numeric:tabular-nums}
    .dsh-todo-planner-plan-date-navigation .dsh-todo-planner-plan-week-day.is-selected{border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 28%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 7%,var(--dsw-alias-bg-base))}
    .dsh-todo-planner-plan-date-navigation .dsh-todo-planner-plan-week-day.is-selected strong{font-weight:600}
    .dsh-todo-planner-plan-summary{min-width:0;margin:0;padding:0}
    .dsh-todo-planner-plan-summary-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;min-width:0;margin:0}
    .dsh-todo-planner-plan-summary-metrics>div{display:flex;flex-direction:column;gap:3px;min-width:0;padding-right:8px}
    .dsh-todo-planner-plan-summary-metrics>div+div{padding:0 0 0 10px;border-left:1px solid var(--dsw-alias-border-l3)}
    .dsh-todo-planner-plan-summary-metrics dt{display:flex;align-items:center;gap:4px;color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:16px}
    .dsh-todo-planner-plan-summary-metrics dt svg{flex:none}
    .dsh-todo-planner-plan-summary-metrics dd{display:flex;align-items:baseline;flex-wrap:wrap;gap:6px;min-width:0;margin:0;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:18px}
    .dsh-todo-planner-plan-summary-metrics strong{color:var(--dsw-alias-label-primary);font-size:20px;font-weight:600;line-height:26px;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
    .dsh-todo-planner-plan-summary-state{min-height:44px;margin:10px 0 0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:20px}
    @container(max-width:439px){
      .dsh-todo-planner-plan-date-navigation{grid-template-columns:minmax(0,1fr);gap:12px}
    }
    @container(max-width:340px){
      .dsh-todo-planner-plan-title-actions .dsh-todo-planner-plan-calendar-trigger{gap:4px;padding-right:6px!important;padding-left:6px!important}
      .dsh-todo-planner-plan-title-actions .dsh-todo-planner-plan-calendar-trigger>span:has(>svg){display:none}
      .dsh-todo-planner-plan-date-navigation .dsh-todo-planner-plan-week-strip{gap:0}
      .dsh-todo-planner-plan-date-navigation .dsh-todo-planner-plan-week-days{gap:1px}
    }
    .dsh-todo-planner-plan-calendar-trigger{display:inline-flex;align-items:center;justify-content:center;flex:0 1 auto;gap:7px;min-width:0!important;max-width:100%;min-height:34px;height:auto!important;padding:6px 9px!important;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;color:var(--dsw-alias-label-secondary)!important}
    .dsh-todo-planner-plan-calendar-trigger>svg{flex:none}
    .dsh-todo-planner-plan-calendar-trigger span{min-width:0;color:inherit;font-size:12px;line-height:18px;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
    .dsh-todo-planner-plan-calendar-trigger:hover{background:var(--dsw-alias-interactive-bg-hover)!important;color:var(--dsw-alias-label-primary)!important}
    .dsh-todo-planner-plan-calendar-trigger[aria-expanded=true]{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 8%,var(--dsw-alias-bg-base));color:var(--dsw-alias-state-business-primary)!important}
    .dsh-todo-planner-plan-calendar-trigger:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
    .dsh-todo-planner-plan-calendar-modal{box-sizing:border-box;width:min(1120px,100%);max-width:100%;max-height:min(900px,calc(100dvh - 48px));padding:0!important;overflow:hidden;border-radius:8px}
    .dsh-todo-planner-plan-calendar-modal>div{display:flex;flex:1;flex-direction:column;min-height:0;overflow:hidden}
    .dsh-todo-planner-plan-calendar-modal>div>div:has(>h2){flex:none;padding:20px 20px 16px 24px}
    .dsh-todo-planner-plan-calendar-modal>div>div:has(>.dsh-todo-planner-plan-calendar){display:flex;flex:1;min-height:0;margin:0;padding:0;overflow:hidden}
    .dsh-todo-planner-plan-calendar{display:flex;flex:1;flex-direction:column;gap:0;min-width:0;min-height:0;color:var(--dsw-alias-label-primary)}
    .dsh-todo-planner-calendar-range-controls{display:flex;flex:none;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:0 24px 16px;border-bottom:1px solid var(--dsw-alias-border-l3)}
    .dsh-todo-planner-calendar-range-presets{display:flex;gap:2px;padding:3px;border-radius:6px;background:var(--dsw-alias-interactive-bg-hover)}
    .dsh-todo-planner-calendar-range-presets button{min-height:28px;padding:3px 12px;border:0;border-radius:4px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer}
    .dsh-todo-planner-calendar-range-presets button[aria-pressed=true]{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-state-business-primary);font-weight:600;box-shadow:0 1px 2px color-mix(in srgb,var(--dsw-alias-label-primary) 6%,transparent)}
    .dsh-todo-planner-calendar-range-inputs{display:flex;flex-wrap:wrap;gap:8px;min-width:0}
    .dsh-todo-planner-calendar-range-inputs label{display:flex;align-items:center;gap:6px;min-width:0;color:var(--dsw-alias-label-secondary);font-size:12px}
    .dsh-todo-planner-calendar-range-inputs label.is-active{color:var(--dsw-alias-state-business-primary)}
    .dsh-todo-planner-calendar-range-inputs label.is-active input{border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 50%,var(--dsw-alias-border-l3))}
    .dsh-todo-planner-calendar-range-inputs input{box-sizing:border-box;min-width:0;max-width:100%;width:142px;height:32px;padding:3px 6px;border:1px solid var(--dsw-alias-border-l3);border-radius:4px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px}
    .dsh-todo-planner-calendar-toolbar{display:grid;flex:none;grid-template-columns:28px minmax(76px,auto) minmax(64px,auto) 28px;align-items:center;justify-content:center;gap:8px;min-width:0;padding:12px 24px}
    .dsh-todo-planner-calendar-toolbar>button{width:28px!important;height:30px!important;min-width:28px!important;padding:0!important}
    .dsh-todo-planner-calendar-year{display:flex;align-items:center;justify-content:center;gap:3px;min-width:0;font-size:12px}
    .dsh-todo-planner-calendar-year input{box-sizing:border-box;width:64px;min-width:0;height:30px;padding:0 4px;border:1px solid var(--dsw-alias-border-l3);border-radius:4px;background:var(--dsw-alias-bg-base);color:inherit;font:inherit;text-align:center;font-variant-numeric:tabular-nums;appearance:textfield}
    .dsh-todo-planner-calendar-year input::-webkit-inner-spin-button,.dsh-todo-planner-calendar-year input::-webkit-outer-spin-button{appearance:none;margin:0}
    .dsh-todo-planner-calendar-toolbar select{box-sizing:border-box;min-width:0;height:30px;padding:0 4px;border:1px solid var(--dsw-alias-border-l3);border-radius:4px;background:var(--dsw-alias-bg-base);color:inherit;font:inherit;font-size:12px}
    .dsh-todo-planner-calendar-layout{display:grid;grid-template-columns:minmax(0,1fr) 260px;align-items:stretch;gap:20px;min-width:0;min-height:0;padding:0 24px 16px;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable}
    .dsh-todo-planner-calendar-grid{display:grid;grid-template-rows:24px repeat(6,88px);gap:2px;min-width:0}
    .dsh-todo-planner-calendar-weekdays,.dsh-todo-planner-calendar-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;min-width:0}
    .dsh-todo-planner-calendar-weekdays>span{display:grid;place-items:center;color:var(--dsw-alias-label-tertiary);font-size:11px}
    .dsh-todo-planner-calendar-cell{box-sizing:border-box;display:flex;min-width:0;min-height:0;border:1px solid var(--dsw-alias-border-l3);border-radius:4px;overflow:hidden}
    .dsh-todo-planner-calendar-day{display:flex;flex-direction:column;align-items:stretch;gap:3px;box-sizing:border-box;width:100%;height:100%;min-width:0;padding:4px;border:0;border-radius:3px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;font-variant-numeric:tabular-nums;text-align:left;overflow:hidden;cursor:pointer}
    .dsh-todo-planner-calendar-day-heading{display:flex;align-items:center;justify-content:space-between;flex:none;min-width:0;height:24px;padding:0 4px}
    .dsh-todo-planner-calendar-day:hover{background:var(--dsw-alias-interactive-bg-hover)}
    .dsh-todo-planner-calendar-cell.is-outside .dsh-todo-planner-calendar-day{color:var(--dsw-alias-label-caption)}
    .dsh-todo-planner-calendar-cell.is-in-range{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 5%,var(--dsw-alias-bg-base))}
    .dsh-todo-planner-calendar-day-number{display:grid;place-items:center;flex:none;width:24px;height:24px;border-radius:4px}
    .dsh-todo-planner-calendar-day[aria-current=date]{color:var(--dsw-alias-state-business-primary);font-weight:600}
    .dsh-todo-planner-calendar-cell.is-selected{border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 55%,var(--dsw-alias-border-l3));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--dsw-alias-state-business-primary) 35%,transparent);border-radius:4px}
    .dsh-todo-planner-calendar-cell.is-selected .dsh-todo-planner-calendar-day-number{background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-oncolor,white);font-weight:600}
    .dsh-todo-planner-calendar-day-count{--dsh-todo-planner-priority-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-tertiary);font-size:10px;font-weight:400}
    .dsh-todo-planner-calendar-tasks{display:flex;flex-direction:column;gap:2px;min-width:0}
    .dsh-todo-planner-calendar-task{--dsh-todo-planner-priority-color:var(--dsw-alias-state-business-primary);display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsh-todo-planner-priority-color);font-size:11px;line-height:16px}
    .dsh-todo-planner-calendar-task.dsh-todo-planner-task-priority-urgent,.dsh-todo-planner-calendar-day-count.dsh-todo-planner-task-priority-urgent{--dsh-todo-planner-priority-color:var(--dsw-alias-state-error-primary)}
    .dsh-todo-planner-calendar-task.dsh-todo-planner-task-priority-high,.dsh-todo-planner-calendar-day-count.dsh-todo-planner-task-priority-high{--dsh-todo-planner-priority-color:var(--dsw-alias-state-warn-label)}
    .dsh-todo-planner-calendar-task.dsh-todo-planner-task-priority-low,.dsh-todo-planner-calendar-day-count.dsh-todo-planner-task-priority-low{--dsh-todo-planner-priority-color:var(--dsw-alias-label-tertiary)}
    .dsh-todo-planner-calendar-task.is-done{text-decoration:line-through;opacity:.6}
    .dsh-todo-planner-calendar-more{align-self:flex-start;min-width:0;max-width:100%;height:18px;flex:none;padding:0 3px;color:var(--dsw-alias-label-secondary);font-size:10px;white-space:nowrap}
    .dsh-todo-planner-calendar-agenda{align-self:stretch;box-sizing:border-box;padding:3px 0 0 16px;border-left:1px solid var(--dsw-alias-border-l3);min-width:0;max-height:564px;overflow:auto;scrollbar-width:thin}
    .dsh-todo-planner-calendar-agenda-heading{position:sticky;top:0;z-index:1;display:flex;flex-direction:column;gap:3px;margin-bottom:6px;padding-bottom:8px;background:var(--dsw-alias-bg-base)}
    .dsh-todo-planner-calendar-agenda h3{margin:0;font-size:13px;line-height:20px;font-weight:600}
    .dsh-todo-planner-calendar-agenda-heading>span{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}
    .dsh-todo-planner-calendar-agenda ul{margin:0;padding:0;list-style:none}
    .dsh-todo-planner-calendar-agenda li{display:grid;grid-template-columns:42px minmax(0,1fr);gap:8px;padding:9px 0;min-width:0;border-bottom:1px solid var(--dsw-alias-border-l3)}
    .dsh-todo-planner-calendar-agenda-time,.dsh-todo-planner-calendar-agenda-copy{display:flex;flex-direction:column;gap:4px;min-width:0}
    .dsh-todo-planner-calendar-agenda-time{color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:16px;font-variant-numeric:tabular-nums}
    .dsh-todo-planner-calendar-agenda .dsh-todo-planner-calendar-task{white-space:normal;overflow-wrap:anywhere;flex:1}
    .dsh-todo-planner-calendar-task-meta{flex:none;color:var(--dsw-alias-label-tertiary);font-size:10px}
    .dsh-todo-planner-calendar-agenda p{margin:0;color:var(--dsw-alias-label-tertiary);font-size:12px}
    .dsh-todo-planner-calendar-day:disabled{cursor:default;opacity:.35}
    .dsh-todo-planner-calendar-day:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-2px}
    .dsh-todo-planner-calendar-year input:focus-visible,.dsh-todo-planner-calendar-toolbar select:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
    .dsh-todo-planner-calendar-footer{display:flex;flex:none;align-items:center;justify-content:space-between;gap:8px;padding:14px 24px;border-top:1px solid var(--dsw-alias-border-l3);background:var(--dsw-alias-bg-base)}
    .dsh-todo-planner-calendar-footer>span{min-width:0;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;overflow-wrap:anywhere}
    .dsh-todo-planner-calendar-footer>div{display:flex;align-items:center;gap:6px}
    .dsh-todo-planner-calendar-footer>div>button{min-height:32px;padding:6px 12px;font-size:12px}
    .dsh-todo-planner-calendar-footer>div>button:last-child{background:var(--dsw-alias-state-business-primary);color:white}
    .dsh-todo-planner-calendar-footer>div>button:last-child:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 88%,black)}
    .dsh-todo-planner-calendar-footer>div>button:last-child:disabled{opacity:.4}
    .dsh-todo-planner-calendar-footer time{color:var(--dsw-alias-label-tertiary);font-size:12px;font-variant-numeric:tabular-nums}
    @media(max-width:850px){
      .dsh-todo-planner-calendar-layout{grid-template-columns:minmax(0,1fr);gap:14px;min-height:0}
      .dsh-todo-planner-calendar-agenda{height:auto;max-height:180px;padding:12px 0 0;border-left:0;border-top:1px solid var(--dsw-alias-border-l3)}
    }
    @media(max-width:600px){
      [role=presentation]:has(>.dsh-todo-planner-plan-calendar-modal){padding:8px}
      .dsh-todo-planner-plan-calendar-modal{width:100%;max-height:calc(100dvh - 16px)}
      .dsh-todo-planner-plan-calendar-modal>div>div:has(>h2){padding:14px 12px}
      .dsh-todo-planner-calendar-range-controls{gap:10px;padding:0 12px 12px}
      .dsh-todo-planner-calendar-range-presets{box-sizing:border-box;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));width:100%}
      .dsh-todo-planner-calendar-toolbar{padding:10px 12px}
      .dsh-todo-planner-calendar-layout{padding:0 12px 12px;scrollbar-gutter:auto}
      .dsh-todo-planner-calendar-grid{grid-template-rows:22px repeat(6,64px)}
      .dsh-todo-planner-calendar-day{padding:4px 2px;font-size:11px}
      .dsh-todo-planner-calendar-day-heading{display:contents}
      .dsh-todo-planner-calendar-day-number{align-self:flex-start}
      .dsh-todo-planner-calendar-day-count{align-self:center;color:var(--dsh-todo-planner-priority-color);font-size:14px;line-height:20px;font-weight:600}
      .dsh-todo-planner-calendar-tasks,.dsh-todo-planner-calendar-more,.dsh-todo-planner-calendar-count-unit,.dsh-todo-planner-calendar-agenda{display:none}
      .dsh-todo-planner-calendar-range-inputs{width:100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
      .dsh-todo-planner-calendar-range-inputs label{flex-direction:column;align-items:flex-start;gap:3px}
      .dsh-todo-planner-calendar-range-inputs input{width:100%}
      .dsh-todo-planner-calendar-footer{flex-wrap:wrap;row-gap:8px;padding:10px 12px}
      .dsh-todo-planner-calendar-footer>span{flex-basis:100%;font-size:11px}
      .dsh-todo-planner-calendar-footer>div{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));width:100%}
    }
    .dsh-todo-planner-plan-date-empty{margin:4px 0 16px;padding:12px 0 12px calc(var(--dsh-todo-planner-timeline-rail) + var(--dsh-todo-planner-timeline-gap));color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
    .dsh-todo-planner-today-row{margin:5px 0 7px}
    .dsh-todo-planner-plan-row{margin-top:6px;padding:10px 11px}
    .dsh-todo-planner-plan-row .dsh-todo-planner-row-actions{align-self:start;gap:5px}
    .dsh-todo-planner-notice{color:var(--dsw-alias-state-success-primary,var(--dsw-alias-state-business-primary))}
    .dsh-todo-planner-row-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;min-width:0}
    .dsh-todo-planner-row-head .dsh-todo-planner-row-title{flex:1;min-width:0}
    .dsh-todo-planner-row-head .dsh-todo-planner-row-title>strong{flex:0 1 auto}
    .dsh-todo-planner-row-head>.dsh-todo-planner-status{flex:none;margin-top:1px;font-size:11px;line-height:16px}
    .dsh-todo-planner-today-row>.dsh-todo-planner-row-copy,.dsh-todo-planner-plan-row>.dsh-todo-planner-row-copy{grid-column:1/-1;grid-row:1;min-width:0}
    .dsh-todo-planner-group-dot{box-sizing:border-box;width:10px;height:10px;box-shadow:none}
    .dsh-todo-planner-task-group>.dsh-todo-planner-group-header{display:grid;grid-template-columns:var(--dsh-todo-planner-timeline-rail) minmax(0,1fr);align-items:center;column-gap:var(--dsh-todo-planner-timeline-gap);padding-inline:0}
    .dsh-todo-planner-group-header>.dsh-todo-planner-group-dot{grid-column:1;grid-row:1;justify-self:center;position:static;width:var(--dsh-todo-planner-timeline-dot-size);height:var(--dsh-todo-planner-timeline-dot-size);margin:0;border-width:2px;transform:none}
    .dsh-todo-planner-group-header>.dsh-todo-planner-group-heading{grid-column:2;grid-row:1;display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;min-width:0}
    .dsh-todo-planner-group-heading>.dsh-todo-planner-timeline-group-marker{flex:0 1 auto;min-width:0}
    .dsh-todo-planner-group-heading>.dsh-todo-planner-timeline-group-marker time{overflow-wrap:anywhere}
    .dsh-todo-planner-group-heading>span{flex:none;font-size:10px;font-variant-numeric:tabular-nums}
    .dsh-todo-planner-row-time-range{margin-top:9px}
    .dsh-todo-planner-row-time-range svg{transform:translateY(1px)}
    .dsh-todo-planner-row .dsh-todo-planner-notes{margin-top:8px}
    .dsh-todo-planner-row-footer{display:flex;align-items:center;gap:8px;min-width:0;margin-top:10px}
    .dsh-todo-planner-row-footer .dsh-todo-planner-tags{flex:1;min-width:0;margin-top:0;margin-left:0}
    .dsh-todo-planner-row-footer .dsh-todo-planner-tags span{font-size:10px;line-height:14px}
    .dsh-todo-planner-row-footer .dsh-todo-planner-tag-overflow{display:none}
    .dsh-todo-planner-row-footer .dsh-todo-planner-row-actions{align-items:center;align-self:center;justify-content:flex-end;flex:none;gap:4px;margin:0 0 0 auto}
    .dsh-todo-planner-row-actions>.dsh-todo-planner-action-text-button{width:auto!important;height:28px;min-width:0!important;min-height:28px;padding:0 5px!important;border-radius:var(--dsw-radius-sm);font-size:11px;font-weight:500;white-space:nowrap}
    .dsh-todo-planner-row-actions .dsh-todo-planner-row-more>summary{display:inline-flex;align-items:center;justify-content:center;width:auto;height:28px;min-width:0;padding:0 5px;color:var(--dsw-alias-label-secondary);font-size:11px;white-space:nowrap}
    .dsh-todo-planner-row-actions .dsh-todo-planner-row-more>summary:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
    .dsh-todo-planner-today-row{margin:8px 0 10px}
    .dsh-todo-planner-plan-row{margin:8px 0 10px;padding:12px 11px}
    #dsh-todo-planner-todo-view-today-panel{padding-right:12px}
    @media(max-width:767px){
      .dsh-todo-planner-row-footer{align-items:center;gap:5px}
      .dsh-todo-planner-row-footer .dsh-todo-planner-tags{flex-wrap:nowrap;gap:3px;overflow:hidden}
      .dsh-todo-planner-row-footer .dsh-todo-planner-tags>span{flex:none}
      .dsh-todo-planner-row-footer .dsh-todo-planner-tag-extra{display:none}
      .dsh-todo-planner-row-footer .dsh-todo-planner-tag-overflow{display:inline-flex}
      .dsh-todo-planner-row-footer .dsh-todo-planner-row-actions{gap:3px}
      .dsh-todo-planner-row-actions>.dsh-todo-planner-action-text-button,.dsh-todo-planner-row-actions .dsh-todo-planner-row-more>summary{padding-right:3px;padding-left:3px;font-size:11px}
    }
    @media(max-width:360px){.dsh-todo-planner-row-footer .dsh-todo-planner-tag-overflow{display:none}.dsh-todo-planner-row-footer .dsh-todo-planner-row-actions{gap:2px}.dsh-todo-planner-row-actions>.dsh-todo-planner-action-text-button,.dsh-todo-planner-row-actions .dsh-todo-planner-row-more>summary{padding-right:2px;padding-left:2px}}
    @container (max-width:500px){.dsh-todo-planner-topnav-tabs{max-width:calc(100% - 136px);gap:6px}.dsh-todo-planner-topnav-tab{padding:0 4px;font-size:11px}}
    .dsh-todo-planner-schedule-manager{container-type:inline-size;box-sizing:border-box;width:100%;height:100%;min-width:0;min-height:0;color:var(--dsw-alias-label-primary)}
    .dsh-todo-planner-schedule-layout{display:grid;grid-template-columns:minmax(0,1fr);width:100%;height:100%;min-width:0;min-height:0}
    .dsh-todo-planner-schedule-list-pane{display:flex;flex-direction:column;gap:10px;min-width:0;min-height:0}
    .dsh-todo-planner-schedule-search{box-sizing:border-box;display:flex;align-items:center;gap:8px;flex:none;width:100%;height:36px;padding:0 10px;border:1px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-tertiary)}
    .dsh-todo-planner-schedule-search:focus-within{border-color:var(--dsw-alias-state-business-primary)}
    .dsh-todo-planner-schedule-search input{box-sizing:border-box;flex:1;min-width:0;height:100%;padding:0;border:0;outline:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px}
    .dsh-todo-planner-schedule-search input::placeholder{color:var(--dsw-alias-label-caption)}
    .dsh-todo-planner-schedule-search input::-webkit-search-cancel-button{display:none}
    .dsh-todo-planner-schedule-clear{display:grid;place-items:center;flex:none;width:24px;height:24px;border:0;border-radius:var(--dsw-radius-sm,4px);background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:18px;cursor:pointer}
    .dsh-todo-planner-schedule-clear:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
    .dsh-todo-planner-schedule-filters{display:flex;align-items:center;gap:4px;flex:none;min-width:0;overflow-x:auto;padding:0 0 2px;border-bottom:1px solid var(--dsw-alias-border-l3)}
    .dsh-todo-planner-schedule-filters button{flex:none;min-height:30px;padding:0 10px;border:0;border-radius:var(--dsw-radius-sm,4px);background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:12px;white-space:nowrap;cursor:pointer}
    .dsh-todo-planner-schedule-filters button:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
    .dsh-todo-planner-schedule-filters button.is-selected{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);font-weight:600}
    .dsh-todo-planner-schedule-list{flex:1;min-height:0;overflow:auto;padding:0 2px 12px 0;overscroll-behavior:contain;scrollbar-gutter:stable}
    .dsh-todo-planner-schedule-rows{display:flex;flex-direction:column;gap:2px;margin:0;padding:0;list-style:none}
    .dsh-todo-planner-schedule-rows li{min-width:0}
    .dsh-todo-planner-schedule-entry{box-sizing:border-box;display:flex;align-items:flex-start;gap:10px;width:100%;min-width:0;padding:9px 8px;border:0;border-radius:var(--dsw-radius-md,8px);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer}
    .dsh-todo-planner-schedule-entry:hover,.dsh-todo-planner-schedule-entry.is-selected{background:var(--dsw-alias-interactive-bg-hover)}
    .dsh-todo-planner-schedule-entry-icon{flex:none;margin-top:3px;color:var(--dsw-alias-label-tertiary)}
    .dsh-todo-planner-schedule-entry-copy{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0}
    .dsh-todo-planner-schedule-entry-title{overflow:hidden;color:var(--dsw-alias-label-primary);font-size:14px;font-weight:500;line-height:21px;text-overflow:ellipsis;white-space:nowrap}
    .dsh-todo-planner-schedule-entry-summary{display:flex;flex-wrap:wrap;gap:0 4px;min-width:0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:19px;overflow-wrap:anywhere}
    .dsh-todo-planner-schedule-entry-summary>span+span:before{content:'·';padding-right:4px;color:var(--dsw-alias-label-caption)}
    .dsh-todo-planner-schedule-entry-status{color:var(--dsw-alias-label-secondary)}
    .dsh-todo-planner-schedule-entry.is-inactive .dsh-todo-planner-schedule-entry-title{color:var(--dsw-alias-label-secondary)}
    .dsh-todo-planner-schedule-feedback,.dsh-todo-planner-schedule-history-error{display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:10px 8px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}
    .dsh-todo-planner-schedule-feedback p,.dsh-todo-planner-schedule-history-error p{flex:1;min-width:0;margin:0;overflow-wrap:anywhere}
    .dsh-todo-planner-schedule-feedback.dsh-todo-planner-error,.dsh-todo-planner-schedule-history-error{color:var(--dsw-alias-state-error-primary)}
    .dsh-todo-planner-schedule-refreshing{padding:2px 8px;color:var(--dsw-alias-label-caption);font-size:11px;line-height:16px}
    .dsh-todo-planner-schedule-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:34px 14px;color:var(--dsw-alias-label-tertiary);font-size:13px;text-align:center}
    .dsh-todo-planner-schedule-empty p{margin:0}
    .dsh-todo-planner-schedule-empty>svg{color:var(--dsw-alias-label-caption)}
    .dsh-todo-planner-schedule-empty button{padding:3px 6px;border:0;border-radius:var(--dsw-radius-sm,4px);background:transparent;color:var(--dsw-alias-state-business-primary);font:inherit;cursor:pointer}
    .dsh-todo-planner-schedule-detail{display:flex;flex-direction:column;min-width:0;min-height:0;border-left:1px solid var(--dsw-alias-border-l3)}
    .dsh-todo-planner-schedule-detail-header{display:flex;align-items:center;justify-content:space-between;gap:8px;flex:none;min-width:0;padding:4px 0 10px;border-bottom:1px solid var(--dsw-alias-border-l3)}
    .dsh-todo-planner-schedule-back{display:inline-flex;align-items:center;gap:3px;flex:none;min-height:28px;padding:0 5px;border:0;border-radius:var(--dsw-radius-sm,4px);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;white-space:nowrap;cursor:pointer}
    .dsh-todo-planner-schedule-back:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
    .dsh-todo-planner-schedule-detail-actions{display:flex;align-items:center;justify-content:flex-end;gap:3px;min-width:0}
    .dsh-todo-planner-schedule-detail-actions>button{display:inline-flex;align-items:center;gap:5px;min-width:0;padding:0 6px;font-size:12px;white-space:nowrap}
    .dsh-todo-planner-schedule-detail-heading{flex:none;min-width:0;padding:15px 2px 12px}
    .dsh-todo-planner-schedule-status{display:inline-flex;align-items:center;min-height:20px;margin-bottom:5px;padding:0 7px;border-radius:var(--dsw-radius-sm,4px);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:18px}
    .dsh-todo-planner-schedule-status.is-active{color:var(--dsw-alias-state-business-primary)}
    .dsh-todo-planner-schedule-detail-heading h2{margin:0;color:var(--dsw-alias-label-primary);font-size:19px;font-weight:550;line-height:26px;overflow-wrap:anywhere}
    .dsh-todo-planner-schedule-detail-heading p{display:flex;align-items:center;gap:6px;margin:7px 0 0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;overflow-wrap:anywhere}
    .dsh-todo-planner-schedule-detail-heading p svg{flex:none}
    .dsh-todo-planner-schedule-detail-tabs{display:flex;align-items:flex-end;gap:18px;flex:none;min-width:0;overflow-x:auto;padding:0 2px;border-bottom:1px solid var(--dsw-alias-border-l3)}
    .dsh-todo-planner-schedule-detail-tabs button{position:relative;flex:none;min-height:34px;padding:0 1px 8px;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:12px;white-space:nowrap;cursor:pointer}
    .dsh-todo-planner-schedule-detail-tabs button[aria-selected="true"]{color:var(--dsw-alias-state-business-primary);font-weight:600}
    .dsh-todo-planner-schedule-detail-tabs button[aria-selected="true"]:after{position:absolute;right:0;bottom:-1px;left:0;height:2px;border-radius:2px;background:var(--dsw-alias-state-business-primary);content:''}
    .dsh-todo-planner-schedule-detail-scroll{flex:1;min-height:0;overflow:auto;padding:12px 3px 20px;overscroll-behavior:contain;scrollbar-gutter:stable}
    .dsh-todo-planner-schedule-rule-section{margin:0 0 17px}
    .dsh-todo-planner-schedule-rule-section h3{margin:0 0 7px 2px;color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:500;line-height:18px}
    .dsh-todo-planner-schedule-rule-rows{display:flex;flex-direction:column;padding:0 10px;border:1px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base))}
    .dsh-todo-planner-schedule-rule-row{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;min-width:0;padding:10px 0;border-bottom:1px solid var(--dsw-alias-border-l3);font-size:13px;line-height:19px}
    .dsh-todo-planner-schedule-rule-row:last-child{border-bottom:0}
    .dsh-todo-planner-schedule-rule-row>span{flex:none;color:var(--dsw-alias-label-tertiary)}
    .dsh-todo-planner-schedule-rule-row>strong{min-width:0;color:var(--dsw-alias-label-primary);font-size:13px;font-weight:450;text-align:right;overflow-wrap:anywhere}
    .dsh-todo-planner-schedule-prompt{margin:0;padding:10px 11px;border:1px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-primary);font-size:13px;line-height:21px;white-space:pre-wrap;overflow-wrap:anywhere}
    .dsh-todo-planner-schedule-detail .dsh-todo-planner-schedule-prompt{display:block}
    .dsh-todo-planner-schedule-linked-session{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:9px;width:100%;min-width:0;padding:10px;border:1px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md,8px);background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;text-align:left;cursor:pointer}
    .dsh-todo-planner-schedule-linked-session:hover{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-interactive-bg-hover)}
    .dsh-todo-planner-schedule-linked-session code,.dsh-todo-planner-schedule-id code{min-width:0;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:11px;overflow-wrap:anywhere}
    .dsh-todo-planner-schedule-open-session{color:var(--dsw-alias-state-business-primary);white-space:nowrap}
    .dsh-todo-planner-schedule-id{margin:10px 2px 0;color:var(--dsw-alias-label-caption);font-size:11px;line-height:17px;overflow-wrap:anywhere}
    .dsh-todo-planner-schedule-history{display:flex;flex-direction:column;align-items:stretch;gap:8px;min-width:0}
    .dsh-todo-planner-schedule-delivery{display:flex;align-items:flex-start;gap:9px;min-width:0;padding:8px 2px;border-bottom:1px solid var(--dsw-alias-border-l3)}
    .dsh-todo-planner-schedule-delivery>svg{flex:none;margin-top:3px;color:var(--dsw-alias-label-tertiary)}
    .dsh-todo-planner-schedule-delivery-copy{flex:1;min-width:0}
    .dsh-todo-planner-schedule-delivery-copy>time{display:block;color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:20px;overflow-wrap:anywhere}
    .dsh-todo-planner-schedule-delivery-prompt{margin-top:3px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:19px}
    .dsh-todo-planner-schedule-delivery-prompt summary,.dsh-todo-planner-schedule-retention summary{color:var(--dsw-alias-label-secondary);cursor:pointer}
    .dsh-todo-planner-schedule-delivery-prompt p,.dsh-todo-planner-schedule-retention p{margin:5px 0 0;white-space:pre-wrap;overflow-wrap:anywhere}
    .dsh-todo-planner-schedule-retention{padding:5px 2px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:17px}
    .dsh-todo-planner-task-relations{display:flex;flex-direction:column;gap:3px;min-width:0;margin-top:7px;color:var(--dsw-alias-label-secondary);font-size:11px;line-height:17px;overflow-wrap:anywhere}
    .dsh-todo-planner-editor-relations{min-width:0;color:var(--dsw-alias-label-secondary);font-size:12px}
    .dsh-todo-planner-editor-relations>summary{padding:5px 0;cursor:pointer}
    .dsh-todo-planner-editor-relations>.dsh-todo-planner-editor-field{margin-top:8px}
    .dsh-todo-planner-dependencies{display:flex;flex-direction:column;gap:7px;max-height:180px;min-width:0;margin:12px 0 0;padding:0;overflow:auto;border:0}
    .dsh-todo-planner-dependencies legend{margin-bottom:8px;padding:0}
    .dsh-todo-planner-dependencies label{display:flex;align-items:flex-start;gap:7px;min-width:0;font-size:12px;line-height:18px;overflow-wrap:anywhere}
    .dsh-todo-planner-dependencies input[type="checkbox"]{flex:none;width:14px;height:14px;margin:2px 0 0;padding:0}
    @container (min-width:760px){.dsh-todo-planner-schedule-manager.has-detail .dsh-todo-planner-schedule-layout{grid-template-columns:minmax(0,.78fr) minmax(0,1.22fr);gap:0}.dsh-todo-planner-schedule-detail{padding-left:16px}.dsh-todo-planner-schedule-back{display:none}}
    @container (max-width:759px){.dsh-todo-planner-schedule-manager.has-detail .dsh-todo-planner-schedule-list-pane{display:none}.dsh-todo-planner-schedule-detail{border-left:0}.dsh-todo-planner-schedule-manager.has-detail .dsh-todo-planner-schedule-layout{grid-template-columns:minmax(0,1fr)}}
    @container (max-width:390px){.dsh-todo-planner-schedule-detail-header{align-items:flex-start}.dsh-todo-planner-schedule-detail-actions{gap:0}.dsh-todo-planner-schedule-detail-actions>button{padding:0 4px}.dsh-todo-planner-schedule-detail-heading{padding-top:11px}.dsh-todo-planner-schedule-detail-tabs{gap:13px}.dsh-todo-planner-schedule-rule-rows{padding-right:8px;padding-left:8px}.dsh-todo-planner-schedule-linked-session{grid-template-columns:auto minmax(0,1fr);gap:5px 8px}.dsh-todo-planner-schedule-open-session{grid-column:2}}
  `;
  document.head.append(style);
  return () => style.remove();
}

    return { inject, apply };
  }
});
