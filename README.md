# Sistema de Gestión de Inventario 🚀

Un sistema web completo, moderno y responsivo enfocado en la gestión eficiente de stock y auditoría de movimientos de productos. Desarrollado en un plazo de 7 días como parte del proceso de selección para el puesto de Software Engineer Web en AranguriApps.

## 🛠️ Stack Tecnológico & Arquitectura

- **Frontend:** Next.js 14+ (App Router) con TypeScript y Tailwind CSS para una interfaz limpia, tipada y de alto rendimiento.
- **Backend & Base de Datos:** Supabase (BaaS) para la persistencia de datos relacionales en PostgreSQL y manejo ágil del inventario.
- **Despliegue:** Vercel (Integración Continua / Despliegue Continuo).

### ¿Por qué esta arquitectura?
Se eligió **Next.js con App Router** por su capacidad para combinar Server Components (carga de datos ultra rápida desde el servidor en la página de edición/creación) con Client Components para la interactividad de las tablas y filtros. **Supabase** permitió acelerar el desarrollo del backend sin sacrificar la robustez de una base de datos relacional con integridad referencial, ideal para vincular productos con sus respectivos movimientos de stock.

## 🤖 Orquestación de Inteligencia Artificial & Criterio de Auditoría

En línea con los requerimientos modernos de velocidad y optimización, este proyecto implementa un flujo de trabajo asistido por IA, donde el valor agregado radicó en el **criterio técnico y auditoría humana**:

- **v0 de Vercel (Generativa UI):** Utilizada para prototipar rápidamente las vistas principales de la aplicación (Dashboard, Formulario e Historial), garantizando interfaces estéticas y accesibles desde el día uno.
- **Asistentes LLM & GitHub Copilot:** Integrados para acelerar la escritura de la lógica de negocio y mapeos de datos.

### 🛡️ Casos de Auditoría y QA Propio (Resolución de Conflictos):
La IA suele ignorar restricciones profundas de backend o tipados estrictos. Durante el desarrollo, tomé el rol de auditora principal en los siguientes escenarios críticos:
1. **Validación de Constraints en Postgres:** Al integrar el formulario con Supabase, la IA generaba strings genéricos para los tipos de movimientos. Tuve que intervenir el código para sincronizar los datos del frontend con el `CHECK CONSTRAINT` de la base de datos, evitando fallos de inserción silenciosos.
2. **Tipado Estricto en TypeScript:** Corregí inconsistencias donde la IA omitía la propiedad obligatoria `status` al mapear las respuestas de la base de datos hacia las interfaces del cliente, asegurando que la aplicación compile sin *warnings* ni código roto.
3. **Estrategia de Borrado Lógico (Soft Delete):** Con el fin de resguardar la integridad referencial y mantener intacto el historial contable de auditoría en la tabla de movimientos, se descartó el uso de operaciones `DELETE` físicas. En su lugar, se diseñó e implementó un sistema de borrado lógico mediante una bandera (`activo: boolean`) controlada desde el cliente, asegurando la consistencia relacional de la base de datos de manera definitiva.

## 📋 Requisitos del Sistema (Vistas Implementadas)

1. **Dashboard Principal:** Resumen visual de métricas del negocio (Stock bajo, valor total del inventario en base a precio × stock) junto a una tabla interactiva de productos con filtros combinados por búsqueda de texto (Nombre/SKU) y categorías.
2. **Formulario de Productos:** Flujo unificado que maneja la creación y edición dinámica de registros en Supabase usando parámetros de URL (`searchParams`), manteniendo el proyecto compacto y sólido.
3. **Historial de Movimientos:** Módulo de auditoría que registra en tiempo real las entradas y salidas de stock con motivos específicos, resolviendo la relación de llaves foráneas (`JOIN`) con la tabla de productos.
4. **Baja de Productos (UX/UI Optimizada):** Se integró un botón de eliminación que despliega una interfaz de confirmación modal nativa en React y Tailwind CSS, evitando alertas intrusivas del navegador y notificando el éxito de la operación mediante un banner flotante (Toast) temporizado.

## 🚀 Instalación y Ejecución Local

Para correr este proyecto localmente, seguí estos pasos:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/MarilynDaiana/Inventario.git
   cd Inventario

2. Instalar dependencias
    ```bash
    pnpm install

3. Configurar variables de entorno:
    Creá un archivo .env.local en la raíz del proyecto y agregá tus credenciales de Supabase:

    NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_publica

4. Iniciar el servidor de desarrollo:
    ```bash
    pnpm dev

5. Abrí http://localhost:3000 en tu navegador para ver el resultado.

