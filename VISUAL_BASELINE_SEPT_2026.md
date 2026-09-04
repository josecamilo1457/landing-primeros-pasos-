# Baseline Visual Aprobado — Septiembre 2026
**Jardín Maternal Primeros Pasos**

**STATUS:** APPROVED  
**DIRECCIÓN ARTÍSTICA:** Jardín Vivo Premium  
**REFERENCE COMMIT:** e46f94a4592cca269bcf8d248be8f2f5e1b5f375  

---

## 1. Objetivo Perceptual Aprobado

La web debe sentirse:
- Premium
- Cálida
- Viva
- Lúdica
- Moderna
- Editorial
- Humana
- Profesional

Debe evitar estrictamente:
- Folleto institucional
- Estética «Hot Sale» / liquidación
- E-commerce o SaaS
- Minimalismo frío
- Plantilla genérica
- Exceso de bloques blancos vacíos
- Diseño infantilizado o kitsch
- Apariencia amateur o descuidada

---

## 2. Decisiones Visuales Aprobadas

- **Hero:**
  - Título editorial limpio con llamado de valor («El mejor lugar después del hogar»).
  - Sin banners chillones de precio ni teasers agresivos.
  - Fotografía real del patio arbolado con niños y docentes como elemento protagonista.
  - CTA primario destacado a WhatsApp para agendar visita presencial.

- **Tipografía, Alineación y Escala Modular:**
  - Encabezados editoriales en serif refinada (*Editorial Lora*).
  - Textos de cuerpo y etiquetas en sans-serif legible (*Manrope*).
  - Ningún texto de lectura por debajo de 14px (0.875rem).
  - **Párrafos cortos, emocionales, introductorios o de cierre:** centrados (`text-align: center`), en contenedor centrado con `max-width: 680–740px` y `margin-inline: auto`.
  - **Párrafos largos y narrativos (carta de dirección, testimonios):** alineación izquierda natural (`text-align: left`) dentro de columna centrada y angosta (`max-width: 680–740px`, `margin-inline: auto`).
  - **Prohibición estricta de `text-align: justify`.**
  - **Mobile 390px:** lectura cómoda con `padding-inline: 18px`, sin líneas excesivamente largas ni textos pegados a bordes de pantalla.

- **Paleta y Fondos:**
  - Fondos marfil cálido (`#fffef9` / `#faf6ef` / `#fbf8f3`).
  - Textos y títulos en azul petróleo profundo (`#10384c`).
  - Acentos orgánicos en verde bosque (`#1c6b54` / `#239c56`) y ámbar/mostaza cálido (`#d49b42` / `#b86926`).
  - Prohibido el uso de colores de choque o semáforo estridente.

- **Fotografías:**
  - Fotos reales y nítidas de las sedes, patios y docentes.
  - Sin máscaras invasivas que corten cabezas o escenas.
  - Proporciones naturales (3:2 o 4:3) con esquinas redondeadas boutique (`border-radius: 18px` a `22px`).
  - Textos y pies de autor ubicados de forma limpia, sin tapar las caras de los niños.

- **Estructura de Promociones (Salas 2, 3 y 4):**
  - Grilla modular simétrica de 3 columnas (1 columna en mobile).
  - Mismas alturas, proporciones, padding y radio de bordes (`22px`).
  - Sin listas de beneficios extensas dentro de las tarjetas.
  - Badges superiores redondeados (`promo-badge-pill`) perfectamente visibles sin recortes superiores (`padding-top: 18px` en contenedor).
  - Botones de WhatsApp alineados de manera uniforme al pie (`margin-top: auto`).

- **Sticker de Urgencia:**
  - Presente en cada tarjeta de promoción: `SOLO DURANTE SEPTIEMBRE`.
  - Con microinteracción sutil de pulso suave (`urgency-pulse`).
  - Punto indicador ámbar y tipografía de alta jerarquía legible.

- **Popup Comercial («Hasta el próximo jueves»):**
  - Entrada suave con fade y escala mínima (`offer-dialog-enter`).
  - Fondo marfil cálido con desenfoque de fondo sutil (`backdrop-filter: blur(5px)`).
  - Mensaje exclusivo enfocado en el regalo del uniforme oficial al reservar en la entrevista.
  - Sin tablas de precios, tarjetas comerciales ni mención aislada de Sala de 2.
  - Botón de cierre circular visible y accesible.

- **Mobile (390px) & Desktop (1440px):**
  - Mobile first fluido sin desbordes horizontales (scroll horizontal = 0).
  - Espacios táctiles mínimos de 48px para todos los botones y enlaces de conversión.
  - Desktop amplio, equilibrado y con aire editorial boutique.

---

## 3. Promociones y Valores Aprobados

### Sala de 2 Años:
- Matrícula habitual: **$400.000**
- Bonificación: **50% BONIFICADA**
- Valor final: **$200.000**

### Sala de 3 Años:
- Matrícula habitual: **$400.000**
- Bonificación: **80% BONIFICADA**
- Valor final: **$80.000**

### Sala de 4 Años:
- Matrícula habitual: **$400.000**
- Bonificación: **85% BONIFICADA**
- Valor final: **$60.000**

