# Test Nolan

Test político interactivo que sitúa al usuario y a los partidos en el **diagrama de Nolan** a partir de un mismo cuestionario. La primera versión está centrada en las **elecciones generales de España del 29 de noviembre de 2026**.

- Dominio principal: **testnolan.com** (con **testnolan.es** redirigiendo a la versión española).
- Tecnología: una página estática (HTML + CSS + JavaScript, sin dependencias ni backend).
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
- A medio plazo, poder reutilizar la herramienta en otras elecciones (municipales y autonómicas de 2027, generales andorranas, catalanas) cargando un nuevo conjunto de datos.

El test **no recomienda votar a nadie**. Muestra afinidad con las posiciones estimadas de cada partido y deja la decisión al usuario.

---

## Estado actual

Existe un prototipo funcional en un único archivo, `index.html`, con todo el CSS y el JavaScript incrustados, más `og-image.png` (imagen fija para Open Graph). Incluye:

- Rombo de Nolan dibujado en SVG con las cinco zonas, la línea media discontinua y los ejes rotulados.
- **33 afirmaciones** (16 de economía y 17 de libertades) con escala de 5 puntos.
- Posición de cada partido calculada a partir de sus respuestas, con el mismo cálculo que el usuario.
- Punto **"Tú"** que se mueve en el rombo según se responde.
- Ranking de **afinidad por respuestas** con cada partido.
- En cada pregunta, un desplegable para ver **qué responde cada partido**.
- Leyenda para mostrar u ocultar partidos.
- Filtros por bloque (todas, economía, libertades), contador de progreso y botón para borrar respuestas (con confirmación en dos pulsaciones).
- Sección de metodología con tabla de puntuaciones y fuentes.
- Tema claro y oscuro, diseño adaptado a móvil.
- Persistencia de respuestas solo en el navegador del usuario (`localStorage`, clave `testnolan-es-2026`, con `try/catch`). Nada sale del dispositivo.
- Esqueleto HTML completo (`lang="es"`, `charset`, `viewport`), título y descripción orientados a buscar «test de Nolan elecciones generales España 29N», etiquetas Open Graph y Twitter Card, `canonical` a `https://testnolan.com/es/` y datos estructurados JSON-LD.
- Botón **«Compartir mi resultado»**: genera en un `<canvas>` una imagen de 1200 × 630 con el rombo, los partidos, el punto del usuario, su zona, sus dos puntuaciones, el partido más afín y la URL testnolan.com. En móvil usa la Web Share API con archivo; si no está disponible, descarga el PNG y muestra enlaces a X, Facebook, WhatsApp y Telegram con el texto ya escrito. La constante `SHARE_SHOW_TOP_PARTY` permite ocultar el partido más afín de la imagen durante el periodo de prohibición de encuestas.
- **Enlace para comparar** (`#r=…`): codifica las respuestas en el *hash* de la URL, que nunca llega al servidor. Quien lo abre ve el punto de la otra persona como «Amigo» junto al suyo, con su zona y puntuaciones, y puede quitarlo. Formato: `1` (versión) + una cifra por pregunta en el orden de `QUESTIONS` (`0`–`4` para −2…+2, `_` si no se respondió).
- Modo `?og=1` que muestra solo la imagen genérica de 1200 × 630 (sin usuario, tema claro) para capturarla como `og-image.png`, y `?og=user` para previsualizar la imagen del resultado propio.
- Metodología ampliada: nota de circunscripciones (D21 + Cs solo en Madrid y Barcelona; SALF solo en algunas provincias), críticas al modelo de Nolan y soporte para enlazar la **fuente** de cada respuesta de cada partido (campo opcional `src` por pregunta; aún sin datos).
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

### Afinidad con cada partido

Comparación respuesta a respuesta, solo con las preguntas que ha contestado el usuario:

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

Posiciones calculadas con el cuestionario actual (33 preguntas). Escala de 0 a 100.

| Partido | Candidatura y cabeza de lista | Economía | Libertades | Zona |
|---|---|---:|---:|---|
| PP | Partido Popular · Alberto Núñez Feijóo | 63 | 54 | Centro |
| PSOE | PSOE / PSC · Pedro Sánchez | 22 | 56 | Izquierda |
| Vox | Vox · Santiago Abascal | 78 | 38 | Derecha |
| Frente Amplio | Frente Amplio (antes Sumar) · Ada Colau | 6 | 65 | Izquierda |
| Podemos | Podemos · Irene Montero | 5 | 71 | Izquierda |
| SALF | Se Acabó La Fiesta · Alvise Pérez | 80 | 46 | Derecha |
| D21 + Cs | Democracia para el Siglo 21 (Democracia 21 + Ciudadanos + UCIN) · Miriam González | 55 | 76 | Libertario |
| Milei *(referencia)* | La Libertad Avanza (Argentina) · Javier Milei | 91 | 53 | Libertario |
| Bukele *(referencia)* | Nuevas Ideas (El Salvador) · Nayib Bukele | 48 | 15 | Autoritario |

