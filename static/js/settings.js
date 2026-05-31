document.addEventListener("DOMContentLoaded", () => {
    // Tab Navigation
    const tabLinks = document.querySelectorAll(".settings-nav li")
    const tabContents = document.querySelectorAll(".settings-tab")
  
    tabLinks.forEach((link) => {
      link.addEventListener("click", function () {
        // Remove active class from all tabs
        tabLinks.forEach((item) => item.classList.remove("active"))
        tabContents.forEach((item) => item.classList.remove("active"))
  
        // Add active class to clicked tab
        this.classList.add("active")
        const tabId = this.getAttribute("data-tab")
        document.getElementById(`${tabId}-tab`).classList.add("active")
      })
    })
  
    // Sidebar Toggle
    const sidebarToggle = document.getElementById("sidebarToggle")
    const sidebarClose = document.getElementById("sidebarClose")
    const sidebar = document.querySelector(".sidebar")
  
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        sidebar.classList.add("active")
      })
    }
  
    if (sidebarClose) {
      sidebarClose.addEventListener("click", () => {
        sidebar.classList.remove("active")
      })
    }
  
    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (event) => {
      const isClickInsideSidebar = sidebar.contains(event.target)
      const isClickOnToggle = sidebarToggle && sidebarToggle.contains(event.target)
  
      if (!isClickInsideSidebar && !isClickOnToggle && sidebar.classList.contains("active")) {
        sidebar.classList.remove("active")
      }
    })
  
    // Profile Picture Upload
    const uploadBtn = document.querySelector(".upload-btn")
    const removeBtn = document.querySelector(".remove-btn")
    const profilePicture = document.querySelector(".current-picture img")
  
    if (uploadBtn) {
      uploadBtn.addEventListener("click", () => {
        // Create a file input element
        const fileInput = document.createElement("input")
        fileInput.type = "file"
        fileInput.accept = "image/*"
  
        fileInput.addEventListener("change", (e) => {
          if (e.target.files.length > 0) {
            const file = e.target.files[0]
  
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
              showNotification("File size exceeds 2MB limit", "error")
              return
            }
  
            // Preview the image
            const reader = new FileReader()
            reader.onload = (event) => {
              profilePicture.src = event.target.result
              showNotification("Profile picture updated", "success")
            }
            reader.readAsDataURL(file)
          }
        })
  
        fileInput.click()
      })
    }
  
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        // Reset to default avatar
        profilePicture.src = "https://via.placeholder.com/150"
        showNotification("Profile picture removed", "success")
      })
    }
  
    // Password Validation
    const newPasswordInput = document.getElementById("newPassword")
    const passwordRequirements = document.querySelectorAll(".requirement")
  
    if (newPasswordInput) {
      newPasswordInput.addEventListener("input", function () {
        const password = this.value
  
        // Check length
        if (password.length >= 8) {
          passwordRequirements[0].classList.add("met")
        } else {
          passwordRequirements[0].classList.remove("met")
        }
  
        // Check uppercase
        if (/[A-Z]/.test(password)) {
          passwordRequirements[1].classList.add("met")
        } else {
          passwordRequirements[1].classList.remove("met")
        }
  
        // Check number
        if (/[0-9]/.test(password)) {
          passwordRequirements[2].classList.add("met")
        } else {
          passwordRequirements[2].classList.remove("met")
        }
  
        // Check special character
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
          passwordRequirements[3].classList.add("met")
        } else {
          passwordRequirements[3].classList.remove("met")
        }
      })
    }
  
    // Save Form Changes
    const saveButtons = document.querySelectorAll(".save-btn")
  
    if (saveButtons.length > 0) {
      saveButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          showNotification("Changes saved successfully", "success")
        })
      })
    }
  
    // Notification System
    function showNotification(message, type = "info") {
      // Create notification element
      const notification = document.createElement("div")
      notification.className = `notification ${type}`
  
      // Set icon based on type
      let icon = "info-circle"
      if (type === "success") icon = "check-circle"
      if (type === "error") icon = "exclamation-circle"
      if (type === "warning") icon = "exclamation-triangle"
  
      notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button class="close-btn"><i class="fas fa-times"></i></button>
      `
  
      // Add to DOM
      const notificationsContainer = document.querySelector(".notifications-container")
      if (!notificationsContainer) {
        const container = document.createElement("div")
        container.className = "notifications-container"
        document.body.appendChild(container)
        container.appendChild(notification)
      } else {
        notificationsContainer.appendChild(notification)
      }
  
      // Add close button functionality
      const closeBtn = notification.querySelector(".close-btn")
      closeBtn.addEventListener("click", () => {
        notification.classList.add("fade-out")
        setTimeout(() => {
          notification.remove()
        }, 300)
      })
  
      // Auto remove after 5 seconds
      setTimeout(() => {
        notification.classList.add("fade-out")
        setTimeout(() => {
          notification.remove()
        }, 300)
      }, 5000)
    }
  
    // Add notification container styles if not already present
    if (!document.getElementById("notification-styles")) {
      const style = document.createElement("style")
      style.id = "notification-styles"
      style.textContent = `
        .notifications-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 350px;
        }
        
        .notification {
          background-color: white;
          border-radius: 5px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: slide-in 0.3s ease;
          transition: opacity 0.3s ease;
        }
        
        .notification.fade-out {
          opacity: 0;
        }
        
        .notification i {
          font-size: 1.2em;
        }
        
        .notification span {
          flex: 1;
        }
        
        .notification .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6c757d;
          padding: 0;
          font-size: 0.9em;
        }
        
        .notification.info i {
          color: #0056b3;
        }
        
        .notification.success i {
          color: #28a745;
        }
        
        .notification.error i {
          color: #dc3545;
        }
        
        .notification.warning i {
          color: #ffc107;
        }
        
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `
      document.head.appendChild(style)
    }
  })
  