# Motor de Apuestas — XIV Ryder Cup Córdoba
## Definición Funcional · Fase 2

---

## Concepto General

Sistema de apuestas cerrado y privado para los 20 participantes de la XIV Ryder Cup Córdoba.
Se implementa como un HTML autocontenido e independiente de la app principal del viaje.

---

## Reglas del Sistema

- Cada jugador puede apostar un **máximo de 20€ en total**
- Las apuestas se registran el **sábado noche** tras el anuncio de emparejamientos del domingo
- Los mercados disponibles son:
  - **Apuesta a partido individual de Singles** (resultado de un enfrentamiento concreto)
  - **Apuesta a resultado final** (equipo ganador de la XIV edición)
- Un jugador puede distribuir sus 20€ entre varios mercados (ej. 10€ a un partido + 10€ al resultado final)
- El sistema calcula automáticamente y de forma determinista:
  - Cuánto cobra cada ganador
  - Cuánto debe pagar cada perdedor
  - Balance neto de cada jugador

---

## Mercados Disponibles

### Mercado 1 — Singles individuales
- 10 partidos disponibles (se activan tras el anuncio del sábado noche)
- Cada apuesta es a **ganador del partido** (no hay handicap ni hándicap de cuota)
- Sistema de cuotas: **pari-mutuel** (el pozo total se reparte proporcionalmente entre los ganadores)

### Mercado 2 — Resultado final de la edición
- Dos opciones: **Locos ganan** / **Lobos ganan o retienen**
- Sistema de cuotas: **pari-mutuel**

---

## Flujo de Registro de Apuestas

1. Organizador abre el HTML de apuestas el sábado noche tras el Debriefing
2. Para cada jugador:
   - Selecciona su nombre
   - Indica los mercados en los que apuesta y el importe de cada uno
   - Confirma que ha entregado el dinero físicamente (checkbox "Dinero entregado ✓")
3. El sistema valida que el total apostado ≤ 20€ por jugador
4. Las apuestas quedan registradas y bloqueadas (no modificables salvo admin)

---

## Flujo de Resolución y Pago

1. Tras conocerse los resultados del domingo, el admin introduce los resultados en la app principal
2. El motor de apuestas recoge automáticamente los resultados y calcula:
   - Pozo total por mercado
   - Ganadores por mercado y su apuesta proporcional
   - Beneficio neto de cada ganador
   - Deuda neta de cada perdedor
3. Se genera una **tabla de liquidación** con:
   - Quién cobra, cuánto y de quién
   - Quién paga, cuánto y a quién
   - Saldo neto de cada jugador (positivo = cobrar, negativo = pagar)

---

## Requisitos Técnicos

- **Stack:** HTML autocontenido, sin backend ni servidor
- **Persistencia:** localStorage (mismo dispositivo del organizador) o exportación JSON para compartir estado
- **Acceso:**
  - Vista pública: cualquiera puede ver las apuestas registradas y los resultados
  - Vista admin (PIN): solo el organizador puede registrar/modificar apuestas y resultados
- **Compartición:** el HTML actualizado se distribuye por WhatsApp al grupo, igual que la app principal
- **Integración con app principal:** opcional — el motor puede leer los resultados del marcador principal si comparten formato, o introducirlos manualmente

---

## Pantallas / Secciones del HTML

| Sección | Descripción |
|---------|-------------|
| 📋 Mis apuestas | El jugador selecciona su nombre y ve sus apuestas activas |
| 📊 Cuadro general | Tabla con todos los jugadores, sus apuestas e importes |
| 💰 Resultados | Tabla de liquidación final (visible solo tras cerrar mercados) |
| 🔐 Admin | Registro de apuestas, confirmación de dinero entregado, introducción de resultados |

---

## Pendiente de Definir

- [ ] ¿Sistema de cuotas pari-mutuel o cuotas fijas 1:1 (más simple)?
- [ ] ¿Se permite apostar en mercados donde uno mismo es participante? (ej. Fertxo apuesta a su propio partido)
- [ ] ¿Qué ocurre si un partido se empata — se devuelve la apuesta o se pierde?
- [ ] ¿Quién hace de banco físico — Alberto o el capitán?
- [ ] ¿Los resultados del motor se integran automáticamente desde el marcador principal o se introducen manualmente?

---

## Instrucciones para Claude Code (Fase 2)

```
Construye un HTML autocontenido mobile-first para gestionar las apuestas 
de la XIV Ryder Cup Córdoba con las siguientes características:

JUGADORES: 20 participantes (10 Locos + 10 Lobos) — ver jugadores_equipos.md
MÁXIMO POR JUGADOR: 20€
MERCADOS: 10 partidos Singles + resultado final de edición
CUOTAS: pari-mutuel (pozo dividido proporcionalmente entre ganadores)

SECCIONES:
- Mis apuestas (selección de nombre + ver apuestas propias)
- Cuadro general (todos los jugadores, apuestas e importes)
- Resultados / Liquidación (visible tras cierre de mercados)
- Admin (PIN protegido): registro apuestas, confirmación dinero, resultados

PERSISTENCIA: localStorage
DISEÑO: mismo sistema de colores que app principal 
         (verde oscuro golf + dorado + blanco)
COMPARTICIÓN: HTML autocontenido exportable y distribuible por WhatsApp
```