Notas:

- **D21 + Cs** solo se presenta en las circunscripciones de **Madrid y Barcelona**. **SALF** solo en algunas provincias. Conviene indicarlo en la web.
- **Milei y Bukele** son referencias para comparar, no se votan en España. Varias preguntas son específicas de España y sus respuestas se estiman por analogía. Se muestran en otro color (naranja y rosa).
- Otros partidos que se presentan pero no están en el test porque solo concurren en sus comunidades: ERC, Junts, PNV, EH Bildu, BNG, Coalición Canaria (UPN va integrada en la lista del PP en Navarra). Ver tareas pendientes.

### Datos de las elecciones (para textos de la web)

- Fecha: **domingo 29 de noviembre de 2026**, de 9:00 a 20:00.
- Campaña: del 13 al 27 de noviembre. Jornada de reflexión: 28 de noviembre.
- **Prohibición de publicar encuestas: del 24 al 28 de noviembre** (cinco días antes de la votación).
- Convocadas por Pedro Sánchez el 5 de octubre de 2026 tras perder en el Congreso los decretos de vivienda.
- Barcelona elige 32 diputados y Madrid 38.

---

## Preguntas del test

Respuestas de los partidos en el orden: PP, PSOE, Vox, Frente Amplio, Podemos, SALF, D21 + Cs, Milei, Bukele. Valores de −2 a +2.

Las afirmaciones se redactan de la forma más general posible, para que el mismo cuestionario sirva en cualquier país; lo que cambia en cada elección es la respuesta de los partidos.

### Economía (16)

| id | Afirmación | dir | Respuestas |
|---|---|:-:|---|
| e_irpf | Hay que bajar el impuesto sobre la renta aunque el Estado recaude menos. | +1 | 2, −1, 2, −2, −2, 2, 1, 1, 0 |
| e_suc | Deberían suprimirse los impuestos de sucesiones y de patrimonio. | +1 | 1, −2, 2, −2, −2, 2, 0, 1, 0 |
| e_alq | El Estado debe poner topes al precio del alquiler. | −1 | −2, 2, −2, 2, 2, −2, 0, −2, 0 |
| e_empv | Hay que crear una gran empresa pública estatal de vivienda y suelo. | −1 | −1, 2, −2, 2, 2, −2, 0, −2, 0 |
| e_acum | Quien acumula muchas viviendas debería pagar cada año un impuesto especial alto. | −1 | −2, 1, −2, 2, 2, −2, −1, −2, −1 |
| e_suelo | Hay que liberalizar suelo y reducir trámites para que se construya más. | +1 | 2, 1, 2, −1, −2, 2, 1, 2, 1 |
| e_pens | Las pensiones deben subir cada año con la inflación, por ley y pase lo que pase. | −1 | 2, 2, −1, 2, 2, 0, 1, −1, 0 |
| e_mixto | El sistema de pensiones debería ser mixto, con una parte de capitalización privada. | +1 | 0, −1, 2, −2, −2, 1, 0, 1, −1 |
| e_func | Hay que reducir ministerios, organismos y empleo público. | +1 | 1, −1, 2, −2, −2, 2, 1, 2, 1 |
| e_fort | Las grandes fortunas y las grandes empresas deberían pagar más impuestos. | −1 | −1, 2, −2, 2, 2, −2, 0, −2, 0 |
| e_expr | El Estado debería poder expropiar viviendas o nacionalizar empresas estratégicas. | −1 | −2, −2, −2, 1, 2, −2, −2, −2, 0 |
| e_sani | Sanidad y educación deben ser públicas y gratuitas para todos, pagadas con impuestos. | −1 | 2, 2, 1, 2, 2, 1, 2, −1, 1 |
| e_aval | El Estado debe avalar con dinero público las hipotecas de los jóvenes. | −1 | 2, 2, 1, 1, 0, 1, 1, −2, 1 |
| e_gasto | El gasto público debería reducirse de forma significativa. | +1 | 0, −1, 1, −2, −2, 2, 0, 2, 0 |
| e_smi | El Gobierno debe seguir subiendo el salario mínimo por ley. | −1 | 1, 2, 0, 2, 2, −1, 1, −1, 1 |
| e_aran | Hay que proteger al campo y a la industria nacional con aranceles o límites a las importaciones. | −1 | −1, 0, 2, 1, 1, 1, −2, −2, 0 |

