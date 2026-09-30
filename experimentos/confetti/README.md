# Laboratorio de confetti

https://rourog.github.io/labs/experimentos/confetti/

16 efectos combinables de dos en dos. Incluye el motor original de Firework Simulator v2 de Caleb Miller con seis variantes y selección mixta, y globos con SVG de Artur Bień (balloons-js). Conserva los efectos simples para comparar.

Cantidad compartida entre capas, duración hasta 8 segundos, apertura y tamaño. Para los fuegos de Caleb, cantidad controla cohetes y partículas; tamaño controla su escala. La apertura se usa en los efectos de partículas simples. Prueba 4–6 segundos para apreciar lanzamiento y explosión.

Sonidos sintetizados locales, apagados por defecto; no se descargan los audios del simulador. Cada pestaña activa audio con un gesto. Limpiar cancela partículas, cohetes pendientes y animaciones de globos.

BroadcastChannel sincroniza pestañas del mismo navegador y origen. Las mini vistas son simuladas; no conecta dispositivos distintos ni datos de pacientes. Respeta movimiento reducido salvo activación explícita. No modifica el censo publicado.

## Autores

Caleb Miller, Firework Simulator v2; copia de troyxun/fireworks-simulator. Artur Bień, balloons-js. Licencias MIT y detalles de adaptación en vendor/NOTICE.md.

## Validación

Motor original ejercitado para siete selecciones de explosión con canvas simulado, verificando renderizado y limpieza de partículas. Controlador probado con los 16 efectos y combinaciones, deduplicación y sonidos. Revisión visual del sitio publicado.
