export const THEME_STORAGE_KEY = "bilwi-theme";

// Se ejecuta en <head> antes de pintar, para que todo el sitio respete la preferencia guardada.
export const themeInitScript = `(function(){try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="dark"){document.documentElement.dataset.theme="dark";}}catch(e){}})();`;
