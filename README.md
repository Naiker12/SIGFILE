![{7EE1F707-C6CD-4679-8C44-2E9ABF721DA6}](https://github.com/user-attachments/assets/6e716408-f5f2-4745-985e-17eb5f37ba22)

# SIGFILE

Sistema para analizar archivos y exportar seleccionando columnas específicas. Construido con Flask y desplegado en Vercel.

## 📋 Tabla de contenidos

1. [Descripción](#descripción)  
2. [Funcionalidades](#funcionalidades)  
3. [Instalación](#instalación)  
4. [Ejecución](#ejecución)  
   - [Local](#local)  
   - [Producción / Vercel](#producción--vercel)  
5. [Estructura del proyecto](#estructura-del-proyecto)  
6. [Cómo contribuir](#cómo-contribuir)  
7. [Licencia](#licencia)  

---

## 📝 Descripción

**SIGFILE** es una aplicación web que permite subir archivos con datos, previsualizarlos, seleccionar columnas y exportarlos en formato Excel.  
Ideal para extraer solo la información relevante sin necesidad de herramientas adicionales.

---

## ✅ Funcionalidades

- Subir archivos a través de formulario.
- Mostrar vista previa de datos.
- Selección dinámica de columnas para exportación.
- Exportación a archivo Excel.
- Listar archivos subidos.
- Eliminar archivos desde la interfaz.

---

## 🛠️ Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Naiker12/SIGFILE.git
   cd SIGFILE
2. Crea un entorno virtual y actívalo:
   
  - python3 -m venv venv
  - source venv/bin/activate   # En Linux / Mac
  - venv\Scripts\activate      # En Windows
3. Instala las dependencias:
```bash
  pip install -r requirements.txt
