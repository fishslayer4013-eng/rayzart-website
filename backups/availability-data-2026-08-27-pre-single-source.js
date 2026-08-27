(function () {
  var style = document.createElement('style');
  style.textContent = [
    '.calendar-day{min-height:100px}',
    '.calendar-empty{min-height:100px}',
    '.calendar-booking{font-size:0}',
    '.calendar-booking.trailer-23::after{content:"T1 BOOKED";font-size:.52rem}',
    '.calendar-booking.trailer-26::after{content:"T2 BOOKED";font-size:.52rem}',
    '.calendar-booking.trailer-dump::after{content:"DUMP BOOKED";font-size:.52rem}',
    '@media (max-width:680px){.calendar-day{min-height:92px!important}.calendar-empty{min-height:92px!important}.calendar-booking.trailer-23::after,.calendar-booking.trailer-26::after,.calendar-booking.trailer-dump::after{font-size:.46rem}}'
  ].join('');
  document.head.appendChild(style);

  if (document.readyState === 'loading') {
    document.write('<script src="availability-live.js?v=' + Date.now() + '"><\/script>');
    return;
  }

  var script = document.createElement('script');
  script.src = 'availability-live.js?v=' + Date.now();
  script.onload = function () { window.dispatchEvent(new Event('rayzart-availability-loaded')); };
  document.head.appendChild(script);
})();
