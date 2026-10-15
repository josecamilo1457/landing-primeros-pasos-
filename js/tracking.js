(() => {
  const params = new URLSearchParams(window.location.search);

  // Capturar parámetros de campaña
  const trackingData = {
    gclid:        params.get('gclid'),
    fbclid:       params.get('fbclid'),
    utm_source:   params.get('utm_source'),
    utm_medium:   params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term:     params.get('utm_term'),
    utm_content:  params.get('utm_content'),
    ad_placement: params.get('placement')
  };

  // Una nueva campaña reemplaza la atribución anterior completa. Una visita
  // directa conserva el último clic identificado, como en el recorrido existente.
  const hasCurrentAttribution = Object.values(trackingData).some(Boolean);
  if (hasCurrentAttribution) {
    Object.entries(trackingData).forEach(([key, value]) => {
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    });
    localStorage.setItem('attribution_timestamp_ms', String(Date.now()));
  }
})();
