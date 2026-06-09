# Notas de operación · /diseno-sonrisa

Landing de conversión para campañas de Meta Ads. Documenta los pasos
de verificación post-deploy, requisitos de entorno y mantenimiento.

---

## Verificación end-to-end después de cada deploy

Hacer este flujo en producción real, no en preview. Tarda 5 a 10 minutos.

### 0. Pre-requisitos

- `META_TEST_EVENT_CODE` debe estar vacío en producción para que los
  leads cuenten como eventos reales. Si dejas un test code, no se
  contabilizan para optimización de campañas.
- `LEAD_WEBHOOK_URL` ya no se usa (Supabase es el único destino).
  Puede borrarse del entorno.
- Cookies `_fbp` y `_fbc` se leen en el cliente. Para garantizar que
  estén presentes, la primera visita debe llegar desde un anuncio de
  Meta (lleva `fbclid` que setea `_fbc`).

### 1. Lead end-to-end

1. Abrir https://www.drfelipedejesusramos.com/diseno-sonrisa en un
   navegador limpio (incógnito sin extensiones), idealmente desde un
   click simulado de anuncio para que se generen `_fbp` y `_fbc`.
2. Abrir el formulario (cualquier CTA "Agendar valoración privada").
3. Responder las 3 preguntas:
   - Para test de track estético: Q1 = "No, los tengo todos y firmes".
   - Para test de track reconstrucción: Q1 = "Sí, me falta alguno o se mueve".
4. Completar nombre y WhatsApp con datos reales (Meta valida el hash de
   estos campos para mejorar el match score).
5. Enviar.
6. Confirmar:
   - Pantalla de confirmación aparece con WhatsApp pre-cargado.
   - En DevTools Network, `POST /api/lead` devuelve 200 con
     `{ ok: true, persisted: true, capi: { ok: true }, pixel: {...} }`.

### 2. Supabase

1. Entrar a https://supabase.com/dashboard → proyecto → Table Editor →
   tabla `leads`.
2. Verificar que la fila recién creada esté ahí con:
   - `event_id` (UUID).
   - `evento` = `LeadDisenoSonrisa` o `LeadReconstruccion` según Q1.
   - `track` = `estetica` o `full_mouth`.
   - `nombre`, `whatsapp`, `dientes`, `motivo`, `plan` poblados.
   - `fbp`, `fbc` poblados si llegaste con `fbclid`.
   - `estado` = `nuevo` (default).
3. Si el INSERT falla, ver Logs → Postgres logs para causa.

### 3. Meta Events Manager

1. Entrar a https://business.facebook.com/events_manager2 → seleccionar
   el Pixel `27631678653096946`.
2. Sin test_event_code en producción los eventos aparecen en el panel
   "Overview" y "Diagnostics" con un delay de ~10 minutos.
3. Para validar dedup de forma inmediata, hacer una prueba aparte:
   - Setear `META_TEST_EVENT_CODE` en Vercel temporalmente con el
     código que Events Manager te asigna en la pestaña "Test events".
   - Redeploy.
   - Enviar un lead de prueba.
   - En "Test events" debe aparecer **un solo** evento `LeadCualificado`
     con badge "Deduplicated" y origen "Browser + Server".
   - El evento debe tener:
     - `value` = 50000 (estético) o 100000 (reconstrucción).
     - `currency` = "MXN".
     - **Ningún campo** como `track`, `motivo`, `plan`, `dientes`. Si
       alguno aparece, el server filtró mal y hay que arreglarlo antes
       de pasar a producción.
   - Vaciar `META_TEST_EVENT_CODE` y redeploy a producción.

### 4. Contador "30+"

1. Cargar la landing en mobile y desktop.
2. Sin scrollear hasta la sección del doctor, abrir DevTools y forzar
   la sección a la vista con scroll directo.
3. Confirmar:
   - El valor inicial mostrado es "30+", nunca "0+".
   - Al entrar la sección al viewport (si el counter estaba debajo del
     fold), arranca de 0 y anima a 30 en ~2 segundos.
   - Si activas `prefers-reduced-motion` en el sistema operativo y
     recargas, el valor debe quedar fijo en "30+" sin animar.
4. Probar con JS deshabilitado (DevTools → Settings → Disable
   JavaScript) y recargar: el valor debe seguir siendo "30+" porque
   se renderiza en SSR.

### 5. Páginas legales

1. Visitar /privacidad y /aviso-legal desde links del footer.
2. Verificar que carguen con la misma estética dark editorial.
3. Verificar que el link "Al enviar aceptas nuestro aviso de privacidad"
   en el formulario abre `/privacidad` en pestaña nueva.

### 6. Title

1. Visitar /diseno-sonrisa.
2. El title del tab debe ser exactamente
   `Diseño Digital de Sonrisa | Dr. Felipe Ramos · Durango`. Ni más
   ni menos. Sin duplicación del sufijo "| Dr. Felipe Ramos".

---

## Variables de entorno requeridas

Production en Vercel:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
META_PIXEL_ID                = 27631678653096946
META_CAPI_ACCESS_TOKEN       (rotar si se filtra; nunca commitear)
NEXT_PUBLIC_META_PIXEL_ID    = 27631678653096946
META_TEST_EVENT_CODE         (vacío en producción)
```

`META_PIXEL_ID` y `NEXT_PUBLIC_META_PIXEL_ID` deben ser iguales.

---

## Mantenimiento

### Cambiar el valor monetario de los tracks

`src/app/api/lead/route.js` → función `toMetaEvent(evento)`. Ajustar
los valores manteniendo el `name: "LeadCualificado"` y `currency: "MXN"`.

### Agregar más casos a la galería

`src/app/diseno-sonrisa/components/antes-despues.jsx` → array `CASES`.
Cada entrada acepta `aspect` por caso (recomendado: `aspect-[4/5]`
para retratos, `aspect-[19/8]` para close-ups).

### Rotar tokens

- `META_CAPI_ACCESS_TOKEN`: Events Manager → Configuración →
  Conversions API → eliminar token actual y generar nuevo. Actualizar
  en Vercel y redeploy.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase → Project Settings → API
  → rotar. Si rotas la anon key, también hay que actualizar el bundle
  del browser, no solo el servidor.

### Cambiar el ID de Clarity

`src/app/diseno-sonrisa/layout.js` → constante `CLARITY_ID`.

---

## Compliance · qué llega y qué no llega a Meta

| Campo                  | Supabase | Meta CAPI / Pixel |
| ---------------------- | -------- | ----------------- |
| nombre                 | sí       | sí, hasheado SHA-256 |
| whatsapp               | sí       | sí, hasheado SHA-256 con prefijo país |
| dientes (Q1)           | sí       | **no** |
| motivo (Q2)            | sí       | **no** |
| plan (Q3)              | sí       | **no** |
| track (estetica/full)  | sí       | **no** |
| evento interno         | sí       | mapeado a `LeadCualificado` |
| value                  | derivable | sí (50000 o 100000) |
| currency               | derivable | sí (MXN) |
| event_id               | sí       | sí (mismo en cliente y servidor para dedup) |
| fbp, fbc               | sí       | sí |

Cambios en este mapeo requieren revisión legal/compliance antes de
desplegar.

---

## Pendientes / TODO

- Las páginas `/privacidad` y `/aviso-legal` tienen marcadores
  `[REVISAR]` para datos que debe confirmar el responsable legal
  del consultorio (domicilio, razón social, jurisdicción). Revisar
  con el cliente antes de lanzar la campaña.
- Cuando el Dr. Felipe tenga Instagram propio, actualizar el footer
  donde dice `href="#"` (si reactivamos esa sección).
