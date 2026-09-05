# Guía para elaborar el informe académico en PDF

Esta plantilla indica qué contenido desarrollar y qué evidencia asociar en cada apartado. Debe redactarse con palabras propias y sustituir los nombres y capturas de ejemplo por los recursos realmente desplegados.

## 1. Portada

Incluir universidad, facultad o curso, título **Procesamiento automático de imágenes con arquitectura serverless en AWS**, nombre y carné del estudiante, docente, sección, ciudad y fecha. Agregar los enlaces finales solo si el formato institucional lo permite.

## 2. Introducción

Presentar el problema: procesar imágenes manualmente consume tiempo y produce resultados variables. Explicar brevemente cómo la computación serverless y los eventos de almacenamiento automatizan la tarea sin administrar servidores.

## 3. Objetivos

Plantear un objetivo general: implementar una solución orientada a eventos que redimensione JPEG y PNG. Añadir objetivos específicos medibles: configurar S3, desarrollar Lambda en TypeScript, usar Sharp, aplicar mínimo privilegio, observar logs y validar el resultado.

## 4. Arquitectura implementada

Insertar el diagrama de `docs/architecture.md`. Describir el recorrido Usuario → S3 `originals/` → evento → Lambda/Sharp → S3 `resized/`, además del envío de logs a CloudWatch. Explicar que S3 y Lambda se encuentran en la misma región.

## 5. Recursos utilizados

Crear una tabla con Amazon S3, AWS Lambda, CloudWatch Logs, IAM, Node.js 22, TypeScript, AWS SDK v3, Sharp, Git y GitHub. Para cada elemento indicar su responsabilidad y por qué fue elegido.

## 6. Configuración de Amazon S3

Documentar el nombre único y región del bucket, el bloqueo de acceso público y los prefijos `originals/` y `resized/`. Aclarar que las “carpetas” de S3 son prefijos de las keys. Adjuntar capturas del bucket y de ambos prefijos.

## 7. Configuración de AWS Lambda

Indicar nombre, runtime `Node.js 22.x`, arquitectura `x86_64`, handler `index.handler`, memoria y timeout. Explicar que el ZIP contiene JavaScript compilado, dependencias de producción y binarios Linux de Sharp.

## 8. Configuración del evento

Mostrar el trigger S3 con tipo **All object create events** y prefijo `originals/`. Explicar que no se agregó un sufijo único porque deben admitirse `.jpg`, `.jpeg` y `.png`; la validación de extensiones se realiza también en el código.

## 9. Implementación de la función

Explicar cada módulo: `index.ts` coordina registros, `config.ts` lee dimensiones, `s3Service.ts` encapsula AWS SDK v3, `imageProcessor.ts` usa Sharp y `utils.ts` valida y construye keys. Incluir solo fragmentos relevantes y remitir al repositorio para el código completo.

## 10. Configuración de dimensiones

Mostrar `IMAGE_WIDTH=800` e `IMAGE_HEIGHT=600`. Explicar la lectura mediante `process.env`, los valores predeterminados y la validación de enteros positivos. Describir `fit: "inside"` y `withoutEnlargement: true`.

## 11. Permisos y seguridad

Incluir la política IAM y explicar cada statement. Destacar: bucket privado, credenciales fuera del código, rol de ejecución, `GetObject` limitado a `originals/*`, `PutObject` limitado a `resized/*` y permisos de logs limitados al grupo de la función.

## 12. Logs y observabilidad

Presentar capturas de CloudWatch con inicio, bucket, key, Content-Type, dimensiones, descarga, procesamiento, key de salida y guardado. Explicar cómo los logs permiten localizar un registro fallido sin exponer secretos.

## 13. Pruebas realizadas

Crear una tabla de casos: JPEG válido, PNG válido, nombre con espacio, extensión no compatible, evento de `resized/`, variables ausentes y evento repetido. Registrar entrada, resultado esperado, resultado observado y evidencia.

## 14. Comparación de dimensiones

Mostrar dimensiones y tamaño en bytes de original y resultado. Explicar con un cálculo sencillo por qué `fit: inside` conserva la relación de aspecto y por qué una dimensión puede ser menor que 800 o 600.

## 15. Prevención de ciclos

Describir las dos barreras: filtro del trigger `originals/` y validación defensiva en Lambda. Mostrar que `resized/` no produce otra ejecución en CloudWatch.

## 16. Idempotencia

Explicar que una misma entrada siempre genera la misma key de salida, por ejemplo `originals/foto.jpg` → `resized/foto-resized.jpg`. Una repetición sobrescribe de forma segura el mismo resultado, sin crear copias con nombres aleatorios.

## 17. Resultados

Resumir si se cumplieron los objetivos. Indicar formatos probados, dimensiones obtenidas, tiempo observado de ejecución y ubicación de los archivos. No afirmar mediciones que no se hayan observado.

## 18. Conclusiones

Redactar entre tres y cinco conclusiones relacionadas con automatización por eventos, desacoplamiento, seguridad, observabilidad e importancia de empaquetar dependencias nativas para el sistema operativo de Lambda.

## 19. Enlace a GitHub

Colocar la URL pública o accesible al docente. Mencionar rama y commit/tag entregado. Verificar que no existan `.env`, credenciales, `node_modules`, ZIP ni archivos temporales versionados.

## 20. Enlace al video

Colocar un enlace con permisos de visualización. Añadir duración y un breve índice de tiempos: arquitectura, configuración, carga, ejecución automática, logs, resultado y prevención del ciclo.

## Anexos sugeridos

Agregar la política IAM completa, árbol de archivos, comandos utilizados, evento de prueba opcional y capturas adicionales. Las evidencias principales y su explicación exacta se enumeran al final del `README.md`.
