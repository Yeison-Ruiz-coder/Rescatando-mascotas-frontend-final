const getKey = (path, suffix) => `page:${path}:${suffix}`;

export const getPageCacheKey = (path) => getKey(path, 'state');
export const getPageScrollKey = (path) => getKey(path, 'scroll');

export const readSessionState = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('No se pudo leer cache de sesión:', error);
    return null;
  }
};

export const writeSessionState = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('No se pudo guardar cache de sesión:', error);
  }
};

export const readPageState = (path) => readSessionState(getPageCacheKey(path));
export const writePageState = (path, value) => writeSessionState(getPageCacheKey(path), value);

export const readScrollPosition = (path) => {
  try {
    const savedY = Number(sessionStorage.getItem(getPageScrollKey(path)) || 0);
    return Number.isFinite(savedY) ? savedY : 0;
  } catch (error) {
    return 0;
  }
};

export const writeScrollPosition = (path, y) => {
  try {
    sessionStorage.setItem(getPageScrollKey(path), String(Math.max(0, Number(y) || 0)));
  } catch (error) {
    console.warn('No se pudo guardar scroll:', error);
  }
};
