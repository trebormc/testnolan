# Justificaciones por casilla (versión de datos 1.6, 1 de noviembre de 2026)

Cada pregunta de la web lleva ahora un desplegable «¿Por qué responde así cada partido?» con una frase por partido o referencia y el enlace a su fuente. Son 658 frases (47 preguntas por 14 partidos y referencias). Están dentro de `index.html`, en el bloque `<script type="application/json" id="whyData">`, con la forma `{partido:{pregunta:[frase, url]}}`. Se redactaron en nueve investigaciones en paralelo, una por partido español más Milei y Bukele, a partir de los documentos de verificación anteriores, los programas (PP 2023, Vox 2019, Sumar 2023, Ciudadanos 2019), las votaciones del Congreso y del Parlamento Europeo y la prensa. Las de Trump, Putin, Maduro, Mujica y Meloni salen de `docs/referencias-internacionales-2026-11-01.md`.

Reglas de redacción: una frase, máximo 30 palabras, con el hecho concreto y su fecha aproximada. Si el valor es 0, la frase explica la contradicción. Si es «sin dato», la frase dice por qué no hay dato.

## Casillas corregidas al redactar las frases (24)

Al tener que justificar cada valor con un hecho, 24 casillas no se sostenían. Se corrigen en esta versión. La frase de la web ya describe el valor nuevo.

