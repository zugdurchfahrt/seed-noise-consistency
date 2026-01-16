(() => {
  if (window.__GEO_PATCHED) return;
const latitude = window.__LATITUDE__;
const longitude = window.__LONGITUDE__;
  /**
   * 
   *Patch geolocation(from script, no direct call from bundle): getCurrentPosition и watchPosition
   * @param {number} latitude — широта
   * @param {number} longitude — долгота
   */
  function patchGeolocation(latitude, longitude) {
    const fake = {
      getCurrentPosition(success) {
        setTimeout(() => {
          success({ coords: { latitude, longitude, accuracy: 100 } });
        }, 0);
      },
      watchPosition(success) {
        const id = setInterval(() => {
          success({ coords: { latitude, longitude, accuracy: 100 } });
        }, 1000);
        return id;
      },
      clearWatch(id) {
        clearInterval(id);
      }
    };
    Object.defineProperty(navigator, 'geolocation', {
      value: fake,
      writable: false,
      configurable: true
    });
    console.log('Geolocation patched →', latitude, longitude);
  }

  window.patchGeolocation = patchGeolocation;
  patchGeolocation(latitude, longitude);
  window.__GEO_PATCHED = true; 
})();