### Libertades (17)

| id | Afirmación | dir | Respuestas |
|---|---|:-:|---|
| p_expul | Hay que expulsar de forma masiva a los inmigrantes en situación irregular. | −1 | 0, −2, 2, −2, −2, 2, −2, 1, 2 |
| p_prior | Las ayudas públicas deben dar prioridad a los ciudadanos del país frente a los extranjeros con residencia legal. | −1 | 0, −2, 2, −2, −2, 2, −2, 0, 1 |
| p_deten | En situaciones graves de seguridad, la policía debería poder detener sin orden judicial. | −1 | −2, −2, −1, −2, −2, 0, −2, −2, 2 |
| p_odio | El Estado debe poder sancionar o expulsar a quien difunda discursos de odio, aunque no inciten a la violencia. | −1 | −1, 1, −2, 2, 2, −2, 0, 2, 2 |
| p_prot | Hay que limitar más las protestas que cortan calles o carreteras. | −1 | 1, −1, 1, −2, −2, 1, 0, 2, 2 |
| p_euta | La eutanasia debe seguir siendo legal. | +1 | 0, 2, −2, 2, 2, −1, 2, 0, −1 |
| p_matr | El matrimonio entre personas del mismo sexo debe seguir siendo legal. | +1 | 1, 2, −1, 2, 2, 0, 2, 1, −2 |
| p_abor | El aborto debe seguir siendo legal en los plazos actuales. | +1 | 0, 2, −2, 2, 2, −1, 2, −1, −2 |
| p_cann | El cannabis para adultos debería ser legal y estar regulado. | +1 | −2, −1, −2, 1, 2, −1, 0, 0, −2 |
| p_prost | Hay que prohibir la prostitución y castigar también al cliente. | −1 | 0, 2, 1, 1, 0, 0, −1, −1, 1 |
| p_medio | El Gobierno debe poder regular a los medios de comunicación para combatir la desinformación. | −1 | −1, 1, −2, 2, 2, −2, −1, −1, 2 |
| p_ident | Para entrar en webs de contenido adulto debería exigirse verificar la identidad. | −1 | 1, 2, 1, 1, 1, −1, 0, −1, 1 |
| p_taba | Hay que ampliar la prohibición de fumar y vapear a terrazas y espacios abiertos. | −1 | 0, 2, −2, 2, 1, −2, 1, −2, 0 |
| p_anon | Habría que acabar con el anonimato en las redes sociales. | −1 | 0, 2, −2, 1, 0, −2, 0, −2, 1 |
| p_burka | Debería prohibirse el burka y el niqab en los espacios públicos. | −1 | 0, −1, 2, −2, −2, 2, −1, 0, 0 |
| p_ileg | Habría que ilegalizar los partidos que defienden la independencia de una región. | −1 | −1, −2, 2, −2, −2, 1, −2, 0, 1 |
| p_decr | El Gobierno debería poder legislar por decreto cuando el Parlamento bloquea sus reformas. | −1 | −1, 1, −1, 0, 0, 1, −2, 2, 2 |

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
- **Bukele (lo aplicado)**: régimen de excepción desde marzo de 2022 que suspende libertad de asociación, privacidad de las comunicaciones y garantías del debido proceso (unas 88.000 detenciones, miles arbitrarias según ONG, cientos de muertes bajo custodia); reelección indefinida y mandato de seis años; ley de agentes extranjeros que grava las donaciones del exterior a ONG; retirada del bitcóin como moneda de curso legal para cerrar un acuerdo con el FMI.

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

### 4. Dominio

- **testnolan.com** como dominio principal, porque permite reutilizar el proyecto en varios países con rutas (`/es`, `/cat`, `/ad`…).
- **testnolan.es** comprado también y redirigiendo (301) a `testnolan.com/es`.
- Se descartaron un subdominio de menetray.com (poco memorable y mezcla la marca profesional con política) y nombres con fecha como "29n" (caducan tras las elecciones). También se valoró *votonolan.es*, descartado porque "voto" sugiere que allí se vota o que es una encuesta.
- El crédito al autor va en el pie: "Hecho por Robert Menetray" con enlace a https://menetray.com.

### 5. Repositorio público

