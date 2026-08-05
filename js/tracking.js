(() => {
  // Obtener el GCLID de la URL
  const params = new URLSearchParams(window.location.search);
  const gclid = params.get("gclid");

  // Si existe, guardarlo en el navegador
  if (gclid) {
    localStorage.setItem("gclid", gclid);
    console.log("GCLID guardado:", gclid);
  }
})();
