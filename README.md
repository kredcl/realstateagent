# Arce Propiedades (demo)

Sitio de demostración para una corredora de propiedades ficticia en Santiago: **Valentina Arce**. La corredora, las propiedades, los precios, la dirección, el teléfono y el correo son **ficticios**. Hay que reemplazarlos antes de usar el sitio con un cliente real.

Inspirado en las interacciones de sitios inmobiliarios contemporáneos. La marca, el logotipo, los textos y la composición son propios del proyecto.

## Identidad

- **Paleta:**
  - verde azulado profundo `#0A3B35`
  - verde moderado `#2A6151`
  - verde laurel `#B2B7AA`
  - crema `#FCF7F0`
  - dorado toscano `#D8C2A4`
- **Tipografía:** Jost variable (geométrica).
- **Logotipo:** ARCE dibujado con un solo trazo. La A es un arco (una puerta) con una onda como travesaño.
- **Objetos flotantes:** hojas y semillas de arce, y esferas con textura.

## Secciones y efectos (Anime.js v4 + Lenis)

1. **Carga:** el nombre se dibuja letra por letra y luego se abre el héroe.
2. **Héroe:** foto a la izquierda y óvalo con video sobre fondo verde. Debajo, el nombre gigante y "Encuentra tu lugar".
3. **Comprar:**
   - la foto a pantalla completa se encoge hasta quedar en un marco;
   - aparecen una foto circular, el texto y las esferas;
   - entra el panel con la cita de la corredora.
4. **Vender:**
   - un campo dorado sube sobre la foto;
   - aparece el collage de 3 fotos;
   - entra el panel con los pasos y el video en óvalo.
5. **Arrendar:**
   - la foto se revela;
   - entra el panel de administración con 4 servicios;
   - aparece la franja "Calma".
6. **Zonas:**
   - el video de costa pasa de pantalla completa a óvalo;
   - la palabra vertical cambia de color;
   - sube el mapa esquemático con las comunas y la oficina.
7. **Propiedades:** un óvalo grande entra girando, cae una lámpara y cambia la foto.
8. **Listado:** 8 propiedades con filtro por operación y comuna, y favoritas guardadas en el navegador.
9. **Simulador de dividendo:** precio en UF, pie, plazo, tasa y valor UF. Muestra el dividendo y la renta sugerida.
10. **Guías:** 3 artículos breves desplegables.
11. **Pie:** marquesina con el logotipo, datos de contacto y el formulario "Agenda una visita" (sin envío real).

Los capítulos fijados con scroll funcionan en escritorio (≥ 900 px). En el teléfono, y con `prefers-reduced-motion`, todo se muestra en una composición estática con revelados suaves. Sin JavaScript, todo el contenido queda visible.

## Uso

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Medios

- **Fotos:** [Unsplash](https://unsplash.com) (licencia Unsplash). Hay que reemplazarlas por fotos reales de las propiedades y de la corredora.
- **Videos:** [Mixkit](https://mixkit.co) (licencia gratuita de Mixkit), recortados y sin audio:
  - `llave`: Realtor hand holds key and woman takes it (12878)
  - `dormitorio`: Boutique hotel room and terrace (4047)
  - `costa`: Flying over some fancy houses on the beach (30357)