- Al ser una web estática, el código y las respuestas de los partidos ya son visibles para cualquiera desde el navegador; hacerlo privado no protege nada.
- Hacerlo público da **credibilidad** frente a acusaciones de sesgo ("las respuestas están en GitHub, revísalas"), permite recibir correcciones con fuente y sirve como pieza de portafolio.

### 6. País y elección por URL, no por IP

- La **URL decide** qué test se muestra. Un enlace compartido tiene que abrir siempre el mismo test.
- La IP o el idioma del navegador solo sirven para **sugerir** otro test ("Parece que estás en Andorra, ¿quieres el test de las elecciones andorranas?"), nunca para redirigir automáticamente.

---

## Tareas pendientes

### Repositorio y despliegue

- [ ] Crear el repositorio público y subir el prototipo actual.
- [ ] Configurar el email de commits con la dirección privada de GitHub (`usuario@users.noreply.github.com`).
- [ ] Añadir `LICENSE` (MIT) para el código y `LICENSE-DATA` (CC BY 4.0) para los datos de partidos y preguntas. Ver [Licencia](#licencia).
- [ ] Conectar el repositorio a Cloudflare (Workers con static assets o Pages) con despliegue automático desde `main`.
- [ ] Configurar el dominio `testnolan.com` en Cloudflare y la redirección 301 de `testnolan.es` a `testnolan.com/es`.
- [ ] Redirigir la raíz `/` a `/es` mientras solo exista el test español (o mostrar una portada con selector).
- [ ] Opcional: Cloudflare Web Analytics, que no usa cookies, para medir visitas sin recoger datos personales.

### Refactorización del código

- [ ] Separar el archivo único en `index.html`, `styles.css`, `app.js` y un fichero de datos por elección (`data/es-2026.json`).
- [ ] Definir el esquema del fichero de datos (elección, fecha, partidos, preguntas, textos) para que añadir otro país sea solo cargar un JSON nuevo.
- [ ] Validación del fichero de datos al cargar o en CI: cada array de respuestas tiene tantos valores como partidos, todos los valores están entre −2 y +2, `dir` es +1 o −1, los `id` son únicos, cada eje tiene al menos 10 preguntas.
- [ ] Tests unitarios deterministas para las funciones puras: puntuación por eje, afinidad, zona y conversión a coordenadas del rombo. Deben reproducir la tabla de posiciones de este README.
- [x] Cambiar la clave de `localStorage` por una por elección (`testnolan-es-2026`) para no mezclar respuestas entre tests.

### Compartir en redes (prioridad alta para la viralidad)

- [x] Botón **"Compartir mi resultado"** que genere en un `<canvas>` una imagen de **1200 × 630** con: el rombo, los partidos, el punto del usuario destacado, su zona, sus dos puntuaciones, el partido con mayor afinidad (opcional, ver advertencia legal) y la URL **testnolan.com** bien visible.
- [x] En móvil, usar la **Web Share API** con archivo (`navigator.share({ files, text, url })`) para enviar la imagen directamente a WhatsApp, Instagram, X, etc. Texto sugerido: "Me sale Libertario (69/81). ¿Dónde caes tú? testnolan.com".
- [x] En escritorio, descargar el PNG y abrir la ventana de publicación de X (`https://twitter.com/intent/tweet?text=…&url=…`) y de Facebook con el texto y la URL ya escritos.
- [x] **Enlace con resultado**: codificar las respuestas del usuario en el *hash* de la URL (por ejemplo `#r=<base64>`), que nunca llega al servidor, para que quien lo abra vea el punto del amigo junto al suyo ("compárate conmigo").
- [x] Etiquetas **Open Graph y Twitter Card** con una imagen estática del rombo, título y descripción, para que el enlace se vea bien al pegarlo. La imagen se regenera con Chrome headless:
  ```
  google-chrome --headless=new --window-size=1200,630 --hide-scrollbars --virtual-time-budget=8000 --screenshot=og-image.png "http://localhost:8000/index.html?og=1"
  ```
- [ ] Probar la descarga y la Web Share API en móviles reales; en el visor de Claude están bloqueadas.

### Contenido y transparencia

- [ ] Añadir a cada respuesta de cada partido una **fuente** (enlace a programa, votación o declaración). El desplegable ya la muestra si existe: basta con añadir a la pregunta un campo `src:{pp:'https://…', psoe:'https://…'}`.
- [ ] Revisar las respuestas cuando los partidos publiquen sus programas completos (a 31 de octubre de 2026 ninguno lo había hecho).
- [x] Indicar en la web en qué circunscripciones se presentan D21 + Cs (solo Madrid y Barcelona) y SALF (algunas provincias).
- [ ] Valorar añadir los partidos territoriales (ERC, Junts, PNV, EH Bildu, BNG, Coalición Canaria) con un filtro por comunidad.
- [x] Mencionar en la metodología las críticas al modelo de Nolan.
- [x] En el pie: "Hecho por Robert Menetray" con enlace a menetray.com y "¿Ves algún error en las posiciones? Escríbeme". Pendiente: cambiar el enlace de «Escríbeme» por la URL de issues cuando el repositorio sea público.
- [x] Textos legales mínimos: aviso de que no se guardan datos, de que las posiciones son estimaciones y de que el test no recomienda votar a ningún partido.

### Periodo de prohibición de encuestas (24–28 de noviembre)

- [ ] Revisar si la imagen para compartir debe omitir el "partido con mayor afinidad" esos días, o mostrar solo la zona y las puntuaciones. Consultarlo con alguien con conocimientos legales; no hay criterio cerrado. Para omitirlo basta con poner `SHARE_SHOW_TOP_PARTY = false` en `index.html`.

### Accesibilidad y calidad

- [x] Revisar contraste en ambos temas, navegación con teclado en la escala de respuestas y textos alternativos del SVG (la descripción del SVG se actualiza con la posición del usuario).
- [ ] Probar en móviles reales (Safari iOS y Chrome Android), sobre todo la Web Share API.
- [x] Respetar `prefers-reduced-motion` en cualquier animación nueva.

### Futuro (no prioritario)

- [ ] Estructura multipaís con rutas: `/es` (generales España), `/cat` (Cataluña), `/ad` (Andorra), y futuras municipales y autonómicas de 2027.
- [ ] Sugerencia de test por idioma del navegador o país (nunca redirección automática).
- [ ] Traducciones (castellano, catalán, inglés).
- [ ] Artículo en menetray.com contando cómo se hizo y qué tráfico aguantó con coste cero.

---

## Estructura de archivos propuesta

```
/
├── README.md
├── LICENSE                  # MIT (código)
├── LICENSE-DATA             # CC BY 4.0 (datos de partidos y preguntas)
├── CONTRIBUTING.md          # cómo proponer correcciones (con fuente)
├── .github/
│   └── ISSUE_TEMPLATE/
│       └── correccion-posicion.yml
├── public/
│   ├── index.html           # portada o redirección a /es
│   ├── es/
│   │   └── index.html
│   ├── assets/
│   │   ├── app.js
│   │   ├── styles.css
│   │   └── og-image.png     # imagen fija para Open Graph
│   └── data/
│       └── es-2026.json
└── tests/
    └── scoring.test.js
```

---

## Limitaciones y advertencias

- **Las respuestas de los partidos son estimaciones**, no posiciones oficiales. Se basan en anuncios de precampaña, votaciones y declaraciones hasta el 31 de octubre de 2026.
- **El resultado depende del cuestionario.** Con otras preguntas los puntos se moverían. Por ejemplo, con el cuestionario actual el PP sale en el centro ligeramente por encima de la línea media y D21 + Cs en la zona libertaria; en un análisis previo hecho a mano, con más peso del tamaño del Estado, ambos quedaban algo más abajo. Por eso las reglas de clasificación y el equilibrio de las preguntas son tan importantes.
- **Milei y Bukele** se estiman por analogía y con preguntas pensadas para España.
- **El modelo de Nolan simplifica**: reduce la política a dos ejes y deja fuera, entre otros, el eje territorial, que en España es muy relevante.
- El test **no es una encuesta** ni pretende representar a la población.

---

## Cómo contribuir

Las correcciones son bienvenidas, sobre todo en las respuestas de los partidos. Para que se acepten:

1. Abre un issue con la plantilla "Corrección de posición".
2. Indica el partido, la pregunta (`id`), la respuesta actual, la que propones y **al menos una fuente** verificable (programa, votación en el Congreso, declaración pública con fecha).
3. Los cambios deben respetar los [criterios de clasificación](#criterios-de-clasificación).

No se aceptan cambios sin fuente ni discusiones de opinión política en los issues.

---

## Licencia

Pendiente de añadir los archivos. Propuesta:

- **Código** (HTML, CSS, JavaScript): [MIT](https://opensource.org/licenses/MIT).
- **Datos** (preguntas, respuestas de partidos, textos de metodología): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es), que permite reutilizarlos citando la fuente. Si se quiere impedir el uso comercial (por ejemplo, copias con publicidad), usar CC BY-NC 4.0.

© 2026 Robert Menetray · [menetray.com](https://menetray.com)