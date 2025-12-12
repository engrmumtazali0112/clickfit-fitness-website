// Image Upload Handler with Drag & Drop - FIXED VERSION

$(document).ready(function() {
    
    const dropZone = $('#dropZone');
    const fileInput = $('#fileInput');
    const browseBtn = $('#browseBtn');
    const uploadStatus = $('#uploadStatus');
    const imagePreview = $('#imagePreview');
    
    // Server URL - change this to match your server
    const SERVER_URL = 'http://localhost:3000';
    
    // Click to browse files
    browseBtn.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
    });
    
    // Click on drop zone to browse
    dropZone.on('click', function(e) {
        if (e.target === this || $(e.target).hasClass('fa-cloud-upload-alt') || $(e.target).is('h4') || $(e.target).is('p')) {
            fileInput.click();
        }
    });
    
    // Handle file selection
    fileInput.on('change', function(e) {
        const files = e.target.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    });
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.on(eventName, function(e) {
            e.preventDefault();
            e.stopPropagation();
        });
    });
    
    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.on(eventName, function() {
            $(this).addClass('dragover');
        });
    });
    
    // Remove highlight when item leaves drop zone
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.on(eventName, function() {
            $(this).removeClass('dragover');
        });
    });
    
    // Handle dropped files
    dropZone.on('drop', function(e) {
        const dt = e.originalEvent.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleFiles(files);
        }
    });
    
    // Main function to handle files
    function handleFiles(files) {
        // Convert FileList to Array
        const fileArray = Array.from(files);
        
        // Filter only image files
        const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            showStatus('error', 'Please select valid image files (JPG, PNG, GIF, etc.)');
            return;
        }
        
        if (imageFiles.length > 10) {
            showStatus('error', 'Maximum 10 images can be uploaded at once.');
            return;
        }
        
        // Show loading status
        showStatus('loading', `Uploading ${imageFiles.length} image(s)...`);
        
        // Upload each file
        let uploadedCount = 0;
        imageFiles.forEach((file, index) => {
            uploadFile(file, index, imageFiles.length, function() {
                uploadedCount++;
                if (uploadedCount === imageFiles.length) {
                    showStatus('success', `Successfully uploaded ${imageFiles.length} image(s)!`);
                }
            });
        });
    }
    
    // Function to upload file to server
    function uploadFile(file, index, total, callback) {
        const formData = new FormData();
        formData.append('image', file);
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showStatus('error', `File ${file.name} is too large. Maximum size is 5MB.`);
            return;
        }
        
        // Make AJAX request to upload
        $.ajax({
            url: `${SERVER_URL}/upload`,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                const xhr = new window.XMLHttpRequest();
                
                // Upload progress
                xhr.upload.addEventListener('progress', function(e) {
                    if (e.lengthComputable) {
                        const percentComplete = Math.round((e.loaded / e.total) * 100);
                        console.log(`Upload progress for ${file.name}: ${percentComplete}%`);
                    }
                }, false);
                
                return xhr;
            },
            success: function(response) {
                console.log('Upload success:', response);
                
                // Preview uploaded image
                previewImage(file, response.filename);
                
                if (callback) callback();
            },
            error: function(xhr, status, error) {
                console.error('Upload error:', error);
                let errorMsg = 'Server error.';
                
                if (xhr.status === 0) {
                    errorMsg = 'Cannot connect to server. Make sure the server is running on port 3000.';
                } else if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMsg = xhr.responseJSON.error;
                }
                
                showStatus('error', `Failed to upload ${file.name}. ${errorMsg}`);
            }
        });
    }
    
    // Function to show upload status
    function showStatus(type, message) {
        uploadStatus.removeClass('upload-status success error loading');
        
        let icon = '';
        if (type === 'success') {
            icon = '<i class="fas fa-check-circle"></i> ';
            uploadStatus.addClass('upload-status success');
        } else if (type === 'error') {
            icon = '<i class="fas fa-exclamation-circle"></i> ';
            uploadStatus.addClass('upload-status error');
        } else if (type === 'loading') {
            icon = '<i class="fas fa-spinner fa-spin"></i> ';
            uploadStatus.addClass('upload-status loading');
        }
        
        uploadStatus.html(icon + message).fadeIn();
        
        // Auto hide after 5 seconds (except loading)
        if (type !== 'loading') {
            setTimeout(() => {
                uploadStatus.fadeOut();
            }, 5000);
        }
    }
    
    // Function to preview uploaded image
    function previewImage(file, filename) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const imageHtml = `
                <div class="col-md-3 col-sm-6 mb-3 fade-in">
                    <div class="image-preview-item">
                        <img src="${e.target.result}" alt="${filename}" class="img-fluid rounded">
                        <div class="image-overlay">
                            <p class="text-white small mb-0">${filename}</p>
                            <button class="btn btn-sm btn-danger mt-2 delete-image" data-filename="${filename}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            imagePreview.prepend(imageHtml);
            
            // Animate new image
            imagePreview.find('.col-md-3:first').hide().fadeIn(600);
        };
        
        reader.readAsDataURL(file);
    }
    
    // Delete image functionality
    imagePreview.on('click', '.delete-image', function() {
        const filename = $(this).data('filename');
        const imageItem = $(this).closest('.col-md-3');
        
        // Confirm deletion
        if (confirm(`Are you sure you want to delete ${filename}?`)) {
            // Send delete request to server
            $.ajax({
                url: `${SERVER_URL}/delete/${filename}`,
                method: 'DELETE',
                success: function(response) {
                    console.log('Delete success:', response);
                    
                    // Remove from preview
                    imageItem.fadeOut(400, function() {
                        $(this).remove();
                    });
                    
                    showStatus('success', 'Image deleted successfully!');
                },
                error: function(xhr, status, error) {
                    console.error('Delete error:', error);
                    showStatus('error', 'Failed to delete image.');
                }
            });
        }
    });
    
    // Add image overlay and drag styles
    const overlayCSS = `
        <style>
            .image-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                border-radius: 10px;
                padding: 10px;
                word-wrap: break-word;
            }
            
            .image-preview-item:hover .image-overlay {
                opacity: 1;
            }
            
            .image-preview-item {
                position: relative;
                overflow: hidden;
                border-radius: 10px;
            }
            
            .image-preview-item img {
                width: 100%;
                height: 250px;
                object-fit: cover;
            }
            
            .dragover {
                border-color: #50C878 !important;
                background: rgba(80, 200, 120, 0.1) !important;
                transform: scale(1.02);
                transition: all 0.3s ease;
            }
            
            .upload-status {
                padding: 15px;
                border-radius: 5px;
                margin-top: 15px;
                text-align: center;
                font-weight: bold;
            }
            
            .upload-status.success {
                background-color: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .upload-status.error {
                background-color: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            
            .upload-status.loading {
                background-color: #d1ecf1;
                color: #0c5460;
                border: 1px solid #bee5eb;
            }
            
            .drop-zone {
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .drop-zone:hover {
                border-color: #007bff !important;
                background: rgba(0, 123, 255, 0.05) !important;
            }
        </style>
    `;
    
    $('head').append(overlayCSS);
    
    // Log initialization
    console.log('✓ Upload handler initialized successfully!');
    console.log('✓ Server URL:', SERVER_URL);
    console.log('✓ Drag & drop ready');
    console.log('⚠ Make sure Node.js server is running: npm start');
});