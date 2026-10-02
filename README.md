# ❄️ Snowgirl Finder

> **"¿Qué ocurre cuando un ingeniero Senior DevOps decide tratar un flechazo en un festival como un problema de sistemas distribuidos y pipeline de datos?"**

Herramienta de investigación OSINT y panel de visualización de perfiles de Instagram construida con **React 19**, **Vite** y **Node.js** para buscar programáticamente una conexión perdida en el festival **Snowrow 2026** (evento de elrow celebrado en Grandvalira, Andorra).

🌐 **Web en Vivo (Live Demo):** [https://aamargant.github.io/snowgirl-finder/](https://aamargant.github.io/snowgirl-finder/)

---

## 📖 La Historia

El sábado 14 de marzo en el festival Snowrow (Grandvalira, Andorra), tras dos días intensos de esquí, con la batería social al 1% y tras una noche sin apenas dormir, una chica se tropezó una vez a propósito conmigo y estuvimos cruzando miradas todo el rato durante la noche. Sin embargo, un ataque de timidez y agotamiento extremo provocó que no diera el paso de pedirle el contacto.

En vez de pasar página como una persona normal, decidí sobreingenierizar una solución técnica en dos fases:
1. **Fase 1 (Scraping de fuerza bruta y heurísticas):** Extracción de miles de likes y comentarios de los posts oficiales del festival y publicaciones geolocalizadas en Andorra durante esas fechas, clasificándolos mediante heurísticas lingüísticas y visualizándolos en un dashboard interactivo tipo "Facewall".
2. **Fase 2 (Query distribuida vía Meta Ads):** Uso del motor de subastas de Meta Ads como una base de datos distribuida con segmentación booleana estricta: `(Música electrónica / Festivales)` **AND** `(Esquí / Andorra)`, acotado geográficamente a Madrid y Cataluña.

---

## 🛠️ Stack Tecnológico y Funcionalidades

- **Frontend:** React 19, Vite, Lucide Icons, diseño Glassmorphism con fondo animado de nieve.
- **Facewall de Alta Velocidad:** Cuadrícula de inspección visual rápida de perfiles con soporte nativo de atajos de teclado:
  - `S` – Marcar como favorito (Star)
  - `H` – Ocultar perfil (Hide)
  - `M` – Marcar como "Quizás" (Maybe)
  - `C` – Marcar como "Contactar" (Contact)
  - `O` – Abrir directamente el perfil en Instagram
- **Heurísticas Lingüísticas:** Clasificación de nombres propios basada en diccionarios de nombres en español, catalán y francés para filtrar la demografía objetivo.
- **Scoring de Relevancia:** Algoritmo que calcula la afinidad analizando palabras clave en biografías y comentarios (*Barcelona, BCN, Madrid, Toulouse, Andorra, esquí*).
- **Proxy Local de Imágenes:** Middleware integrado en el servidor de desarrollo de Vite (`/api/image-proxy`) para descargar y servir las fotos de perfil de la CDN de Instagram sin bloqueos por CORS ni protección de hotlinking.
- **Toolkit de Scraping (`scripts/`):**
  - [`scripts/scrape.js`](scripts/scrape.js): Extracción masiva de personas que dieron like a los posts objetivo usando HikerAPI.
  - [`scripts/scrape_comments.js`](scripts/scrape_comments.js): Extracción de autores y textos de comentarios.
  - [`scripts/scrape_location.js`](scripts/scrape_location.js): Rastreo cronológico de publicaciones geolocalizadas en Grandvalira, Grau Roig, Soldeu y Pas de la Casa durante las fechas del festival.

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/aamargant/snowgirl-finder.git
cd snowgirl-finder
npm install
```

### 2. Iniciar el entorno de desarrollo
```bash
npm run dev
```
Abre tu navegador en [http://localhost:5173](http://localhost:5173). La aplicación arranca directamente en **Modo Demo**, utilizando los conjuntos de datos precargados y datos simulados para que puedas probarla sin necesidad de configurar ninguna API externa.

### 3. Modo Live API (Opcional)
Haz clic en el icono de **Ajustes** en la barra superior e introduce tu clave de acceso de [HikerAPI](https://hikerapi.com) para rastrear likes y resolver perfiles en tiempo real.

---

## 📁 Estructura del Proyecto

```
├── scripts/
│   ├── scrape.js             # Crawler de likes de publicaciones
│   ├── scrape_comments.js    # Crawler de comentarios
│   └── scrape_location.js    # Crawler por geolocalización en Andorra
├── src/
│   ├── App.jsx               # Dashboard principal interactivo y Facewall
│   ├── App.css               # Estilos glassmorphic y animación de nieve
│   └── main.jsx
├── vite.config.js            # Configuración de Vite con middleware proxy de imágenes
└── package.json
```

---

## ⚠️ Aviso Legal

Este proyecto ha sido desarrollado exclusivamente como un experimento creativo, educativo y de divulgación técnica en pipelines de datos, microsegmentación y desarrollo web. Por favor, respeta la privacidad de los usuarios y las condiciones de servicio de las plataformas de terceros.
