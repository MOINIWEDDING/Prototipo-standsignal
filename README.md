# StandSignal — proyecto completo, listo para producción

App completa en un solo repo Next.js 14 (App Router). Dos mundos separados
que comparten la misma base de datos:

- **Público, sin login:** `/tap` (lo único que tocan tus clientes).
- **Privado, con login:** todo bajo `/dashboard` — analíticas, mesas/stands,
  enlaces NFC/QR, y el enlace de tu menú.

## 1. Instalar

```bash
npx create-next-app@latest standsignal --typescript --app
cd standsignal
# copia TODO el contenido de este paquete encima (respeta las carpetas)
npm install
```

## 2. Base de datos (Supabase)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. **SQL Editor** → pega y ejecuta completo `db/schema.sql`.
3. **Authentication → Providers** → activa "Email".
4. **Authentication → URL Configuration**: agrega tu dominio real como
   **Site URL**, y `https://tudominio.com/auth/callback` en **Redirect URLs**.
5. **Project Settings → API** → copia `Project URL`, `anon public key`, y
   `service_role key`.

## 3. Variables de entorno y despliegue

Copia `.env.example` a `.env.local`, rellena con lo del paso anterior
(`NEXT_PUBLIC_SITE_URL` debe ser tu dominio final, no localhost, una vez
que despliegues). Luego:

```bash
git init && git add . && git commit -m "StandSignal"
gh repo create standsignal --private --source=. --push
```

En [vercel.com](https://vercel.com) → **Add New Project** → importa el
repo → pega las mismas variables en **Environment Variables** → **Deploy**.
Conecta tu dominio propio en **Project → Settings → Domains** — este es el
dominio que va a vivir en tus stands para siempre, así que confírmalo antes
de imprimir o pegar nada físico.

---

## 4. Configurar tu primer stand NFC (el paso que preguntaste)

Esta es la forma recomendada — **no necesitas ningún software especial de
programación NFC avanzada**, solo una app cualquiera que escriba una URL
en un tag.

1. Entra a tu panel → **Mesas y stands**.
2. Crea una mesa (ej. "Mesa 1"). En cuanto la creas, aparece su fila con un
   desplegable — ábrelo.
3. Ahí ves dos cosas ya generadas, listas para usar:
   - **Enlace para programar el chip NFC** — algo como
     `https://tudominio.com/tap?t=8f3a1c...&m=nfc`. Cópialo con el botón.
   - **Código QR para imprimir** — la imagen ya renderizada, con botón
     para descargar el PNG directo.
4. Instala una app de escritura NFC en tu teléfono — **NFC Tools** (gratis,
   iOS/Android) es la más usada.
5. Abre NFC Tools → **Escribir** → **Agregar un registro** → **URL/URI** →
   pega el enlace que copiaste en el paso 3.
6. Acerca tu chip NFC (una etiqueta NTAG213/215/216, las más comunes y
   baratas) a la parte trasera del teléfono → **Escribir**.
7. Pega ese chip dentro o debajo de tu stand físico de mesa.
8. Prueba: toca el stand ya armado con cualquier teléfono (con NFC
   activado) → debe abrir tu menú en menos de un segundo.
9. Repite los pasos 2-8 por cada mesa. Cada una tiene su propio enlace, así
   que el mapa de calor y el ranking de mesas del dashboard van a
   funcionar correctamente desde el primer toque.

### Para el código QR

El botón "Descargar PNG" del mismo panel te da la imagen lista. Solo
imprímela (en el mismo stand, en un tent card, o donde prefieras) — no
requiere ningún paso de programación, es una imagen normal.

### Antes de repartir stands en las mesas reales

Configura el enlace de tu menú en **Menú y ajustes** — si no lo has hecho,
el panel de "Mesas y stands" te lo va a recordar con un aviso naranja
arriba. Sin eso, cualquier stand que ya hayas armado manda a tus clientes
a una pantalla de "menú no disponible" en vez de la carta real.

---

## 5. Método avanzado (opcional): UID mirroring

Si vas a programar decenas de chips y quieres que el propio chip
autocomplete su identificador (sin que tú generes un link por mesa a
mano), existe un método alterno con NXP TagWriter y la técnica de
"mirroring". Esto requiere:

1. Escribir la misma plantilla en todos los chips:
   `https://tudominio.com/tap?uid={UID}&ctr={COUNTER}`
2. La primera vez que se toca un chip nuevo, `/tap` lo manda solo a
   `/onboarding?code=...` para que lo asignes a una mesa.
3. También puedes emparejar manualmente desde **Mesas y stands → Avanzado:
   emparejar por UID de hardware**, pegando el código a mano.

Para la gran mayoría de restaurantes, el método de la sección 4 (enlace
directo por mesa) es más simple y suficiente — usa este solo si ya tienes
experiencia con programación NFC en volumen.

---

## Qué incluye este paquete

| Área | Archivos |
|---|---|
| Redirección pública | `app/tap/route.ts` (soporta ambos métodos: enlace directo por mesa y UID mirroring) |
| Enlaces NFC/QR por mesa | `components/dashboard/TableLinksPanel.tsx` |
| Emparejamiento avanzado | `app/onboarding/*`, `app/api/stands/pair/route.ts` |
| Autenticación | `app/login`, `app/signup`, `app/reset-password/*`, `app/auth/callback`, `middleware.ts` |
| Dashboard | `app/dashboard/*`, `components/dashboard/*` |
| Datos / agregados | `lib/queries.ts` |
| Clientes de Supabase | `lib/supabase-browser.ts`, `lib/supabase-server.ts`, `lib/supabase-admin.ts` |
| Base de datos | `db/schema.sql` |

## Qué garantiza este diseño

- **El cliente final nunca ve tu marca ni una pantalla intermedia** — solo
  el salto instantáneo.
- **El negocio ve todo** — mesa, medio (NFC/QR), dispositivo, timestamp.
- **Cambiar el menú no requiere tocar ningún chip** — se actualiza desde
  **Menú y ajustes** y aplica a todos los stands al instante.
- **Aislamiento real entre negocios** vía Row Level Security.
