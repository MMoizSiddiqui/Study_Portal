// Upload Notes Page JavaScript

document.addEventListener("DOMContentLoaded", () => {
    const uploadForm = document.getElementById("upload-form")
    const fileUpload = document.getElementById("file-upload")
    const fileUploadArea = document.getElementById("file-upload-area")
    const filePreview = document.getElementById("file-preview")
    const previewFileName = document.getElementById("preview-file-name")
    const previewFileSize = document.getElementById("preview-file-size")
    const removeFileBtn = document.getElementById("remove-file")
    const cancelUploadBtn = document.getElementById("cancel-upload")
  
    // File upload handling
    if (fileUpload) {
      // Handle file selection
      fileUpload.addEventListener("change", function (e) {
        const file = this.files[0]
  
        if (file) {
          // Validate file type
          const fileType = file.type
          const validTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          ]
  
          if (!validTypes.includes(fileType)) {
            showError(this, "Please select a PDF, DOCX, or PPT file")
            return
          }
  
          // Validate file size (max 50MB)
          if (file.size > 50 * 1024 * 1024) {
            showError(this, "File size should not exceed 50MB")
            return
          }
  
          // Clear any errors
          clearError(this)
  
          // Update file preview
          fileUploadArea.style.display = "none"
          filePreview.style.display = "flex"
  
          // Update file icon based on type
          const fileIcon = filePreview.querySelector(".file-icon")
          if (fileType.includes("pdf")) {
            fileIcon.className = "file-icon fas fa-file-pdf"
          } else if (fileType.includes("word")) {
            fileIcon.className = "file-icon fas fa-file-word"
          } else if (fileType.includes("powerpoint")) {
            fileIcon.className = "file-icon fas fa-file-powerpoint"
          }
  
          // Update file name and size
          previewFileName.textContent = file.name
          previewFileSize.textContent = formatFileSize(file.size)
        }
      })
  
      // Handle drag and drop
      ;["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        fileUploadArea.addEventListener(eventName, preventDefaults, false)
      })
  
      function preventDefaults(e) {
        e.preventDefault()
        e.stopPropagation()
      }
      ;["dragenter", "dragover"].forEach((eventName) => {
        fileUploadArea.addEventListener(eventName, highlight, false)
      })
      ;["dragleave", "drop"].forEach((eventName) => {
        fileUploadArea.addEventListener(eventName, unhighlight, false)
      })
  
      function highlight() {
        fileUploadArea.classList.add("highlight")
      }
  
      function unhighlight() {
        fileUploadArea.classList.remove("highlight")
      }
  
      fileUploadArea.addEventListener("drop", handleDrop, false)
  
      function handleDrop(e) {
        const dt = e.dataTransfer
        const file = dt.files[0]
        fileUpload.files = dt.files
  
        // Trigger change event
        const event = new Event("change")
        fileUpload.dispatchEvent(event)
      }
  
      // Remove file button
      if (removeFileBtn) {
        removeFileBtn.addEventListener("click", () => {
          fileUpload.value = ""
          filePreview.style.display = "none"
          fileUploadArea.style.display = "block"
        })
      }
    }
  
    // Cancel upload button
    if (cancelUploadBtn) {
      cancelUploadBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to cancel this upload?")) {
          window.location.href = "dashboard.html"
        }
      })
    }
  
    // Form submission
    if (uploadForm) {
      uploadForm.addEventListener("submit", (e) => {
        // e.preventDefault() // Remove this line to allow normal form submission
        // ... keep validation if you want, but do not block submission ...
        // Remove the call to simulateUpload(...)
        // If you want to keep client-side validation, only preventDefault if validation fails
        // Otherwise, let the form submit to the backend
      })
    }
  })
  
  // Helper function to format file size
  function formatFileSize(bytes) {
    if (bytes < 1024) {
      return bytes + " B"
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + " KB"
    } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + " MB"
    } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB"
    }
  }
  
  // Helper function to display errors
  function showError(inputElement, message) {
    const errorId = inputElement.id + "-error"
    const errorElement = document.getElementById(errorId)
  
    if (errorElement) {
      errorElement.textContent = message
      errorElement.style.display = "block"
    }
  
    // Highlight the input
    if (inputElement.type === "file") {
      document.getElementById("file-upload-area").classList.add("error")
    } else {
      inputElement.classList.add("error")
    }
  }
  
  // Helper function to clear errors
  function clearError(inputElement) {
    const errorId = inputElement.id + "-error"
    const errorElement = document.getElementById(errorId)
  
    if (errorElement) {
      errorElement.textContent = ""
      errorElement.style.display = "none"
    }
  
    // Remove highlight
    if (inputElement.type === "file") {
      document.getElementById("file-upload-area").classList.remove("error")
    } else {
      inputElement.classList.remove("error")
    }
  }
  
  // Simulate upload (in a real app, this would call an API)
  function simulateUpload(title, course, semester, file) {
    // Show loading state
    const submitButton = document.getElementById("submit-upload")
    const originalText = submitButton.textContent
    submitButton.disabled = true
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...'
  
    // Create a progress bar
    const uploadForm = document.getElementById("upload-form")
    const progressContainer = document.createElement("div")
    progressContainer.className = "upload-progress"
    progressContainer.innerHTML = `
      <p>Uploading ${file.name}...</p>
      <div class="progress-bar-container">
        <div class="progress-bar" id="upload-progress-bar"></div>
      </div>
      <p id="upload-progress-text">0%</p>
    `
    uploadForm.appendChild(progressContainer)
  
    const progressBar = document.getElementById("upload-progress-bar")
    const progressText = document.getElementById("upload-progress-text")
  
    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10
      if (progress > 100) progress = 100
  
      progressBar.style.width = progress + "%"
      progressText.textContent = Math.round(progress) + "%"
  
      if (progress === 100) {
        clearInterval(interval)
  
        // Show success message
        submitButton.innerHTML = '<i class="fas fa-check"></i> Upload Complete!'
        progressContainer.innerHTML = `
          <p class="success-message"><i class="fas fa-check-circle"></i> ${file.name} uploaded successfully!</p>
        `
  
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 2000)
      }
    }, 200)
  }
  