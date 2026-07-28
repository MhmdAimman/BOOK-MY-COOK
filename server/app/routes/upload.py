import os
import uuid
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

upload_bp = Blueprint("upload", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@upload_bp.route("/image", methods=["POST"])
@jwt_required()
def upload_image():
    if "image" not in request.files:
        return jsonify({"message": "No image file provided"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"message": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify(
            {
                "message": f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            }
        ), 400

    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)

    if file_size > MAX_FILE_SIZE:
        return jsonify(
            {
                "message": f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB"
            }
        ), 400

    upload_folder = os.path.join(current_app.root_path, "..", "uploads", "services")
    os.makedirs(upload_folder, exist_ok=True)

    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(upload_folder, filename)

    file.save(filepath)

    image_url = f"/uploads/services/{filename}"

    return jsonify(
        {
            "message": "Image uploaded successfully",
            "url": image_url,
            "filename": filename,
        }
    ), 200


@upload_bp.route("/profile-image", methods=["POST"])
@jwt_required()
def upload_profile_image():
    if "image" not in request.files:
        return jsonify({"message": "No image file provided"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"message": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify(
            {
                "message": f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            }
        ), 400

    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)

    if file_size > MAX_FILE_SIZE:
        return jsonify(
            {
                "message": f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB"
            }
        ), 400

    upload_folder = os.path.join(current_app.root_path, "..", "uploads", "profiles")
    os.makedirs(upload_folder, exist_ok=True)

    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(upload_folder, filename)

    file.save(filepath)

    image_url = f"/uploads/profiles/{filename}"

    return jsonify(
        {
            "message": "Profile image uploaded successfully",
            "url": image_url,
            "filename": filename,
        }
    ), 200


@upload_bp.route("/images", methods=["POST"])
@jwt_required()
def upload_images():
    if "images" not in request.files:
        return jsonify({"message": "No image files provided"}), 400

    files = request.files.getlist("images")

    if len(files) == 0:
        return jsonify({"message": "No files selected"}), 400

    if len(files) > 5:
        return jsonify({"message": "Maximum 5 images allowed"}), 400

    uploaded_urls = []
    upload_folder = os.path.join(current_app.root_path, "..", "uploads", "services")
    os.makedirs(upload_folder, exist_ok=True)

    for file in files:
        if file.filename == "":
            continue

        if not allowed_file(file.filename):
            continue

        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)

        if file_size > MAX_FILE_SIZE:
            continue

        ext = file.filename.rsplit(".", 1)[1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(upload_folder, filename)

        file.save(filepath)
        uploaded_urls.append(f"/uploads/services/{filename}")

    return jsonify(
        {
            "message": f"{len(uploaded_urls)} images uploaded successfully",
            "urls": uploaded_urls,
        }
    ), 200
