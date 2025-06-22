from flask import Flask, render_template, request, send_file, jsonify
import os
from utils.file_parser import parse_uploaded_file, export_to_excel

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        file = request.files["file"]
        temp_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(temp_path)

        headers, data = parse_uploaded_file(temp_path)
        return render_template("preview.html", headers=headers, data=data, file=file.filename)

    return render_template("index.html")

@app.route("/documentacion")
def documentacion():
    return render_template("doc.html")

@app.route("/export", methods=["POST"])
def export():
    selected_columns = request.form.getlist("columns")
    filename = request.form["filename"]

    filepath = os.path.join(UPLOAD_FOLDER, filename)
    headers, data = parse_uploaded_file(filepath)

    filtered_data = [
        {col: row.get(col, "") for col in selected_columns} for row in data
    ]

    excel_path = export_to_excel(filtered_data)
    return send_file(excel_path, as_attachment=True, download_name="exportado.xlsx")

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
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "message": "File not found"})

if __name__ == "__main__":
    app.run(debug=True)