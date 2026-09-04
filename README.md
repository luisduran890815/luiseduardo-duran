# Blog profesional de Luis Eduardo Durán Mora

## Publicación en Netlify
1. Crea un repositorio nuevo en GitHub y sube todo el contenido de esta carpeta.
2. En Netlify, selecciona **Add new project > Import an existing project** y conecta el repositorio.
3. Configuración de despliegue: no requiere comando de construcción; directorio de publicación: `.`
4. Activa **Forms** y confirma que `solicitudes-cv` aparece tras el primer despliegue.
5. Activa **Identity** y cambia el registro a **Invite only**. Invita únicamente tu correo.
6. Activa **Git Gateway** y conéctalo al repositorio.
7. Entra a `/admin/`, inicia sesión y modifica fotos, escritos y vídeos.

## Repositorio para Excel
Las respuestas quedan en **Netlify > Forms > solicitudes-cv**. Usa **Download as CSV** para abrirlas directamente en Excel. No se utiliza Google Sheets.

## Privacidad y seguridad
- La cédula es un dato personal. Publica una política de tratamiento de datos acorde con tu finalidad y normativa aplicable.
- El formulario incluye consentimiento y honeypot antispam.
- La descarga se habilita después de un envío correcto. Como el CV vive en un sitio estático, una persona que conozca la ruta exacta podría acceder directamente al PDF. Para protección estricta hace falta una función autenticada o almacenamiento privado.

## Personalización
- Sustituye el monograma de inicio por una foto profesional si deseas.
- Cambia textos en `index.html`.
- Gestiona publicaciones desde el panel `/admin/`.
- El CV está en `downloads/CV_Luis_Eduardo_Duran_Mora.pdf`.
