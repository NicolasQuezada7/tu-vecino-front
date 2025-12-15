# 🛒 Tu Vecino - Aplicación Frontend (React/Vite)

## 🎯 1. Descripción y Objetivo
Esta aplicación es la interfaz de usuario (UI) para el sistema POS. Permite a los usuarios (Administrador y Vendedor) acceder a las funcionalidades de ventas, control de caja, y gestión de maestros.

## 🛠️ 2. Tecnologías y Versiones
* **Framework:** React (con Vite)
* **Lenguaje:** JavaScript / JSX
* **Interfaz:** Componentes funcionales y Hooks.
* **Estilos:** CSS (módulos y ajustes de Layout).

## 🚀 3. Instalación y Ejecución Local

### 3.1 Prerrequisitos
* Node.js (versión 18 o superior).
* El Backend (API NestJS) debe estar corriendo localmente en `http://localhost:3000/api/docs` o desplegado en Render.

### 3.2 Pasos Detallados

#### A. Clonar el Repositorio e Instalar Dependencias
```bash
# 1. Clonar el repositorio
git clone https://github.com/NicolasQuezada7/tu-vecino-front
cd tu-vecino-front

# 2. Instalar todas las dependencias
npm install

#3 Crear archivo .env y pegar esto dentro

VITE_API_URL=https://tu-vecino-api.onrender.com/api/v1

#4 iniciar la aplicación
npm run dev

#5 link del front desplegado en Netlify
https://chipper-pudding-bb8d5d.netlify.app/

datos de acceso:
Admin@tuvecino.cl
123456

luisvendedor@tuvecino.cl
123456