| Pregunta | Partido | Antes | Ahora | Frase |
|---|---|---:|---:|---|
| e_empv | Vox | -2 | -1 | Nunca ha propuesto una empresa pública estatal y su plan es liberalizar suelo y bajar impuestos a quien construya, aunque Garriga anunció en octubre de 2026 vivienda social masiva. |
| e_smi | Vox | 0 | -1 | Critica las subidas del salario mínimo a costa de las empresas y lo ha llamado fracaso, pero nunca ha propuesto congelarlo o bajarlo. |
| e_empv | Podemos | 2 | 1 | Propone pasar al parque público las viviendas vacías de bancos, fondos y Sareb, aunque su vía es expropiar y no ha concretado una empresa estatal. |
| p_apuestas | Podemos | 2 | 1 | Su programa de 2019 prohibía la publicidad de apuestas como la del tabaco y Garzón, ministro de Unidas Podemos, la restringió por decreto en 2020. |
| e_aval | SALF | 1 | null | No propone avales a hipotecas, su ayuda a la compra es cero impuestos en la primera vivienda y un seguro público de impagos del alquiler, Castilla y León 2026. |
| e_expr | SALF | -2 | -1 | Sin propuesta expresa, su línea es reducir el Estado y privatizar medios públicos como Canal Sur, programa de Andalucía 2026, lo contrario de nacionalizar. |
| e_empv | SALF | -2 | -1 | No hay propuesta de empresa pública, su receta de vivienda es suelo edificable por defecto, cero impuestos en la primera vivienda y licencias rápidas. |
| e_acum | SALF | -2 | -1 | No propone gravar a grandes tenedores, ofrece deducciones en el IRPF al propietario okupado y seguro público de impagos, programas de Castilla y León y Andalucía 2026. |
| p_anon | SALF | -2 | -1 | Su pilar de 2024 es la libertad de expresión en redes y su canal de Telegram es su altavoz, pero no hay declaración localizada sobre la propuesta de Sánchez. |
| p_trans | SALF | -2 | -1 | Su programa de Castilla y León 2026 saca el cambio de sexo de la sanidad pública y votó contra la Estrategia europea de Igualdad de Género en noviembre de 2025. |
| e_aran | D21 + Cs | -2 | -1 | Miriam González, abogada de comercio internacional, escribió en 2016 que el libre comercio ha ganado y que adaptarse o morir es la única opción. |
| e_jorn | D21 + Cs | 0 | null | Ni D21 ni Ciudadanos se han pronunciado sobre reducir la jornada por ley, y el programa de Cs de 2019 solo flexibilizaba reducciones por cuidado de hijos. |
| p_ident | D21 + Cs | 0 | null | Ni Democracia 21 ni Ciudadanos se han pronunciado sobre verificar la identidad en webs de contenido adulto, por lo que la casilla queda en neutral. |
| p_taba | D21 + Cs | 1 | null | No se ha localizado ninguna propuesta de D21 ni de Ciudadanos sobre prohibir fumar o vapear en terrazas y espacios abiertos. |
| e_okupa | D21 + Cs | 1 | 2 | Ciudadanos, su socio de coalición, prometía en 2019 que los propietarios recuperaran su vivienda okupada en 48 horas, y D21 cita la inquiokupación como problema a cubrir. |
| p_odio | Frente Amplio | 2 | 1 | Su programa de 2023 propone una ley integral contra el racismo para sancionar la discriminación y un pacto de Estado contra los discursos de odio. |
| p_anon | Frente Amplio | 0 | null | Sumar no se pronunció sobre la propuesta de Sánchez de 2025 de acabar con el anonimato y su programa de 2023 solo recoge el derecho a la indemnidad en redes. |
| e_expr | Bukele | 0 | -1 | No ha nacionalizado empresas y en 2024 concesionó los puertos de Acajutla y La Unión a Yilport por 50 años, pero aplica extinción de dominio a opositores desde 2023. |
| e_desp | Bukele | 1 | null | Sin reforma del Código de Trabajo sobre despidos, lo documentado son despidos públicos: 3.000 funcionarios en 2019, 300 de Cultura en junio de 2024 y 74 sanitarios en 2024. |
| p_relig | Bukele | 2 | 1 | En marzo de 2024 ordenó borrar toda ideología de género de las escuelas y en junio despidió a 300 funcionarios de Cultura por chocar con valores patrióticos y familiares. |
| e_irpf | Milei | 1 | 0 | Restituyó Ganancias a los asalariados en junio de 2024 para cuadrar las cuentas, pero dejó caer el impuesto PAIS en diciembre de 2024 y promete bajar impuestos solo con superávit. |
| p_prost | Milei | -1 | null | Sin medida como presidente, pero defiende la prostitución como transacción libre entre adultos, «nada malo en pagar por sexo», y nunca ha propuesto castigar al cliente. |
| p_anon | Milei | -1 | null | Gobierna apoyado en cuentas anónimas afines en X y nunca ha propuesto identificar a los usuarios, pero no hay ninguna medida ni declaración localizada. |
| p_mili | Milei | -1 | null | Mantiene el servicio militar voluntario vigente desde 1994 y en tres años no ha impulsado ninguna medida para restablecer el obligatorio. |

Sugerencias que no se han aplicado:
- PP, pensiones con la inflación: la investigación proponía bajar de muy a favor a a favor por la reforma de 2013 que desligó las pensiones del IPC. Se mantiene muy a favor porque pesa más lo reciente: la ley de revalorización automática que el PP registró en 2025 y el compromiso repetido de Feijóo en octubre de 2026.

## Casillas sin fuente enlazada

Las frases sin enlace describen hechos conocidos cuya URL no se pudo comprobar en la sesión. Conviene añadirla cuando se revise: PP (prioridad nacional, matrimonio igualitario, cannabis, ilegalizar partidos), PSOE (decreto y mili), Frente Amplio (impuesto a la cuarta vivienda), Podemos (tabaco y anonimato, sin dato), Milei (pensiones, pensiones mixtas, jornada), Bukele (varias casillas sin dato) y SALF (las casillas sin dato).

## Posiciones de la versión 1.6

PP 70/37, PSOE 19/54, Vox 86/38, Frente Amplio 6/69, Podemos 8/73, SALF 83/55, D21 + Cs 62/56, Milei 91/32, Bukele 62/11, Trump 71/20, Putin 40/7, Maduro 24/10, Mujica 28/66, Meloni 69/26.
