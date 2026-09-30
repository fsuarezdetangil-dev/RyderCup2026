# XIV Ryder Cup Córdoba
### App oficial del viaje · 2–4 Octubre 2025

App mobile-first para los 20 participantes de la XIV edición de la Ryder Cup Córdoba. Incluye marcador en tiempo real, agenda, equipos, logística y recogida de preferencias.

---

## Uso de la app

Abrir `index.html` en el móvil (o acceder a la URL de GitHub Pages).

Las imágenes deben estar en la carpeta `/img/`:
- `campo-hero.jpg` — Hero del inicio
- `campo-fairway.jpg` — Fondo sección Equipos
- `mezquita-noche.jpg` — Card agenda Mezquita
- `torres-cabrera-patio.jpg` — Card agenda Torres Cabrera
- `torres-cabrera-salon.jpg` — Panel detalle Torres Cabrera

Si alguna imagen no existe, se muestra el gradiente CSS de fallback.

---

## Actualizar el marcador (Admin)

1. Abrir la app en el móvil
2. **Triple tap** en el título "XIV RYDER CUP" del header
3. Introducir PIN: **`0000`**
4. En el panel Admin:
   - **Emparejamientos Sábado**: seleccionar 2 Locos + 2 Lobos por cada uno de los 5 partidos
   - **Emparejamientos Domingo**: seleccionar 1 Loco + 1 Lobo por cada uno de los 10 singles
   - **Resultados Foursomes / Fourball / Singles**: Win Locos / Empate / Win Lobos
5. Pulsar **GUARDAR Y CERRAR** — el marcador se actualiza inmediatamente
6. Subir los cambios (ver abajo) para que todos vean el marcador actualizado

---

## Subir cambios a GitHub Pages

Tras actualizar el marcador o cualquier contenido:

```bash
git add .
git commit -m "Update: marcador XIV edición"
git push
```

GitHub Actions despliega automáticamente en ~1 minuto.

---

## URL de GitHub Pages

Una vez activado en **Settings → Pages → Source: GitHub Actions**:

```
https://[usuario].github.io/[repo]/
```

Distribuir esta URL por WhatsApp al grupo para que todos accedan siempre a la versión más reciente.

---

## Motor de apuestas

App adicional (`betting.html`) con sistema de apuestas pari-mutuel para los 20 participantes.

- **URL**: `https://fsuarezdetangil-dev.github.io/RyderCup2026/betting.html`
- **PIN admin**: `2026`
- **Banco físico**: Alberto
- **Máximo por jugador**: 20€
- **Mercados**: 10 Singles individuales + Resultado final de edición

### Nube (Google Sheets) — para que todos vean las apuestas

Los datos se guardan en el móvil del admin y se sincronizan con una Google Sheet, de modo que cualquier participante que abra el link ve sus apuestas, los resultados según acaban los partidos y la liquidación. Configuración (una vez):

1. Crear una Google Sheet nueva → **Extensiones → Apps Script**
2. Pegar el contenido de `betting_apps_script.gs` y guardar
3. **Implementar → Nueva implementación → Aplicación web** · Ejecutar como: *Yo* · Acceso: *Cualquier usuario* → autorizar
4. Copiar la URL que termina en `/exec` en `SYNC_URL` de `betting.html` y subir a `main`

Los resultados del sábado (Fourball y Greensome) se introducen también en la app de apuestas (Admin → Resultados); con ellos y los Singles la app calcula sola el ganador de la edición (Lobos retienen con 7,5), con opción de corregirlo a mano.

La hoja `Estado` guarda los datos actuales y `Historial` una copia de cada cambio. Sin `SYNC_URL` la app funciona solo en local (como antes).

### Documentación de apuestas

| Fichero | Destinatario | Contenido |
|---------|-------------|-----------|
| `guia_betting_rydercup2026_Admin.docx` | Alberto (coordinador) | Cómo funciona la app y la nube, ensayo previo, pasos del fin de semana, pagos, qué hacer si algo falla |
| `guia_betting_rydercup2026_Player.docx` | Todos los jugadores | Reglas, sistema pari-mutuel, ejemplos de apuestas, apuesta desierta, FAQ |

---

## Estructura de ficheros

```
/
├── index.html                              ← App principal (CSS + JS inline)
├── betting.html                            ← Motor de apuestas pari-mutuel
├── guia_betting_rydercup2026_Admin.docx    ← Guía del coordinador (Alberto)
├── guia_betting_rydercup2026_Player.docx   ← Guía para apostadores
├── /img/
│   ├── campo-hero.jpg
│   ├── campo-fairway.jpg
│   ├── mezquita-noche.jpg
│   ├── torres-cabrera-patio.jpg
│   └── torres-cabrera-salon.jpg
├── .github/
│   └── workflows/
│       └── deploy.yml                      ← GitHub Actions auto-deploy
└── README.md
```

---

## Preferencias de jugadores (sección "Yo")

Cada jugador selecciona su nombre y responde 6 preguntas. Las respuestas se guardan en `localStorage` del dispositivo y se envían a Alberto (681 637 862) por WhatsApp con un botón.

Las preferencias recogidas son:
1. Green fee previo (jueves/viernes/ninguno + hora)
2. Visita nocturna Mezquita (sí/no)
3. Bebidas cena viernes en Torres Cabrera
4. Avituallamiento sábado (entre Foursomes y Fourball)
5. Avituallamiento domingo (durante el partido — es la comida del día)
6. Menú cena sábado en Los Berengueles (carne/pescado/vegetariano)

