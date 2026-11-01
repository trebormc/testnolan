# Test Nolan

Test político interactivo que sitúa al usuario y a los partidos en el **diagrama de Nolan** a partir de un mismo cuestionario. La primera versión está centrada en las **elecciones generales de España del 29 de noviembre de 2026**.

- Dominio principal: **testnolan.com** (con **testnolan.es** redirigiendo a la versión española).
- Tecnología: una página estática (HTML + CSS + JavaScript, sin dependencias ni backend).
- Código y datos: [github.com/trebormc/testnolan](https://github.com/trebormc/testnolan), público.
- Hosting: Cloudflare, desplegado automáticamente desde este repositorio.
- Autor: [Robert Menetray](https://menetray.com).

> Este README recoge lo que es el proyecto, cómo funciona, las decisiones que ya están tomadas y lo que queda por implementar. Está pensado para que cualquier persona (o un agente como Claude Code) pueda retomar el trabajo y poner el repositorio al día.

---

## Índice

1. [Qué es el diagrama de Nolan](#qué-es-el-diagrama-de-nolan)
2. [Finalidad del proyecto](#finalidad-del-proyecto)
3. [Estado actual](#estado-actual)
4. [Cómo funciona el test](#cómo-funciona-el-test)
5. [Criterios de clasificación](#criterios-de-clasificación)
6. [Partidos incluidos y posiciones resultantes](#partidos-incluidos-y-posiciones-resultantes)
7. [Preguntas del test](#preguntas-del-test)
8. [Fuentes](#fuentes)
9. [Decisiones tomadas](#decisiones-tomadas)
10. [Tareas pendientes](#tareas-pendientes)
11. [Estructura de archivos propuesta](#estructura-de-archivos-propuesta)
12. [Limitaciones y advertencias](#limitaciones-y-advertencias)
13. [Cómo contribuir](#cómo-contribuir)
14. [Licencia](#licencia)

---

## Qué es el diagrama de Nolan

El diagrama de Nolan (*Nolan chart*) es un modelo para representar posturas políticas en **dos ejes** en lugar de en la línea clásica izquierda-derecha. Lo creó el activista libertario estadounidense **David Nolan en 1969**.

- **Libertad económica**: cuánto interviene el Estado en impuestos, gasto, regulación y propiedad.
- **Libertad personal**: cuánto controla el Estado la conducta pacífica de las personas (expresión, protesta, migración, estilo de vida, garantías ante la policía).

El plano se gira 45° y queda como un **rombo** con cinco zonas:

| Zona | Economía | Libertades | Descripción para compartir |
|---|---|---|---|
| **Libertario** (arriba) | Alta | Alta | Mucha libertad en lo económico y en lo personal; el Estado debería intervenir lo mínimo tanto en tu bolsillo como en tu vida privada. |
| **Derecha** (derecha) | Alta | Baja | Libertad económica alta (menos impuestos y regulación), pero más control del Estado en lo personal y social, como orden público, inmigración o costumbres. |
| **Izquierda** (izquierda) | Baja | Alta | Libertad personal alta (derechos civiles, estilo de vida), pero más intervención del Estado en la economía, con más impuestos, gasto público y regulación del mercado. |
| **Autoritario** (abajo) | Baja | Baja | Poca libertad en ambos ejes; el Estado controla tanto la economía como la vida personal de los ciudadanos. |
| **Centro** | Media | Media | Posiciones moderadas en los dos ejes, sin irse a ningún extremo. |

Además se dibuja una **línea horizontal discontinua** por el centro del rombo: por encima, más libertad total que un punto neutro; por debajo, menos.

No hay que confundirlo con la *Political Compass* (brújula política), que es una variante posterior en forma de cuadrado con cuatro cuadrantes.

**Críticas conocidas del modelo**, que conviene mencionar en la propia web para ser transparentes: desde la ciencia política se le reprocha que simplifica en exceso un espectro muy heterogéneo, y al haberlo diseñado un libertario hay quien considera que favorece que esa ideología quede "arriba".

---

## Finalidad del proyecto

- Ofrecer a cualquier votante una forma rápida y visual de ver **dónde se sitúa** y **qué partidos están más cerca** de lo que piensa, antes de las generales del 29N.
- Hacerlo de forma **transparente**: los partidos se colocan con las mismas preguntas y las mismas reglas que el usuario, y sus respuestas se pueden consultar pregunta a pregunta.
- Que sea **fácil de compartir** en redes (WhatsApp, X, Facebook, Instagram) para que se difunda lo máximo posible durante la campaña.
- No recoger ni guardar ningún dato del usuario.

El test **no recomienda votar a nadie**. Muestra afinidad con las posiciones estimadas de cada partido y deja la decisión al usuario.

---

## Estado actual

Existe un prototipo funcional en un único archivo, `index.html`, con todo el CSS y el JavaScript incrustados, más `og-image.png` (imagen fija para Open Graph). Incluye:

- Rombo de Nolan dibujado en SVG con las cinco zonas, la línea media discontinua y los ejes rotulados.
- **47 afirmaciones** (20 de economía y 27 de libertades) con escala de 5 puntos. Cada una lleva una etiqueta corta de tema (`k`) y un **contexto en lenguaje llano** (`c`) que se despliega con «¿Qué significa?» justo encima de la escala, a todo el ancho de la pregunta. Debajo de las respuestas de los partidos, otro desplegable, «¿Por qué responde así cada partido?», muestra para cada partido y referencia su posición, una frase con el hecho que la justifica y el enlace a la fuente. Esas frases están en el bloque `<script type="application/json" id="whyData">` de `index.html`, con la forma `{partido:{pregunta:[frase, url]}}`, y se leen solo al abrir el desplegable.
- Posición de cada partido calculada a partir de sus respuestas, con el mismo cálculo que el usuario.
- Punto **"Tú"** que se mueve en el rombo según se responde.
- **Veredicto** en «Tu posición», basado en la afinidad del partido más cercano (sin las referencias internacionales): 85 % o más, «te representa»; de 75 % a 84 %, «el que más se parece a ti, con matices»; por debajo, «ningún partido te representa del todo» indicando el más cercano. Si el segundo está a 3 puntos o menos se declara empate («te representan por igual X e Y»), y no hay veredicto hasta tener 4 respuestas por eje. Los cuatro umbrales son constantes (`REP_FULL`, `REP_PARTIAL`, `REP_TIE`, `REP_MIN_AXIS`). Calibración: un votante convencido que se desvía un paso en la mitad de las preguntas obtiene ~91 %; responder al azar da ~64 % con el mejor partido; todo neutral da hasta 77 % con los partidos moderados; Frente Amplio y Podemos están al 95 % entre sí, Vox y SALF al 88 %, PSOE y Frente Amplio al 85 %. El veredicto sale también en la franja, en la columna fija, en la imagen compartida y en el texto de compartir.
- Ranking de **afinidad por respuestas** con cada partido, y un bloque **«En qué coincides y en qué no»** con los tres partidos más cercanos (ampliable a todos): temas en los que has dado la misma respuesta (sin contar el neutral) y temas en los que estás a tres o más pasos de distancia.
- En cada pregunta, **qué responde cada partido** siempre visible, alineado bajo la opción correspondiente de la escala (la columna de tu respuesta queda marcada). Volver a pulsar la opción elegida la quita.
- Leyenda para mostrar u ocultar partidos.
- **Paginación por ámbitos**: las 47 afirmaciones se agrupan en 8 ámbitos de 4 a 7 preguntas, alternando economía y libertades (Impuestos y gasto público; Vida privada y derechos; Vivienda; Expresión, protesta y redes; Trabajo y pensiones; Inmigración y seguridad; Estado, empresa y medio ambiente; Costumbres e instituciones). Se muestra un ámbito por página, con un indicador de pasos que lleva a cualquiera y marca cuántas van respondidas en cada uno, botones Anterior / Siguiente ámbito y, en el último, «Ver mi resultado». El ámbito actual se recuerda. Los ámbitos (`TOPICS`, campo `g` de cada pregunta) solo ordenan el cuestionario; no afectan al cálculo. Orden de la página: portada con el título y la descripción a la izquierda y el **rombo con todos los partidos a la derecha** (en móvil, debajo), la fila de cifras, la **zona de trabajo** con las preguntas, y debajo el **tablero de tres columnas**: rombo con leyenda, «Tu posición» (puntuaciones y afinidad) y «Compártelo con tu grupo» (tu nombre, la lista del grupo, añadir a mano y los botones de compartir, activos cuando hay respuestas y nombre). Después, las secciones plegadas de explicación y el pie. La zona de trabajo va en dos columnas: a la izquierda una columna fija (sticky) con una miniatura viva del rombo (vía `<use>` del mismo SVG), la zona, las puntuaciones, el partido más afín y el panel «En qué coincides y en qué no»; a la derecha, las preguntas paginadas. Así el punto se mueve y las coincidencias cambian a la vista mientras se responde. En móvil la columna fija pasa debajo de las preguntas (sin la miniatura) y una **franja fija superior** con la miniatura, la zona y las puntuaciones hace esa función.
- Barra de progreso global de 2 px y botón «Borrar todas mis respuestas» (con confirmación en dos pulsaciones) al pie de la página de preguntas.
- **Atajos de teclado**: `1`–`5` responden la pregunta activa y pasan a la siguiente (la misma tecla quita la respuesta); flechas o `j`/`k` cambian de pregunta y, en los bordes, de ámbito. La pista solo se muestra en dispositivos con puntero.
- **Nombre opcional para tu punto**: sustituye a «Tú» en el rombo, viaja en el enlace de comparación (`&n=`) y aparece en la imagen compartida («A Marta le sale…»).
- Dos secciones informativas **plegadas por defecto** (solo título y una línea de entradilla; al abrir, el texto ocupa todo el ancho, en dos columnas de lectura en pantallas anchas; los enlaces de la barra superior las abren): **«Qué es el test de Nolan y por qué sirve»** (la línea izquierda-derecha frente a los dos ejes; David Nolan, el artículo de 1971 y el Partido Libertario; Marshall Fritz y el «World's Smallest Political Quiz» de 1987; la brújula política de 2001; para qué le sirve a quien no sabe a quién votar; límites del modelo) y **«Cómo se calcula y de dónde salen las posiciones»** (ejes, puntuación, afinidad, veredicto, estimaciones, circunscripciones, tabla de posiciones, versión de los datos y fuentes). La barra superior enlaza a las dos.
- **Diseño**: tema oscuro único de grafito medio (`#1e1f22`) con texto blanco papel (`#f4f3ef`) y secundario `#d6d4cd`, pensado para que el texto se lea bien sin ser negro puro. Tipografía Bricolage Grotesque para títulos y afirmaciones (en seminegrita), Source Sans 3 para texto e IBM Plex Mono para cifras y etiquetas. Sin degradados ni sombras: filetes de 1 px, controles segmentados, numerales tabulares. Portada en dos columnas, texto y rombo, y una fila de cifras clave debajo. Preguntas en filas separadas por filetes con número `01 / 47`. En móvil las tres columnas del tablero se apilan en el mismo orden y la columna fija de coincidencias pasa debajo de las preguntas. `prefers-reduced-motion` desactiva las transiciones. La imagen de Open Graph y la de compartir usan el mismo tema.
- Persistencia de respuestas solo en el navegador del usuario (`localStorage`, clave `testnolan-es-2026`, con `try/catch`). Nada sale del dispositivo.
- **Tono de los textos**: cercano y directo, pensado para quien no sabe a quién votar o va a votar «al menos malo». La portada es un solo párrafo corto a todo el ancho: para quién es (quien va a votar «al menos malo»), cuánto se tarda (5 minutos), qué va a ver (qué partido se le parece más y en qué discrepa sin saberlo) y la invitación a pasárselo a quien se vaya a llevar una sorpresa. Lo de que no lo ha hecho ningún partido y no guarda nada queda en la fila de cifras y en el pie. El titular es «¿Qué partido te representa de verdad?» y la palabra clave «test de Nolan» queda en la etiqueta superior, el título de la pestaña y los metadatos. La metodología y el pie mantienen la precisión pero sin formalismos.
- Esqueleto HTML completo (`lang="es"`, `charset`, `viewport`), título y descripción orientados a buscar «test de Nolan elecciones generales España 29N», etiquetas Open Graph y Twitter Card, `canonical` a `https://testnolan.com/es/` y datos estructurados JSON-LD.
- **Compartir en redes**: una fila de iconos redondos en una sola línea (Compartir… nativo cuando el navegador lo permite, WhatsApp, Telegram, X, Facebook y Descargar imagen), cada uno con su nombre accesible (`aria-label`) y un globo con el nombre al pasar el ratón o enfocar con el teclado. Los de red abren la aplicación con el texto y el enlace del grupo ya escritos. Debajo, «Copiar enlace del grupo» a todo el ancho. La imagen es un PNG de 1200 × 630 generado en un `<canvas>` con el rombo, los partidos, tu punto y los de tu grupo, tu zona, tus dos puntuaciones, el partido más afín y la URL testnolan.com. El botón nativo la adjunta directamente (Web Share API con archivo). Los avisos de «Enlace copiado» e «Imagen descargada» son un globo pegado al botón, no un alert. La copia usa la API moderna del portapapeles en HTTPS, `execCommand('copy')` en HTTP (red local) y, si todo falla, muestra el enlace en un campo seleccionado. La constante `SHARE_SHOW_TOP_PARTY` controla si el texto y la imagen nombran al partido más afín.
- **Enlace del grupo** (`#g=Nombre~E~P|Otro~E~P`): el *hash* de la URL lleva el nombre y las dos puntuaciones (0 a 100) de cada persona del grupo, empezando por quien comparte. Nunca llega al servidor y no incluye las respuestas una a una. Quien lo abre ve a todas esas personas en el rombo con su nombre, las tiene listadas en el panel «Compártelo con tu grupo» (con su zona y botón para quitarlas), puede añadir a alguien a mano con nombre y puntuaciones, y al compartir a su vez el enlace incluye a todo el grupo más su propio punto, así que el rombo se va llenando de amigo en amigo. El grupo se guarda en `localStorage` junto a las respuestas. Si el enlace trae a alguien con tu mismo nombre se ignora (sería tu propio enlace reenviado). El botón de compartir se activa cuando hay respuestas y has puesto tu nombre; sin nombre no se puede compartir, porque el punto no serviría para el grupo. Los nombres admiten tildes, eñes, ces trencadas, diéresis, el punt volat y apóstrofos: van en UTF-8 codificado con `encodeURIComponent` y se leen con `URLSearchParams`. Solo se quitan `< > " & ~ | % +` (los que romperían el HTML o el formato del enlace) y se compactan los espacios; máximo 24 caracteres. Probado de extremo a extremo con «Núria Ça·ñé», «Begoña O'Neil» y «Çetin Ü». `HASH_VERSION` se incrementa si cambia el formato.
- Modo `?og=1` que muestra solo la imagen genérica de 1200 × 630 (sin usuario, tema claro) para capturarla como `og-image.png`, y `?og=user` para previsualizar la imagen del resultado propio.
- Metodología ampliada: versión y fecha de los datos visibles (`DATA_VERSION`, `DATA_DATE`), nota de circunscripciones (D21 + Cs solo en Madrid y Barcelona; SALF solo en algunas provincias), críticas al modelo de Nolan y soporte para enlazar la **fuente** de cada respuesta de cada partido (campo opcional `src` por pregunta; aún sin datos).
- Pie de página con la política de datos (no hay servidor, cookies ni analítica; todo queda en el navegador), aviso de que las posiciones son estimaciones y de que el test no recomienda votar a nadie, autoría con enlace a menetray.com y contacto para correcciones.
- Accesibilidad: descripción del SVG que se actualiza con la posición del usuario, mensajes de estado con `aria-live`, etiquetas en los botones de la leyenda y de compartir, foco visible en todos los controles y `prefers-reduced-motion` respetado.

Lo que **todavía no existe** está en [Tareas pendientes](#tareas-pendientes).

---

## Cómo funciona el test

### Escala de respuesta

Cinco opciones, codificadas de −2 a +2:

| Opción | Valor |
|---|---|
| Muy en contra | −2 |
| En contra | −1 |
| Neutral | 0 |
| A favor | +1 |
| Muy a favor | +2 |

Se eligió una escala de 5 puntos porque con 3 se pierde matiz y la gente acaba en los extremos, y con más de 5 la diferencia entre opciones se vuelve arbitraria. Las preguntas sin responder **no cuentan** en el cálculo.

### Dirección de cada pregunta

Cada pregunta tiene un eje (`E` economía o `P` libertades) y una dirección (`dir`):

- `dir: +1` → estar a favor implica **más libertad** en ese eje (menos intervención del Estado).
- `dir: −1` → estar a favor implica **menos libertad** en ese eje (más intervención del Estado).

### Puntuación por eje

Para cada eje:

```
puntuación = 50 + 25 × media(respuesta × dir)
```

Da un valor de 0 a 100, donde 50 es el punto neutro. Se calcula igual para el usuario y para cada partido.

Una respuesta de partido puede ser `null`, que significa **sin dato**: no hay programa, voto ni declaración que permita puntuarla. No es lo mismo que 0 (neutral o posición ambigua documentada). Las casillas sin dato no entran en la media del partido, ni en la afinidad, ni en las coincidencias, y la web lo indica en el desplegable de cada pregunta. Se usa sobre todo con las referencias internacionales, porque varias afirmaciones son debates españoles sin equivalente en sus países, y con SALF, que a 1 de noviembre de 2026 no ha publicado programa.

### Afinidad con cada partido

Comparación respuesta a respuesta, solo con las preguntas que ha contestado el usuario y en las que el partido tiene dato:

```
afinidad = 100 − (media(|respuesta_usuario − respuesta_partido|) / 4) × 100
```

100 % si coinciden en todas; 0 % si están en extremos opuestos en todas. Es más fiable que la distancia visual en el rombo, porque dos posiciones cercanas pueden salir de respuestas muy distintas.

Se recomienda al usuario responder **al menos 4 preguntas de cada bloque** para que la posición sea fiable (la web lo avisa).

### Zonas

Con `E` = libertad económica y `P` = libertad personal:

- **Centro** si `|E − 50| ≤ 15` y `|P − 50| ≤ 15`.
- **Libertario** si `E ≥ 50` y `P ≥ 50`.
- **Derecha** si `E ≥ 50` y `P < 50`.
- **Izquierda** si `E < 50` y `P ≥ 50`.
- **Autoritario** si `E < 50` y `P < 50`.

Consecuencia importante del modelo: la frontera entre Libertario y Derecha es la línea `P = 50`. **Subir la libertad económica nunca hace cruzar esa frontera**; solo la cruza quien sube en libertad personal. Lo mismo ocurre, en espejo, con el resto de fronteras.

### Geometría del rombo (SVG)

`viewBox` de 560 × 560, centro en (280, 280), factor `K = 2.4`:

```
x = 280 + (E − P) × 2.4
y = 280 − (E + P − 100) × 2.4
```

- Vértice superior (Libertario): E = 100, P = 100.
- Vértice derecho (Derecha): E = 100, P = 0.
- Vértice izquierdo (Izquierda): E = 0, P = 100.
- Vértice inferior (Autoritario): E = 0, P = 0.
- Rombo central: E y P entre 35 y 65.

Las etiquetas de los partidos usan una colocación simple que prueba varias posiciones alrededor del punto y elige la primera que no se solapa con otras etiquetas, puntos o rótulos de zona.

---

## Criterios de clasificación

Estas reglas se acordaron para que **todos los partidos se midan con la misma vara**. Cualquier cambio en las respuestas debe respetarlas.

1. **Eje económico**: impuestos, gasto público, regulación de mercados y **propiedad**. Expropiar, nacionalizar o gravar un bien hasta hacerlo insostenible (por ejemplo, un impuesto anual del 10 % sobre el valor de una vivienda) cuenta aquí, no en el eje personal.
2. **Eje personal**: cuánto controla el Estado la **conducta pacífica**: expresión, protesta, migración, estilo de vida, sexualidad, consumo, y garantías frente al poder (debido proceso, separación de poderes, legislar por decreto).
3. **Neutral**: endurecer las penas por delitos violentos **después de un juicio con garantías** no resta libertad personal a quien no agrede a nadie. Por eso no cuenta en ningún eje.
4. **Sí resta libertad personal**: detener sin orden judicial, suspender garantías constitucionales o sancionar por lo que alguien dice, porque afecta también a inocentes.
5. **Equilibrio del cuestionario**: las preguntas del eje personal incluyen restricciones defendidas tanto por la derecha (inmigración, aborto, burka, ilegalización de partidos) como por la izquierda (regulación de medios, anonimato en redes, tabaco, verificación de identidad en webs para adultos, prostitución). Cualquier pregunta nueva debe mantener ese equilibrio.
6. **Solo hechos y propuestas públicas**: las respuestas de cada partido se basan en programas, votaciones en el Congreso y declaraciones públicas. Para Milei y Bukele, que son referencias internacionales, se usa **lo que ya han aplicado** en sus países, no solo lo prometido.

---

## Partidos incluidos y posiciones resultantes

Posiciones calculadas con el cuestionario actual (47 preguntas, versión de datos 1.6). Escala de 0 a 100.

| Partido | Candidatura y cabeza de lista | Economía | Libertades | Zona |
|---|---|---:|---:|---|
| PP | Partido Popular · Alberto Núñez Feijóo | 70 | 37 | Derecha |
| PSOE | PSOE / PSC · Pedro Sánchez | 19 | 54 | Izquierda |
| Vox | Vox · Santiago Abascal | 86 | 38 | Derecha |
| Frente Amplio | Frente Amplio (antes Sumar) · Ada Colau | 6 | 69 | Izquierda |
| Podemos | Podemos · Irene Montero | 8 | 73 | Izquierda |
| SALF | Se Acabó La Fiesta · Alvise Pérez | 83 | 55 | Libertario |
| D21 + Cs | Democracia para el Siglo 21 (Democracia 21 + Ciudadanos + UCIN) · Miriam González | 62 | 56 | Centro |
| Milei *(referencia)* | La Libertad Avanza (Argentina) · Javier Milei | 91 | 32 | Derecha |
| Bukele *(referencia)* | Nuevas Ideas (El Salvador) · Nayib Bukele | 62 | 11 | Derecha |
| Trump *(referencia)* | Partido Republicano (Estados Unidos) · Donald Trump | 71 | 20 | Derecha |
| Putin *(referencia)* | Rusia Unida (Rusia) · Vladímir Putin | 40 | 7 | Autoritario |
| Maduro *(referencia)* | PSUV (Venezuela) · Nicolás Maduro | 24 | 10 | Autoritario |
| Mujica *(referencia)* | Frente Amplio (Uruguay, 2010-2015) · José Mujica | 28 | 66 | Izquierda |
| Meloni *(referencia)* | Fratelli d'Italia (Italia) · Giorgia Meloni | 69 | 26 | Derecha |

Notas:

- Tras la verificación de la versión 1.2 (71 respuestas corregidas con fuentes), el **PP** queda en la zona derecha por un punto (49 en libertades), **SALF** en el borde entre libertario y derecha (50) y **Milei** en el borde entre libertario y derecha (49): su rechazo al aborto y a la eutanasia, la restricción del cannabis medicinal y la Ley Antimafias le bajan la libertad personal. Son zonas fronterizas y conviene releerlas cuando se publiquen los programas.
- **D21 + Cs** solo se presenta en las circunscripciones de **Madrid y Barcelona**. **SALF** va al Congreso en 46 o 47 provincias (no en Lérida, Gerona, Guipúzcoa, Cantabria ni Ciudad Real) y no concurre al Senado. La web lo indica.
- **Las referencias internacionales** (Milei, Bukele, Trump, Putin, Maduro, Mujica y Meloni) son para comparar: no se votan en España ni entran en el veredicto, y se pueden ocultar en la leyenda. Milei y Bukele están a propósito: se les suele meter en el mismo saco y en el rombo quedan a 43 puntos, una distancia parecida a la que separa al PP del PSOE (54), pero en ejes distintos: libertades en un caso y economía en el otro. Las otras cinco cubren las cuatro esquinas: Trump cerca de Bukele, Putin y Maduro en el fondo autoritario desde orillas opuestas, Mujica como espejo de Milei (izquierda en economía, arriba en libertades) y Meloni a un paso del PP. Todas se puntúan solo con lo hecho gobernando, con fuente por casilla en `docs/referencias-internacionales-2026-11-01.md`.
- Otros partidos que se presentan pero no están en el test porque solo concurren en sus comunidades: ERC, Junts, PNV, EH Bildu, BNG, Coalición Canaria. En Navarra UPN y PP van juntos en una coalición encabezada por UPN. Ver tareas pendientes. Las candidaturas se proclaman el 2 de noviembre y se publican en el BOE el 3; hasta entonces son candidaturas presentadas.

### Datos de las elecciones (para textos de la web)

- Fecha: **domingo 29 de noviembre de 2026**, de 9:00 a 20:00.
- Campaña: del 13 al 27 de noviembre. Jornada de reflexión: 28 de noviembre.
- **Prohibición de publicar encuestas: del 24 al 28 de noviembre** (cinco días antes de la votación).
- Convocadas por Pedro Sánchez el 5 de octubre de 2026 tras perder en el Congreso los decretos de vivienda.
- Barcelona elige 32 diputados y Madrid 38.

---

## Preguntas del test

Respuestas de los partidos en el orden: PP, PSOE, Vox, Frente Amplio, Podemos, SALF, D21 + Cs, Milei, Bukele, Trump, Putin, Maduro, Mujica, Meloni. Valores de −2 a +2. El punto (·) es «sin dato»: no cuenta en la posición ni en la afinidad.

Las afirmaciones se redactan de la forma más general posible, como principios y no como medidas concretas de un partido, para que el test mida ideas y no eslóganes.

### Economía (20)

| id | Afirmación | dir | Respuestas |
|---|---|:-:|---|
| e_irpf | Hay que bajar el impuesto sobre la renta aunque el Estado recaude menos. | +1 | 2, −1, 2, −2, −2, 2, 1, 0, 1, 2, 0, −2, −2, 2 |
| e_suc | Deberían suprimirse los impuestos de sucesiones y de patrimonio. | +1 | 2, −2, 2, −2, −2, 2, 1, 2, ·, 2, 2, −2, −1, 1 |
| e_alq | El Estado debe poner topes al precio del alquiler. | −1 | −2, 2, −2, 2, 2, −2, 1, −2, ·, −1, ·, 2, −1, −1 |
| e_empv | Hay que crear una gran empresa pública estatal de vivienda y suelo. | −1 | −1, 2, −1, 2, 1, −1, 0, −2, 1, −2, 1, 2, 1, −1 |
| e_acum | Quien acumula muchas viviendas debería pagar cada año un impuesto especial alto. | −1 | −2, 1, −2, 2, 2, −1, −1, −2, ·, 0, ·, 1, 1, −1 |
| e_suelo | Hay que liberalizar suelo y reducir trámites para que se construya más. | +1 | 2, 1, 2, −1, −2, 2, 1, 2, 1, 2, 1, −1, 1, 1 |
| e_pens | Las pensiones deben subir cada año con la inflación, por ley y pase lo que pase. | −1 | 2, 2, −1, 2, 2, 0, 0, 0, 0, 1, 1, −2, 1, −1 |
| e_mixto | El sistema de pensiones debería ser mixto, con una parte de capitalización privada. | +1 | 0, −2, 2, −2, −2, ·, 0, 1, 1, −1, 0, −2, 0, 1 |
| e_func | Hay que reducir ministerios, organismos y empleo público. | +1 | 1, −1, 2, −2, −2, 2, 1, 2, 2, 2, 0, −1, −2, −1 |
| e_fort | Las grandes fortunas y las grandes empresas deberían pagar más impuestos. | −1 | −2, 2, −2, 2, 2, −2, 0, −2, −1, −2, 1, 2, 2, 0 |
| e_expr | El Estado debería poder expropiar viviendas o nacionalizar empresas estratégicas. | −1 | −2, −1, −2, 2, 2, −1, −2, −2, −1, 0, 2, 1, 0, 0 |
| e_sani | Sanidad y educación deben ser públicas y gratuitas para todos, pagadas con impuestos. | −1 | 1, 2, 1, 2, 2, 0, 1, −1, 1, −2, 1, 1, 2, 0 |
| e_aval | El Estado debe avalar con dinero público las hipotecas de los jóvenes. | −1 | 2, 2, 0, −1, −2, ·, 0, −2, 1, 1, 1, 1, 1, 2 |
| e_gasto | El gasto público debería reducirse de forma significativa. | +1 | 0, −1, 2, −2, −2, 2, 0, 2, 1, 0, −2, −2, −2, 0 |
| e_smi | El Gobierno debe seguir subiendo el salario mínimo por ley. | −1 | 1, 2, −1, 2, 2, ·, 0, −1, 1, −2, 2, 0, 2, −2 |
| e_aran | Hay que proteger al campo y a la industria nacional con aranceles o límites a las importaciones. | −1 | −1, −1, 1, 1, 1, 1, −1, −2, −1, 2, 2, 0, −1, 0 |
| e_desp | Hay que facilitar a las empresas contratar y despedir, con menos restricciones e indemnizaciones más bajas. | +1 | 1, −2, 2, −2, −2, ·, 1, 2, ·, 1, 0, −2, −2, 1 |
| e_jorn | La jornada laboral debe reducirse por ley sin bajar el sueldo. | −1 | −1, 2, −2, 2, 2, ·, ·, −2, 0, ·, −1, ·, 1, −2 |
| e_ecol | Hay que imponer impuestos y normas ambientales estrictas a empresas y consumidores aunque frenen la economía. | −1 | −1, 1, −2, 2, 2, −2, 0, −2, −2, −2, −2, −2, 0, −2 |
| e_okupa | Hay que poder desalojar en pocos días a quien ocupa una vivienda sin permiso. | +1 | 2, −1, 2, −2, −2, 2, 2, 2, ·, ·, ·, −2, ·, 2 |

### Libertades (27)

| id | Afirmación | dir | Respuestas |
|---|---|:-:|---|
| p_expul | Hay que expulsar de forma masiva a los inmigrantes en situación irregular. | −1 | 0, −2, 2, −2, −2, 2, −1, 1, 1, 2, 2, 1, −2, 1 |
| p_prior | Las ayudas públicas deben dar prioridad a los ciudadanos del país frente a los extranjeros con residencia legal. | −1 | 0, −2, 2, −2, −2, 1, −1, 2, ·, 2, 2, ·, −1, 1 |
| p_poli | La policía debería tener más margen para identificar, registrar y multar a personas sin pasar por un juez. | −1 | 2, −1, 2, −2, −2, ·, 1, 2, 2, 2, 2, 2, 0, 2 |
| p_perp | La prisión permanente revisable debería mantenerse o ampliarse a más delitos. | −1 | 2, −1, 2, −2, −2, 1, 1, 2, 2, 2, 2, ·, −1, 2 |
| p_odio | El Estado debe poder sancionar o expulsar a quien difunda discursos de odio, aunque no inciten a la violencia. | −1 | 1, 1, −1, 1, 2, −2, 0, 0, 2, 1, 2, 2, ·, −1 |
| p_simb | Ofender a la bandera, a la Corona o a los sentimientos religiosos debería seguir siendo delito. | −1 | 2, −2, 2, −2, −2, ·, 1, 1, ·, 2, 2, 2, ·, · |
| p_prot | Hay que limitar más las protestas que cortan calles o carreteras. | −1 | 1, −1, 1, −2, −2, −1, 1, 2, 2, 2, 2, 2, ·, 2 |
| p_euta | La eutanasia debe seguir siendo legal. | +1 | 0, 2, −2, 2, 2, ·, 2, −1, −2, ·, −2, ·, ·, −1 |
| p_matr | El matrimonio entre personas del mismo sexo debe seguir siendo legal. | +1 | 1, 2, −1, 2, 2, 1, 2, 1, −2, 1, −2, −1, 2, −2 |
| p_abor | El aborto debe seguir siendo legal en los plazos actuales. | +1 | 0, 2, −2, 2, 2, −1, 1, −2, −2, −1, 0, −1, 2, −1 |
| p_cann | El cannabis para adultos debería ser legal y estar regulado. | +1 | −2, −1, −2, 1, 2, ·, 1, −1, −2, 0, −2, ·, 2, −2 |
| p_prost | Hay que prohibir la prostitución y castigar también al cliente. | −1 | 0, 2, 0, −1, 0, ·, −1, ·, ·, 1, 1, ·, −1, · |
| p_medio | El Gobierno debe poder regular a los medios de comunicación para combatir la desinformación. | −1 | −2, 2, −1, 2, 1, −2, ·, 0, 2, 1, 2, 2, 1, 1 |
| p_ident | Para entrar en webs de contenido adulto debería exigirse verificar la identidad. | −1 | 2, 2, 0, 1, 0, −1, ·, ·, ·, ·, 1, ·, ·, 2 |
| p_taba | Hay que ampliar la prohibición de fumar y vapear a terrazas y espacios abiertos. | −1 | 0, 2, −1, 2, ·, ·, ·, −1, ·, ·, 2, ·, 1, 0 |
| p_anon | Habría que acabar con el anonimato en las redes sociales. | −1 | 1, 2, −1, ·, ·, −1, ·, ·, ·, ·, 2, 2, ·, · |
| p_burka | Debería prohibirse el burka y el niqab en los espacios públicos. | −1 | 2, −1, 2, −2, −2, ·, 1, ·, ·, ·, 0, ·, ·, 1 |
| p_ileg | Habría que ilegalizar los partidos que defienden la independencia de una región. | −1 | −1, −2, 2, −2, −2, ·, −1, ·, 0, ·, 2, 2, ·, · |
| p_decr | El Gobierno debería poder legislar por decreto cuando el Parlamento bloquea sus reformas. | −1 | −1, 1, −1, 0, 0, ·, −1, 2, 2, 2, 2, 2, −1, 2 |
| p_chat | Las aplicaciones de mensajería deberían escanear los mensajes privados para detectar delitos. | −1 | 1, 2, −2, −1, −1, 0, −1, 1, 2, ·, 2, 1, 0, −1 |
| p_trans | Las personas deben poder cambiar su sexo legal sin informes médicos. | +1 | −2, 2, −2, 2, 2, −1, −1, −1, −2, −2, −2, −1, ·, −1 |
| p_mili | Debería recuperarse el servicio militar obligatorio. | −1 | −1, −2, 1, −2, −2, ·, ·, ·, ·, ·, 2, 1, ·, −1 |
| p_armas | Debería ser más fácil para un particular tener un arma en casa para defenderse. | +1 | −1, −2, 2, −2, −2, ·, −2, 1, 1, 2, −2, −2, −2, · |
| p_relig | La religión debería tener más presencia en la escuela y en la vida pública. | −1 | 1, −1, 1, −2, −2, ·, −1, ·, 1, 2, 2, ·, −1, 1 |
| p_toros | Habría que prohibir las corridas de toros. | −1 | −2, −1, −2, 1, 2, 0, −1, ·, ·, ·, ·, ·, ·, · |
| p_menores | Hay que prohibir por ley que los menores de 16 años tengan cuentas en redes sociales. | −1 | 2, 2, −1, 1, 0, −1, ·, ·, ·, ·, ·, ·, ·, · |
| p_apuestas | Hay que prohibir la publicidad de las apuestas y del juego online. | −1 | 0, 1, −1, 1, 1, ·, 1, −2, ·, ·, 1, ·, ·, 0 |

### Contexto que justifica algunas respuestas

Resumen de lo investigado (octubre de 2026). Sirve para revisar y documentar cada respuesta con su fuente (ver tareas pendientes).

- **PP**: promete deflactar el IRPF, duplicar el mínimo por hijos, IVA 0 % en alimentos básicos, eximir de IVA a autónomos que facturen menos de 85.000 €, construir un millón de viviendas, suprimir las zonas tensionadas, ley antiocupación, avales públicos de hasta el 100 % para la primera vivienda de jóvenes, prohibir por ley las regularizaciones colectivas de inmigrantes y **mantener la revalorización de las pensiones con el IPC**.
- **PSOE**: mantener y reforzar los decretos de vivienda (topes al alquiler), crear una gran empresa pública de vivienda y suelo, impuesto de hasta el 100 % sobre la compra de vivienda por no residentes extracomunitarios, impuesto a grandes fortunas, pensiones con IPC cuatro años más, jornada de 36 horas en 2030. Sánchez propuso en 2025 acabar con el anonimato en redes.
- **Vox**: IRPF con mínimo exento de 22.000 € y tipos del 15 % y 25 %, supresión de patrimonio y sucesiones, desregulación, liberalizar suelo, sistema de pensiones mixto (fue el único grupo que votó contra la revalorización de 2026), "prioridad nacional" y "remigración" de inmigrantes ilegales y de legales que delincan o vivan de ayudas, recentralización.
- **Frente Amplio**: impuesto anual del 10 % sobre el valor de cada vivienda para empresas desde la primera y para particulares desde la cuarta (si su valor conjunto supera 800.000 €), salvo alquiler asequible; invertir el 1 % del PIB al año en vivienda pública; renovación automática de alquileres.
- **Podemos**: Irene Montero y Gabriel Rufián (ERC) han defendido expropiar o nacionalizar, a diferencia del PSOE.
- **SALF**: IRPF del 0 % para rentas bajo 35.000 €, supresión de sucesiones, reducir el Estado, cinco puntos menos de IRPF por hijo, deportaciones de inmigrantes irregulares, mano dura penal. Alvise ha llamado "estafa piramidal" al sistema de pensiones sin detallar reforma.
- **Democracia 21 + Cs**: liberal en economía e instituciones pero partidario de mantener un Estado del bienestar fuerte; bajar presión fiscal sin recortar servicios; regeneración institucional (90 % menos de asesores, límite de mandatos, jueces eligiendo a los vocales del CGPJ); liberal en derechos civiles.
- **Milei (lo aplicado)**: más de 17.600 artículos desregulados, Ley de Bases (privatizaciones, RIGI), superávit fiscal, derogación de la ley de alquileres; pero restableció el Impuesto a las Ganancias para asalariados, bajó la edad penal, gobierna mucho por decreto y firmó el DNU 681/2026 para expulsar a extranjeros por "mensajes de odio". No ha tocado aborto ni matrimonio igualitario.
- **Bukele (lo aplicado)**: cadena perpetua introducida en la Constitución en marzo de 2026 y extendida a menores desde los 12 años en abril; régimen de excepción desde marzo de 2022 que suspende libertad de asociación, privacidad de las comunicaciones y garantías del debido proceso (más de 86.000 detenciones, miles arbitrarias según ONG, cientos de muertes bajo custodia); reelección indefinida y mandato de seis años; ley de agentes extranjeros que grava las donaciones del exterior a ONG; reforma de la Ley Bitcoin en enero de 2025, exigida por el FMI, que convierte en voluntaria su aceptación y retira al Estado del negocio.
- **Trump (lo aplicado)**: recortes de impuestos de 2017 y 2025 con déficit récord, aranceles generalizados, DOGE y recorte de Medicaid; deportaciones masivas, Guardia Nacional contra protestas, pena de muerte, órdenes ejecutivas en serie, restricciones a personas trans, armas y religión en la escuela.
- **Putin (lo aplicado)**: sin impuesto de sucesiones, nacionalizaciones desde 2022, aranceles y gasto militar récord; represión total de prensa, protesta y oposición, ley Yarovaya, prohibición del cambio de sexo legal, mili obligatoria, religión en la escuela.
- **Maduro (lo aplicado)**: controles de precios y alquileres, expropiaciones, inamovilidad laboral, hiperinflación; Ley contra el Odio, FAES, represión de 2014, 2017 y 2024, intervención judicial de los partidos, estado de excepción permanente, bloqueo de X, desarme civil.
- **Mujica (lo aplicado, 2010-2015)**: subida del IRPF alto, salario mínimo doblado, gasto y empleo público al alza, cárcel al empresario que incumpla seguridad; cannabis regulado, aborto y matrimonio igualitario legalizados, inmigración abierta, contra las armas y la mano dura; con una ley de medios y el sistema de escuchas El Guardián en el debe.
- **Meloni (lo aplicado)**: rebajas del IRPEF, no al salario mínimo y a la semana de 32 horas, aval público a hipotecas de jóvenes, delito de ocupación; decreto de seguridad de 2025 (policía, bloqueos de carretera, cannabis light), verificación de edad para porno, centros en Albania, contra el matrimonio igualitario y la gestación subrogada, aborto sin tocar.

---

## Fuentes

Fuentes consultadas para estimar las posiciones (a 31 de octubre de 2026):

- [Qué Proponen](https://queproponen.es/)
- [DatosClaros – Comparador de programas 29N](https://www.datosclaros.es/comparador-de-programas-29n/)
- [Política Electoral – Generales 2026](https://www.politicaelectoral.com/es/espana/generales-2026/nacional)
- [eleccionesEspaña.com – Partidos del 29N](https://xn--eleccionesespaa-crb.com/partidos)
- [Afinidad Política – Generales 29N](https://www.afinidadpolitica.es/elecciones-generales-29n)
- [Wikipedia – Elecciones generales de España de 2026](https://es.wikipedia.org/wiki/Elecciones_generales_de_Espa%C3%B1a_de_2026)
- [La Moncloa – Guía básica 29N](https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/interior/paginas/guia-dudas-elecciones-generales-29n.aspx)
- [Economipedia – Diagrama de Nolan](https://economipedia.com/definiciones/diagrama-de-nolan.html)
- Prensa: El Debate, elDiario.es, Infobae/EFE, Demócrata, El Español, La Nación (Argentina), Chequeado, Revista SUMMA, Expansión.

---

## Decisiones tomadas

### 1. No se guarda ningún dato

Se valoró guardar las posiciones de los usuarios que quisieran publicarlas para mostrar un **mapa de calor**. Se descartó por tres motivos:

- **No se puede garantizar que los votos no estén adulterados.** El *fingerprint* del navegador es poco fiable y en Europa requiere consentimiento; la verificación por correo tiene coste (el plan gratuito de Resend permite 100 correos al día), hunde la participación y cualquiera puede tener varias direcciones. Un mapa de calor de gente que entra voluntariamente tampoco sería nunca una muestra representativa.
- **Protección de datos.** Las opiniones políticas son una **categoría especial de datos** según el artículo 9 del RGPD. Guardarlas junto a un email obligaría a consentimiento explícito, política de privacidad, registro de tratamientos, etc.
- **Ley electoral.** La LOREG prohíbe publicar sondeos en los cinco días previos a la votación. Un mapa de calor con afinidad a partidos se parecería demasiado a uno.

Por tanto: **sin base de datos, sin backend, sin cookies, sin cuentas**. Las respuestas solo se guardan en el `localStorage` del propio usuario para que no las pierda al recargar.

> Si en el futuro se quisiera recuperar la idea, el diseño recomendado era: Cloudflare Worker + D1 guardando **solo contadores por celda** de una cuadrícula (por ejemplo 25 × 25), nunca filas por persona; recalcular la posición en el servidor a partir de las respuestas (no aceptar coordenadas del cliente); Turnstile contra bots; y, si se añadiera verificación por email, guardar solo un HMAC del correo en una tabla separada sin ninguna relación con el voto ni marcas de tiempo. Requiere validación legal previa.

### 2. Compartir en redes en lugar de guardar

La viralidad se busca con una **imagen generada en el navegador** que el usuario comparte (ver tareas pendientes). Ningún dato pasa por un servidor.

### 3. Hosting en Cloudflare, código en GitHub

- El repositorio vive en GitHub y **Cloudflare despliega automáticamente** en cada push a `main`.
- Se prefiere Cloudflare a GitHub Pages porque las peticiones a archivos estáticos son **gratis e ilimitadas**. GitHub Pages tiene un límite blando de 100 GB de tráfico al mes y puede responder con errores 429 o dejar de servir la web si se supera, algo plausible si el test se hace viral.
- Si algún día hace falta lógica de servidor, ya está en la plataforma adecuada (Workers) y en el mismo dominio.
- Se despliega como **Worker con static assets**, que es lo que Cloudflare recomienda hoy para proyectos nuevos en lugar de Pages. La configuración está en `wrangler.jsonc`: sirve la carpeta `public/` sin ningún paso de compilación. Pasos en el panel: Workers & Pages → Create → Import a repository, autorizar GitHub, elegir el repositorio, build command vacío, deploy command `npx wrangler deploy`, root directory vacío, rama `main`. Cada push a `main` despliega. Después, en el Worker, Settings → Domains & Routes para añadir `testnolan.com`.
- Solo se publica `public/`. El README, la documentación de `docs/` y `commit-message.txt` quedan fuera.
- `public/_redirects` manda la raíz a `/es/` y `public/_headers` añade cabeceras de seguridad y caché corta para el HTML y larga para la imagen de Open Graph.
- Para probar en local: `cd public && python3 -m http.server 8000 --bind 0.0.0.0` y abrir `http://IP:8000/es/`. Los `_redirects` y `_headers` solo los aplica Cloudflare; en local hay que entrar directamente en `/es/`.

### 4. Dominio

- **testnolan.com** como dominio principal, con el test en la ruta `/es/`.
- **testnolan.es** comprado también y redirigiendo (301) a `testnolan.com/es`.
- Se descartaron un subdominio de menetray.com (poco memorable y mezcla la marca profesional con política) y nombres con fecha como "29n" (caducan tras las elecciones). También se valoró *votonolan.es*, descartado porque "voto" sugiere que allí se vota o que es una encuesta.
- El crédito al autor va en el pie: "Hecho por Robert Menetray" con enlace a https://menetray.com.

### 5. Repositorio público

- Al ser una web estática, el código y las respuestas de los partidos ya son visibles para cualquiera desde el navegador; hacerlo privado no protege nada.
- Hacerlo público da **credibilidad** frente a acusaciones de sesgo ("las respuestas están en GitHub, revísalas"), permite recibir correcciones con fuente y sirve como pieza de portafolio.

### 6. Sin redirecciones por IP ni idioma

- Un enlace compartido tiene que abrir siempre la misma página, sin que la IP o el idioma del navegador cambien nada.

---

## Tareas pendientes

### Refactorización del código

- [ ] Separar el archivo único en `index.html`, `styles.css`, `app.js` y un fichero de datos (`data/es-2026.json`).
- [ ] Validación del fichero de datos al cargar o en CI: cada array de respuestas tiene tantos valores como partidos, todos los valores están entre −2 y +2, `dir` es +1 o −1, los `id` son únicos, cada eje tiene al menos 10 preguntas.
- [ ] Tests unitarios deterministas para las funciones puras: puntuación por eje, afinidad, zona y conversión a coordenadas del rombo. Deben reproducir la tabla de posiciones de este README.

### Accesibilidad y calidad

- [ ] Probar en móviles reales (Safari iOS y Chrome Android): la Web Share API con imagen, la descarga del PNG, la copia del enlace y la paginación.
- [ ] Probar la paginación por ámbitos y los atajos de teclado con lector de pantalla.

---

## Registro de cambios de los datos

La versión y la fecha se muestran en la metodología de la web (`DATA_VERSION` y `DATA_DATE` en `index.html`). Cualquier cambio en preguntas o respuestas de partidos debe subir la versión y anotarse aquí.

- **1.6 (01-11-2026)**: cada pregunta lleva un desplegable «¿Por qué responde así cada partido?» con una frase por partido o referencia que cita el hecho concreto (voto, ley, programa o declaración) que sostiene su posición, y un enlace a la fuente cuando la hay: 658 frases, 14 por pregunta, guardadas en un bloque JSON dentro de `index.html` que solo se lee al abrir el desplegable. Al redactarlas se detectaron 24 casillas cuyo valor no se sostenía y se corrigen: Vox en contra de subir el salario mínimo y menos contrario a la vivienda pública (Garriga prometió vivienda social masiva), Podemos a favor y no muy a favor en empresa pública y publicidad del juego, seis casillas de SALF que eran inferencias sin hecho (expropiar, empresa pública, grandes tenedores, anonimato y ley trans pasan a en contra, avales a sin dato), D21 + Cs con aranceles, jornada, identidad en webs y tabaco ajustados y okupas a muy a favor por las 48 horas de Ciudadanos, Frente Amplio menos tajante en discursos de odio y sin dato en anonimato, Bukele contra las nacionalizaciones y sin dato en despido, con la religión en a favor, y Milei neutral en IRPF por haber restituido Ganancias y sin dato en prostitución, anonimato y mili. Posiciones: PP 70/37, PSOE 19/54, Vox 86/38, Frente Amplio 6/69, Podemos 8/73, SALF 83/55, D21 + Cs 62/56, Milei 91/32, Bukele 62/11, Trump 71/20, Putin 40/7, Maduro 24/10, Mujica 28/66, Meloni 69/26. Detalle en `docs/justificaciones-2026-11-01.md`.
- **1.5 (01-11-2026)**: cinco referencias internacionales más, puntuadas con el mismo criterio que Milei y Bukele (solo lo hecho gobernando, con fuente por casilla, «sin dato» donde no aplica): Trump 71/20, Putin 40/7, Maduro 24/10, Mujica 28/66 y Meloni 69/26. Con ellas el rombo tiene referencias en las cuatro esquinas. La leyenda las agrupa como «Referencias» con un botón para ocultarlas o mostrarlas todas, y las ocultas tampoco salen en la lista de afinidad. La imagen genérica de portada sigue mostrando solo a los partidos del 29N más Milei y Bukele; la imagen del resultado propio muestra las referencias que el usuario tenga visibles. Detalle y fuentes en `docs/referencias-internacionales-2026-11-01.md`.
- **1.4 (01-11-2026)**: segunda pasada del eje de libertades. (1) Nueva regla: `null` = **sin dato**, no cuenta en la posición ni en la afinidad y la web lo muestra bajo cada pregunta. Se aplica a 44 casillas sin ninguna evidencia tras buscarla una a una: SALF (17), Bukele (15), Milei (6), D21 + Cs (4) y Podemos (2). (2) Dos afirmaciones clásicas de libertad personal en las que la derecha puntúa libertaria: armas en casa para defenderse (voto de 2022, 289 a 53) y prohibir las corridas de toros (ILP de octubre de 2025). 47 afirmaciones (20 de economía y 27 de libertades). (3) Siete correcciones con fuente: SALF «ferviente provida» con votos propios en el Parlamento Europeo y sin oponerse al matrimonio igualitario; Milei muy a favor de la prioridad nacional (cobro a extranjeros en hospitales y universidades), ley trans y tabaco suavizados; Bukele a favor de bajar impuestos y neutral en jornada. Posiciones recalculadas: PP 70/37, PSOE 19/54, Vox 86/38, Frente Amplio 6/68, Podemos 6/72, SALF 84/55, D21 + Cs 61/54 (Centro), Milei 93/38, Bukele 61/9. `HASH_VERSION` 3. Detalle en `docs/revision-libertades-2026-11-01.md`, secciones 6 a 9.
- **1.3 (01-11-2026)**: revisión del eje de libertades tras detectar que dos afirmaciones no discriminaban entre partidos (detener sin orden judicial y vigilar comunicaciones sin juez: casi todos en «muy en contra», y además la detención sin orden ya es legal en España hasta 72 horas). Se sustituyen por cuatro debates reales de esta legislatura: más poder a la policía (Ley de Seguridad Ciudadana), prisión permanente revisable, ofensas a la bandera, la Corona o la religión, y escaneo de mensajes privados (Chat Control). 45 afirmaciones (20 de economía y 25 de libertades). 27 casillas corregidas con fuente: PP a favor de sancionar discursos de odio (aprobó el artículo 510.2 en 2015), de más religión en la escuela y muy en contra de regular medios; Vox menos extremo en discursos de odio y medios por sus querellas y vetos a periodistas, y a favor de la mili; D21 + Cs hacia el centro (Cs presentó una ley contra el burka, votó por ilegalizar partidos independentistas en Madrid, bloqueó la derogación de la ley mordaza y pedía ampliar la prisión permanente); SALF pierde valores sin evidencia en eutanasia, aborto, religión y decretos, y pasa a estar en contra de limitar las protestas por alentar las tractoradas; Milei neutral en odio y medios por evidencia contradictoria; Bukele muy en contra de la eutanasia y neutral en prostitución e ilegalizar partidos. Posiciones recalculadas: PP 70/35, PSOE 19/55, Vox 86/33, Frente Amplio 6/72, Podemos 6/75, SALF 83/54, D21 + Cs 61/55 (Centro), Milei 93/41, Bukele 61/23. Cambia la versión del enlace de comparación (`HASH_VERSION` 2), así que los enlaces anteriores dejan de leerse. Detalle en `docs/revision-libertades-2026-11-01.md`.
- **1.2 (01-11-2026)**: verificación completa con fuentes públicas (cinco revisiones en paralelo: historia del test, datos legales y electorales, economía, libertades, y Milei y Bukele). 71 respuestas corregidas, entre ellas 11 cambios de signo o de dos puntos: Podemos y Frente Amplio contra los avales a hipotecas; PP a favor de prohibir el burka y de prohibir las redes a menores de 16, y en contra de la autodeterminación de género; Vox contra prohibir las redes a menores; Frente Amplio contra la ley abolicionista de la prostitución; Milei contra los discursos de odio (cerró el INADI) y neutral en detención sin juez (Ley Antimafias); Bukele a favor del sistema mixto de pensiones. Contextos corregidos: eutanasia (supuestos legales), cannabis (Alemania sin venta), prostitución (Suecia y Francia castigan al cliente, no a quien vende), mili (suspendida, no suprimida), redes y menores (ley francesa anulada, ley española decaída), decreto (el Parlamento vota después), ilegalización de partidos, sucesiones (impuesto a grandes fortunas). SALF concurre en casi todas las provincias. Historia del test: 1969, The Individualist, Advocates for Self-Government, más de 28 millones de pasadas. Posiciones recalculadas: PP 70/49, PSOE 19/58, Vox 86/42, Frente Amplio 6/71, Podemos 6/74, SALF 83/50, D21 + Cs 60/72, Milei 93/49, Bukele 61/22. Detalle en `docs/verificacion-2026-11-01.md`.
- **1.1 (31-10-2026)**: 10 afirmaciones nuevas (4 de economía, 6 de libertades); contexto y etiqueta corta en todas; cuatro afirmaciones redactadas de forma más genérica (impuesto sobre la renta, inflación, gasto público sin la cifra del PIB, «ciudadanos del país»). Posiciones recalculadas: PP 66/54, PSOE 20/59, Vox 80/37, Frente Amplio 5/66, Podemos 4/72, SALF 81/47, D21 + Cs 56/74, Milei 93/54, Bukele 55/15.
- **1.0 (31-10-2026)**: primera versión con 33 afirmaciones (16 de economía y 17 de libertades) y 7 partidos más 2 referencias.

---

## Estructura de archivos

```
/
├── README.md
├── LICENSE                  # MIT, para el código
├── LICENSE-DATA             # CC BY 4.0, para las preguntas, las posiciones y sus justificaciones
├── commit-message.txt       # borrador del siguiente mensaje de commit (no se despliega)
├── wrangler.jsonc           # configuración de Cloudflare Workers con static assets
├── docs/                    # verificaciones de datos con fuentes (no se despliegan)
└── public/                  # lo único que sirve Cloudflare
    ├── _redirects           # / → /es/ (302), /index.html y /es/index.html → /es/ (301)
    ├── _headers             # cabeceras de seguridad y caché
    ├── 404.html             # página de error
    ├── robots.txt
    ├── og-image.png         # imagen fija para Open Graph (https://testnolan.com/og-image.png)
    └── es/
        └── index.html       # el test completo, un solo archivo
```

Previsto para más adelante: `CONTRIBUTING.md`, una plantilla de issue para proponer correcciones con fuente y separar `assets/` y `data/` si el archivo único se divide.

---

## Limitaciones y advertencias

- **Las respuestas de los partidos son estimaciones**, no posiciones oficiales. Se basan en anuncios de precampaña, votaciones y declaraciones hasta el 31 de octubre de 2026.
- **El resultado depende del cuestionario.** Con otras preguntas los puntos se moverían. Por ejemplo, en la versión 1.2 el PP salía en el centro, a un punto de la zona libertaria, y D21 + Cs en la zona libertaria, porque dos afirmaciones de seguridad tenían a casi todos los partidos en «muy en contra» y subían a todos. Al sustituirlas por debates reales (ley mordaza, prisión permanente, ofensas a símbolos, Chat Control), añadir armas y toros y dejar sin dato lo que no tiene fuente, el PP y Vox bajaron unos doce puntos, D21 + Cs pasó al centro y Bukele a la esquina autoritaria. Por eso el equilibrio de las preguntas importa tanto como las respuestas: una afirmación en la que todos coinciden no mide nada.
- **Las referencias internacionales** (Milei, Bukele, Trump, Putin, Maduro, Mujica y Meloni) se puntúan solo con lo que han hecho como gobernantes. Las afirmaciones que son debates españoles sin equivalente en Argentina o El Salvador quedan «sin dato» y no cuentan, así que su posición se calcula sobre menos preguntas y es más extrema.
- **El modelo de Nolan simplifica**: reduce la política a dos ejes y deja fuera, entre otros, el eje territorial, que en España es muy relevante.
- El test **no es una encuesta** ni pretende representar a la población.

---

## Cómo contribuir

Las correcciones son bienvenidas, sobre todo en las respuestas de los partidos. Para que se acepten:

1. Abre un issue en [github.com/trebormc/testnolan/issues](https://github.com/trebormc/testnolan/issues) (la plantilla "Corrección de posición" está prevista, de momento en texto libre).
2. Indica el partido, la pregunta (`id`), la respuesta actual, la que propones y **al menos una fuente** verificable (programa, votación en el Congreso, declaración pública con fecha).
3. Los cambios deben respetar los [criterios de clasificación](#criterios-de-clasificación).

No se aceptan cambios sin fuente ni discusiones de opinión política en los issues.

---

## Licencia

- **Código** (HTML, CSS, JavaScript): [MIT](LICENSE).
- **Datos** (afirmaciones, contextos, posiciones de cada partido y referencia, frases de justificación con sus fuentes y documentos de `docs/`): [CC BY 4.0](LICENSE-DATA), que permite reutilizarlos con cualquier fin citando la fuente: «Datos de testnolan.com, Robert Menetray, CC BY 4.0».

© 2026 Robert Menetray · [menetray.com](https://menetray.com)