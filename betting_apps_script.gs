// ── Nube del motor de apuestas · XIV Ryder Cup ─────────────────────────────
// Pegar en una Google Sheet: Extensiones → Apps Script. Publicar como aplicación web
// (Ejecutar como: Yo · Acceso: Cualquier usuario) y copiar la URL /exec en
// SYNC_URL de betting.html.
//
// GET  → devuelve el estado de las apuestas (lo leen todos los móviles).
// POST → guarda el estado; solo lo acepta con el PIN del admin.

const ADMIN_PIN = '2026';   // Debe coincidir con el PIN de la app
const HOJA_ESTADO = 'Estado';
const HOJA_HISTORIAL = 'Historial';

function doGet() {
  const json = hoja_(HOJA_ESTADO).getRange('A1').getValue() || '{}';
  return salida_(json);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const body = JSON.parse(e.postData.contents);
    if (String(body.pin) !== ADMIN_PIN) return salida_(JSON.stringify({ ok: false, error: 'pin' }));

    const state = body.state || {};
    if (state.config) delete state.config.pin;

    // No pisar una versión más reciente (p.ej. si se usan dos móviles de admin)
    const actual = JSON.parse(hoja_(HOJA_ESTADO).getRange('A1').getValue() || '{}');
    if ((state.rev || 0) < (actual.rev || 0)) {
      return salida_(JSON.stringify({ ok: false, error: 'stale', rev: actual.rev }));
    }

    const json = JSON.stringify(state);
    hoja_(HOJA_ESTADO).getRange('A1').setValue(json);
    hoja_(HOJA_HISTORIAL).appendRow([new Date(), state.rev, (state.bets || []).length, json]);
    return salida_(JSON.stringify({ ok: true, rev: state.rev }));
  } finally {
    lock.releaseLock();
  }
}

function hoja_(nombre) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName(nombre);
  if (!h) {
    h = ss.insertSheet(nombre);
    if (nombre === HOJA_HISTORIAL) h.appendRow(['Fecha', 'Revisión', 'Nº apuestas', 'Estado (JSON)']);
  }
  return h;
}

function salida_(json) {
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
