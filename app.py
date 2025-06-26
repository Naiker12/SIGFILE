from flask import Flask, render_template, request, send_file, jsonify
import os
import json
import tempfile
import shutil
from utils.file_parser import (
    parse_uploaded_file, 
    export_to_excel, 
    remove_duplicates, 
    apply_filters,
    save_processed_data,
    load_processed_data,
    get_data_summary
)

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "processed"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

session_data = {}

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        file = request.files["file"]
        temp_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(temp_path)

        headers, data = parse_uploaded_file(temp_path)
        
        # Guardar datos en memoria para la sesión
        session_key = file.filename
        session_data[session_key] = {
            'headers': headers,
            'original_data': data,
            'current_data': data.copy(),
            'filters': {},
            'remove_duplicates': False
        }
        
        # Generar resumen de datos
        summary = get_data_summary(data)
        
        return render_template("preview.html", 
                             headers=headers, 
                             data=data, 
                             file=file.filename,
                             summary=summary)

    return render_template("index.html")

@app.route("/documentacion")
def documentacion():
    return render_template("doc.html")

@app.route("/apply-filters", methods=["POST"])
def apply_filters_route():
    """Aplica filtros a los datos sin exportar"""
    try:
        data = request.get_json()
        filename = data.get("filename")
        filters = data.get("filters", {})
        remove_dups = data.get("remove_duplicates", False)
        
        if filename not in session_data:
            return jsonify({"success": False, "message": "Archivo no encontrado en sesión"})
        
        original_data = session_data[filename]['original_data']
        
        filtered_data = apply_filters(original_data, filters) if filters else original_data
        
        if remove_dups:
            filtered_data = remove_duplicates(filtered_data)
        
        session_data[filename]['current_data'] = filtered_data
        session_data[filename]['filters'] = filters
        session_data[filename]['remove_duplicates'] = remove_dups
        
        summary = get_data_summary(filtered_data)
        
        return jsonify({
            "success": True, 
            "data": filtered_data,
            "summary": summary,
            "message": f"Filtros aplicados. {len(filtered_data)} filas mostradas."
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Error aplicando filtros: {str(e)}"})

@app.route("/export", methods=["POST"])
def export():
    try:
        selected_columns = request.form.getlist("columns")
        filename = request.form["filename"]
        export_mode = request.form.get("export_mode", "normal")
        table_data_str = request.form.get("table_data")
        
        # Determinar qué datos usar
        if table_data_str:
            try:
                current_data = json.loads(table_data_str)
            except json.JSONDecodeError:
                return jsonify({"success": False, "message": "Error parseando datos de tabla"})
        elif filename in session_data:
            current_data = session_data[filename]['current_data']
        else:
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            headers, current_data = parse_uploaded_file(filepath)
        
        if not current_data:
            return jsonify({"success": False, "message": "No hay datos para exportar"})
        
        if selected_columns:
            filtered_data = []
            for row in current_data:
                filtered_row = {}
                for col in selected_columns:
                    if col in row:
                        filtered_row[col] = row[col]
                filtered_data.append(filtered_row)
        else:
            filtered_data = current_data
        
        base_name = filename.rsplit('.', 1)[0] if '.' in filename else filename
        
        if export_mode == "overwrite":
            download_name = f"{base_name}_actualizado.xlsx"
        elif export_mode == "new_file":
            download_name = f"{base_name}_con_cambios.xlsx"
        else:
            download_name = f"{base_name}_exportado.xlsx"
        
        # Exportar a Excel
        excel_path = export_to_excel(
            data=filtered_data,
            selected_columns=selected_columns if selected_columns else None,
            remove_duplicates_flag=False, 
            filters=None  
        )
        
        if not excel_path:
            return jsonify({"success": False, "message": "Error generando archivo Excel"})
        
        final_path = os.path.join(PROCESSED_FOLDER, download_name)
        shutil.copy2(excel_path, final_path)
        
        return send_file(final_path, as_attachment=True, download_name=download_name)
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Error en exportación: {str(e)}"})

@app.route("/save-changes", methods=["POST"])
def save_changes():
    """Guarda cambios realizados en la tabla"""
    try:
        data = request.get_json()
        filename = data.get("filename")
        table_data = data.get("table_data")
        filters = data.get("filters", {})
        remove_dups = data.get("remove_duplicates", False)
        
        if not filename or not table_data:
            return jsonify({"success": False, "message": "Datos incompletos"})
        
        # Actualizar datos en sesión
        if filename in session_data:
            session_data[filename]['current_data'] = table_data
            session_data[filename]['filters'] = filters
            session_data[filename]['remove_duplicates'] = remove_dups
            
            temp_file = save_processed_data(table_data)
            if temp_file:
                session_data[filename]['temp_file'] = temp_file
        
        return jsonify({"success": True, "message": "Cambios guardados correctamente"})
    
    except Exception as e:
        return jsonify({"success": False, "message": f"Error guardando cambios: {str(e)}"})

@app.route("/save-duplicates", methods=["POST"])
def save_duplicates():
    """Maneja duplicados específicamente"""
    try:
        data = request.get_json()
        filename = data.get("filename")
        action = data.get("action", "remove") 
        duplicate_columns = data.get("columns", [])
        
        if filename not in session_data:
            return jsonify({"success": False, "message": "Archivo no encontrado en sesión"})
        
        current_data = session_data[filename]['current_data']
        
        if action == "remove":
            if duplicate_columns:
                processed_data = remove_duplicates(current_data, duplicate_columns)
            else:
                processed_data = remove_duplicates(current_data)
            
            session_data[filename]['current_data'] = processed_data
            message = f"Duplicados eliminados. {len(processed_data)} filas restantes."
        else:
            message = "Duplicados mantenidos."
        
        summary = get_data_summary(session_data[filename]['current_data'])
        
        return jsonify({
            "success": True, 
            "message": message,
            "data": session_data[filename]['current_data'],
            "summary": summary
        })
    
    except Exception as e:
        return jsonify({"success": False, "message": f"Error procesando duplicados: {str(e)}"})

@app.route("/reset-data", methods=["POST"])
def reset_data():
    """Resetea los datos a su estado original"""
    try:
        data = request.get_json()
        filename = data.get("filename")
        
        if filename not in session_data:
            return jsonify({"success": False, "message": "Archivo no encontrado en sesión"})
        
        # Restaurar datos originales
        session_data[filename]['current_data'] = session_data[filename]['original_data'].copy()
        session_data[filename]['filters'] = {}
        session_data[filename]['remove_duplicates'] = False
        
        original_data = session_data[filename]['original_data']
        summary = get_data_summary(original_data)
        
        return jsonify({
            "success": True,
            "message": "Datos restaurados al estado original",
            "data": original_data,
            "summary": summary
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Error restaurando datos: {str(e)}"})

@app.route("/get-summary", methods=["POST"])
def get_summary():
    """Obtiene resumen actualizado de los datos"""
    try:
        data = request.get_json()
        filename = data.get("filename")
        
        if filename not in session_data:
            return jsonify({"success": False, "message": "Archivo no encontrado en sesión"})
        
        current_data = session_data[filename]['current_data']
        summary = get_data_summary(current_data)
        
        return jsonify({"success": True, "summary": summary})
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Error obteniendo resumen: {str(e)}"})

@app.route("/uploads")
def list_uploads():
    try:
        files = os.listdir(UPLOAD_FOLDER)
        files = [f for f in files if os.path.isfile(os.path.join(UPLOAD_FOLDER, f))]
        return jsonify(files)
    except Exception as e:
        return jsonify([])

@app.route("/delete-file", methods=["POST"])
def delete_file():
    data = request.get_json()
    filename = data.get("filename")

    if not filename:
        return jsonify({"success": False, "message": "No filename provided"})

    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    
    if filename in session_data:
        if 'temp_file' in session_data[filename]:
            temp_file = session_data[filename]['temp_file']
            if os.path.exists(temp_file):
                os.remove(temp_file)
        del session_data[filename]
    
    return jsonify({"success": True})

@app.route("/clear-session", methods=["POST"])
def clear_session():
    """Limpia todos los datos de sesión"""
    try:
        for file_data in session_data.values():
            if 'temp_file' in file_data:
                temp_file = file_data['temp_file']
                if os.path.exists(temp_file):
                    os.remove(temp_file)
        
   
        session_data.clear()
        
        return jsonify({"success": True, "message": "Sesión limpiada correctamente"})
        
    except Exception as e:
        return jsonify({"success": False, "message": f"Error limpiando sesión: {str(e)}"})

if __name__ == "__main__":
    app.run(debug=True)