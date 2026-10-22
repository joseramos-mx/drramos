/* Service worker de "Mensajes": sólo muestra avisos de mensajes nuevos.
   No guarda nada en caché (la app siempre pide datos frescos). */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data && event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "WhatsApp del consultorio", {
      body: data.body || "Mensaje nuevo",
      tag: data.tag || "mensajes",
      renotify: true,
      icon: "/fav/android-chrome-192x192.png",
      badge: "/fav/android-chrome-192x192.png",
      data: { url: data.url || "/crm/mensajes" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/crm/mensajes", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      for (const v of ventanas) {
        if (v.url.startsWith(self.location.origin) && "focus" in v) {
          v.navigate(url);
          return v.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
