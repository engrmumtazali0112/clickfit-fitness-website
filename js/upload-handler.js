// js/upload-handler.js - FIXED PORT 3000
$(document).ready(function() {
    const dropZone = $('#dropZone');
    const fileInput = $('#fileInput');
    const browseBtn = $('#browseBtn');
    const uploadStatus = $('#uploadStatus');
    const imagePreview = $('#imagePreview');
    
    // ✅ FIXED: Use port 3000 to match server
    const API_BASE = 'http://localhost:3000';
    const MAX_FILES = 10;
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    
    let uploadedFiles = [];

    console.log('📤 Upload handler initialized - Using:', API_BASE);

    // Click to browse
    browseBtn.on('click', function() {
        fileInput.click();
    });

    // File input change
    fileInput.on('change', function(e) {
        handleFiles(e.target.files);
    });

    // Drag and drop events
    dropZone.on('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('dragover');
    });

    dropZone.on('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('dragover');
    });

    dropZone.on('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('dragover');
        
        const files = e.originalEvent.dataTransfer.files;
        handleFiles(files);
    });

    function handleFiles(files) {
        if (files.length === 0) return;

        if (uploadedFiles.length + files.length > MAX_FILES) {
            showStatus(`Maximum ${MAX_FILES} files allowed!`, 'danger');
            return;
        }

        uploadStatus.html('');
        
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) {
                showStatus(`${file.name} is not an image file`, 'warning');
                return;
            }

            if (file.size > MAX_SIZE) {
                showStatus(`${file.name} exceeds 5MB limit`, 'warning');
                return;
            }

            uploadFile(file);
        });
    }

    function uploadFile(file) {
        const formData = new FormData();
        formData.append('image', file);

        const uploadId = Date.now() + Math.random();
        
        showUploadProgress(uploadId, file.name);

        $.ajax({
            url: `${API_BASE}/upload`,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                const xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        updateProgress(uploadId, percentComplete);
                    }
                }, false);
                return xhr;
            },
            success: function(response) {
                console.log('✅ Upload success:', response);
                if (response.success) {
                    uploadedFiles.push(response);
                    removeProgress(uploadId);
                    showImagePreview(response);
                    showStatus(`✅ ${file.name} uploaded successfully!`, 'success');
                } else {
                    removeProgress(uploadId);
                    showStatus(`❌ Failed to upload ${file.name}: ${response.error}`, 'danger');
                }
            },
            error: function(xhr, status, error) {
                removeProgress(uploadId);
                console.error('❌ Upload error:', {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    error: error,
                    response: xhr.responseText
                });
                
                let errorMsg = `❌ Failed to upload ${file.name}.`;
                if (xhr.status === 0) {
                    errorMsg += ' Cannot connect to server. Make sure server is running on port 3000!';
                } else if (xhr.status === 404) {
                    errorMsg += ' Upload endpoint not found.';
                } else if (xhr.status === 500) {
                    errorMsg += ' Server error.';
                } else {
                    errorMsg += ` Error: ${xhr.statusText}`;
                }
                
                showStatus(errorMsg, 'danger');
            }
        });
    }

    function showUploadProgress(id, filename) {
        const progressHtml = `
            <div id="progress-${id}" class="card mb-3 fade-in" data-aos="fade-up">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span><i class="fas fa-file-image text-primary me-2"></i>${filename}</span>
                        <span class="badge bg-info">Uploading...</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" 
                             role="progressbar" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        `;
        uploadStatus.append(progressHtml);
    }

    function updateProgress(id, percent) {
        $(`#progress-${id} .progress-bar`).css('width', percent + '%');
    }

    function removeProgress(id) {
        $(`#progress-${id}`).fadeOut(300, function() {
            $(this).remove();
        });
    }

    function showImagePreview(data) {
        const imageUrl = `${API_BASE}${data.url}`;
        const previewHtml = `
            <div class="col-md-4 col-sm-6 image-item" data-filename="${data.filename}" data-aos="zoom-in">
                <div class="card shadow-lg border-0" style="border-radius: 15px; overflow: hidden;">
                    <div class="position-relative">
                        <img src="${imageUrl}" class="card-img-top" alt="Uploaded image" 
                             style="height: 250px; object-fit: cover;">
                        <button class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 delete-image"
                                data-filename="${data.filename}"
                                style="border-radius: 50%; width: 40px; height: 40px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="card-body">
                        <h6 class="card-title text-truncate mb-2">
                            <i class="fas fa-image text-primary me-2"></i>${data.filename}
                        </h6>
                        <div class="d-flex justify-content-between text-muted small">
                            <span><i class="fas fa-weight-hanging me-1"></i>${formatBytes(data.size)}</span>
                            <span><i class="fas fa-file-code me-1"></i>${data.mimetype.split('/')[1].toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        imagePreview.append(previewHtml);
    }

    // Delete image
    $(document).on('click', '.delete-image', function() {
        const filename = $(this).data('filename');
        const imageItem = $(`.image-item[data-filename="${filename}"]`);
        
        if (confirm('Are you sure you want to delete this image?')) {
            $.ajax({
                url: `${API_BASE}/delete/${filename}`,
                type: 'DELETE',
                success: function(response) {
                    if (response.success) {
                        imageItem.fadeOut(300, function() {
                            $(this).remove();
                        });
                        uploadedFiles = uploadedFiles.filter(f => f.filename !== filename);
                        showStatus('✅ Image deleted successfully!', 'success');
                    } else {
                        showStatus('❌ Failed to delete image', 'danger');
                    }
                },
                error: function() {
                    showStatus('❌ Failed to delete image', 'danger');
                }
            });
        }
    });

    function showStatus(message, type) {
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        uploadStatus.prepend(alertHtml);
        
        setTimeout(function() {
            uploadStatus.find('.alert').first().fadeOut(300, function() {
                $(this).remove();
            });
        }, 5000);
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
});