### Urgencia:
- Mensaje: **SOLO DURANTE SEPTIEMBRE**

### Beneficio Popup:
- Título: **Hasta el próximo jueves**
- Beneficio: **Uniforme oficial de regalo** reservando durante la entrevista presencial.
- Restricción: No acumulable con otras promociones.

---

## 4. Frase de Dirección Aprobada

Texto textual en la sección de Dirección (Rosana):

> «Antes de elegir un jardín, vengan a vivirlo. Queremos conocerlos, recibir a su peque y que descubran en la entrevista la hermosa experiencia de crecer, jugar y aprender con amigos, en el Mejor lugar después del Hogar.»

---

## 5. Motion y Microinteracciones Aprobadas

- **Transiciones:** Suaves y orientadas a la retroalimentación táctil (`cubic-bezier(0.16, 1, 0.3, 1)` de 200ms a 240ms).
- **Elevación:** Hover leve de -2px a -3px en botones y tarjetas principales.
- **Movimiento ambiental:** Micro-flotación lenta y suave en doodles/formas decorativas (`ambient-float` de 4.5s a 5s).
- **Accesibilidad:** Respeto irrestricto de `@media (prefers-reduced-motion: reduce)` desactivando animaciones cuando el usuario lo configure.

---

## 6. Tracking y Contrato de Atribución Protegido

El baseline visual **NO autoriza modificar bajo ninguna circunstancia**:
- Generación de **Ref ID** corto aleatorio.
- Prefijos de atribución de canal: **`D-`** (Directo/Orgánico), **`G-`** (Google / gclid), **`M-`** (Meta / fbclid / ig).
- Captura y persistencia de parámetros en localStorage: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `fbclid`.
- Evento de Facebook Pixel: `fbq('track', 'Lead', { placement })`.
- Evento de GTM / dataLayer: `whatsapp_interview_request`.
- Webhook a Make.com con payload y `keepalive: true`.
- Script independiente `js/tracking.js` (debe permanecer 100% intacto).
- Los **16 enlaces/botones con atributo `data-track`** identificados y activos:
  1. `whatsapp_header`
  2. `whatsapp_hero`
  3. `whatsapp_rosana`
  4. `whatsapp_timeline`
  5. `whatsapp_actividades`
  6. `whatsapp_promo_sala2`
  7. `whatsapp_promo_sala3`
  8. `whatsapp_promo_sala4`
  9. `whatsapp_historias`
  10. `whatsapp_sede_paunero`
  11. `whatsapp_sede_blois`
  12. `whatsapp_faq`
  13. `whatsapp_cierre_final`
  14. `whatsapp_float`
  15. `whatsapp_sticky_mobile`
  16. `whatsapp_popup_jueves`

---

## 7. QA del Baseline Oficial

| Verificación | Estado | Detalle |
| :--- | :---: | :--- |
| **Mobile 390px** | **PASS** | Layout 100% fluido y responsive sin scroll horizontal |
| **Desktop 1440px** | **PASS** | Proporciones editoriales, grilla simétrica y jerarquía limpia |
| **Popup 35s** | **PASS** | Apertura suave con mensaje de uniforme oficial de regalo |
| **Promos y Badges** | **PASS** | Badges superiores visibles sin recorte; tarjetas con idéntica altura |
| **Tracking** | **PASS** | 16/16 `data-track` activos con prefijos de canal comprobados |
| **Console** | **PASS** | 0 errores en consola |
| **Overflow** | **PASS** | `document.body.scrollWidth <= window.innerWidth` en todos los viewports |

---

## 8. Capturas de Referencia

Archivos de referencia visual generados y validados:
- **Hero:** `qa_hero_final_1788553368736.png`
- **Promos Desktop:** `qa_promos_desktop_1788561754350.png`
- **Promos Mobile:** `qa_promos_mobile_1788561885118.png`
- **Popup:** `qa_popup_final_1788553456202.png`
- **Frase Actualizada:** `qa_frase_actualizada_1788561791621.png`
- **Página Completa Desktop:** `full-1440.png`
- **Página Completa Mobile:** `full-390.png`

---

## 9. Reglas de No Regresión (Future Changes)

Cualquier cambio futuro **NO DEBE**:
1. Volver a agregar el banner amarillo de precio en el hero.
2. Volver a meter listas de beneficios o perks dentro de las cards de promo.
3. Cortar los badges superiores por falta de padding superior en el contenedor.
4. Usar colores discordantes o estilo semáforo entre Salas 2, 3 y 4.
5. Tapar fotografías con cajas flotantes u overlays pesados.
6. Volver a hacer la web excesivamente estática ni agregar animaciones continuas molestas.
7. Cambiar tipografías sin una razón material de diseño.
8. Romper la coherencia de la Dirección Artística A («Jardín Vivo Premium»).
9. Degradar la experiencia mobile en viewports estándar (390px / 414px / 430px).
10. Introducir estética de liquidación o banners de descuento masivo.

---

## 10. Regla para Futuras Iteraciones

> **«Todo cambio visual futuro debe compararse contra este baseline y no puede degradar percepción premium, claridad, conversión, mobile ni tracking.»**
