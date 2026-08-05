(() => {
  const params = new URLSearchParams(window.location.search);

  // Capturar parámetros importantes
  const trackingData = {
    gclid: params.get("gclid"),
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_term: params.get("utm_term"),
    utm_content: params.get("utm_content")
  };

  // Guardar solamente los que existen
  Object.entries(trackingData).forEach(([key, value]) => {
    if (value) {
      localStorage.setItem(key, value);
      console.log(`${key} guardado:`, value);
    }
  });
})();
