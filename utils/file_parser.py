import pandas as pd
import zipfile
import os
import tempfile
from datetime import datetime
import io
import numpy as np

def parse_uploaded_file(filepath):
    """Parsea archivos subidos y retorna headers y datos"""
    if filepath.endswith(".xlsx"):
        return parse_excel_file(filepath)
    elif filepath.endswith(".zip"):
        return parse_zip_metadata(filepath)
    elif filepath.endswith(".ram"):
        return parse_ram_file(filepath)
    else:
        return [], []

def parse_excel_file(filepath):
    """Parsea archivos Excel manteniendo valores vacíos como None"""
    try:
        df = pd.read_excel(filepath, keep_default_na=True, na_values=[''])
        
        headers = [str(col) for col in df.columns]
        
        data = []
        for _, row in df.iterrows():
            row_dict = {}
            for i, header in enumerate(headers):
                value = row.iloc[i]
                if pd.isna(value):
                    row_dict[header] = None
                elif isinstance(value, (int, float)) and not pd.isna(value):
                    row_dict[header] = value
                else:
                    row_dict[header] = str(value).strip() if str(value).strip() != 'nan' else None
            data.append(row_dict)
        
        return headers, data
        
    except Exception as e:
        print(f"Error leyendo archivo Excel: {e}")
        return [], []

def parse_zip_metadata(filepath):
    """Parsea metadatos de archivos ZIP incluyendo ZIPs anidados"""
    metadata = []

    try:
        with zipfile.ZipFile(filepath, 'r') as zf:
            for zinfo in zf.infolist():
                if zinfo.is_dir():
                    continue

                entry = {
                    "nombre": zinfo.filename,
                    "tamaño_original": format_size(zinfo.file_size),
                    "tamaño_comprimido": format_size(zinfo.compress_size),
                    "modificado": datetime(*zinfo.date_time).strftime("%Y-%m-%d %H:%M:%S"),
                    "tipo": get_file_type(zinfo.filename),
                    "ratio_compresion": calculate_compression_ratio(zinfo.file_size, zinfo.compress_size)
                }
                metadata.append(entry)

                if zinfo.filename.lower().endswith(".zip"):
                    try:
                        with zf.open(zinfo.filename) as inner_file:
                            nested_zip = zipfile.ZipFile(io.BytesIO(inner_file.read()))
                            for nested in nested_zip.infolist():
                                if nested.is_dir():
                                    continue
                                nested_entry = {
                                    "nombre": f"{zinfo.filename}/{nested.filename}",
                                    "tamaño_original": format_size(nested.file_size),
                                    "tamaño_comprimido": format_size(nested.compress_size),
                                    "modificado": datetime(*nested.date_time).strftime("%Y-%m-%d %H:%M:%S"),
                                    "tipo": f"ZIP anidado - {get_file_type(nested.filename)}",
                                    "ratio_compresion": calculate_compression_ratio(nested.file_size, nested.compress_size)
                                }
                                metadata.append(nested_entry)
                            nested_zip.close()
                    except Exception as e:
                        print(f"Error leyendo ZIP anidado {zinfo.filename}: {e}")
                        continue

    except Exception as e:
        print(f"Error leyendo archivo ZIP: {e}")
        return [], []

    headers = ["nombre", "tamaño_original", "tamaño_comprimido", "modificado", "tipo", "ratio_compresion"]
    return headers, metadata

def parse_ram_file(filepath):
    """Parsea archivos RAM (texto delimitado) con detección automática de separadores"""
    try:
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        lines = None
        
        for encoding in encodings:
            try:
                with open(filepath, "r", encoding=encoding, errors="ignore") as f:
                    lines = f.readlines()
                break
            except Exception:
                continue
        
        if not lines:
            return [], []

        separators = [",", ";", "\t", "|"]
        best_separator = ","
        max_columns = 0
        
        first_line = lines[0].strip()
        for sep in separators:
            if sep in first_line:
                column_count = len(first_line.split(sep))
                if column_count > max_columns:
                    max_columns = column_count
                    best_separator = sep

        headers = [header.strip().replace('"', '') for header in first_line.split(best_separator)]
        
        data = []
        for line_num, line in enumerate(lines[1:], 2):
            line = line.strip()
            if not line:  
                continue
                
            parts = [part.strip().replace('"', '') for part in line.split(best_separator)]
            

            while len(parts) < len(headers):
                parts.append(None)
            parts = parts[:len(headers)]
            
            row_dict = {}
            for i, header in enumerate(headers):
                value = parts[i] if i < len(parts) else None

                if value is None or value == '' or value.lower() in ['null', 'nan', 'none']:
                    row_dict[header] = None
                else:
                    row_dict[header] = value
            
            data.append(row_dict)

        return headers, data

    except Exception as e:
        print(f"Error leyendo archivo RAM: {e}")
        return [], []

def format_size(size_bytes):
    """Convierte bytes a formato legible"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"

def get_file_type(filename):
    """Determina el tipo de archivo basado en la extensión"""
    extension = filename.lower().split('.')[-1] if '.' in filename else ''
    
    file_types = {
        'txt': 'Texto',
        'csv': 'CSV',
        'xlsx': 'Excel',
        'xls': 'Excel',
        'pdf': 'PDF',
        'doc': 'Word',
        'docx': 'Word',
        'ppt': 'PowerPoint',
        'pptx': 'PowerPoint',
        'jpg': 'Imagen',
        'jpeg': 'Imagen',
        'png': 'Imagen',
        'gif': 'Imagen',
        'zip': 'ZIP',
        'rar': 'RAR',
        '7z': '7-Zip',
        'mp3': 'Audio',
        'mp4': 'Video',
        'avi': 'Video',
        'mov': 'Video'
    }
    
    return file_types.get(extension, 'Archivo')

def calculate_compression_ratio(original_size, compressed_size):
    """Calcula el ratio de compresión"""
    if original_size == 0:
        return "0%"
    
    ratio = ((original_size - compressed_size) / original_size) * 100
    return f"{ratio:.1f}%"

def export_to_excel(data, selected_columns=None):
    """Exporta datos a Excel con columnas seleccionadas"""
    try:
        if not data:
            return None
            
        if selected_columns:
            filtered_data = []
            for row in data:
                filtered_row = {col: row.get(col) for col in selected_columns}
                filtered_data.append(filtered_row)
            data = filtered_data
        
        df = pd.DataFrame(data)
        
        df = df.fillna('')
        
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx")
        
        with pd.ExcelWriter(temp_file.name, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Datos', index=False)
            
            workbook = writer.book
            worksheet = writer.sheets['Datos']
            

            from openpyxl.styles import Font, PatternFill, Alignment
            
            header_font = Font(bold=True, color="FFFFFF")
            header_fill = PatternFill(start_color="007A33", end_color="007A33", fill_type="solid")
            header_alignment = Alignment(horizontal="center", vertical="center")
            
            for col_num, column_title in enumerate(df.columns, 1):
                cell = worksheet.cell(row=1, column=col_num)
                cell.font = header_font
                cell.fill = header_fill
                cell.alignment = header_alignment
                
   
                column_letter = cell.column_letter
                max_length = max(len(str(column_title)), 15)
                worksheet.column_dimensions[column_letter].width = min(max_length, 50)
        
        return temp_file.name
        
    except Exception as e:
        print(f"Error exportando a Excel: {e}")
        return None