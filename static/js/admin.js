// Admin Dashboard JavaScript

document.addEventListener("DOMContentLoaded", () => {
    // Sidebar toggle functionality
    const sidebarToggle = document.getElementById("sidebarToggle")
    const sidebar = document.querySelector(".sidebar")
  
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed")
      })
    }
  
    // User management actions
    setupUserActions()
  
    // Report management
    setupReportActions()
  
    // Announcement form submission
    const announcementForm = document.getElementById("announcement-form")
    if (announcementForm) {
      announcementForm.addEventListener("submit", (e) => {
        e.preventDefault()
  
        // Get form data
        const title = document.getElementById("announcement-title").value
        const content = document.getElementById("announcement-content").value
        const isImportant = document.getElementById("announcement-important").checked
        const sendEmail = document.getElementById("announcement-email").checked
  
        // Validate form
        if (!title.trim() || !content.trim()) {
          alert("Please fill in all required fields")
          return
        }
  
        // Submit announcement
        submitAnnouncement({
          title,
          content,
          isImportant,
          sendEmail,
        })
      })
    }
  
    // Initialize charts and statistics
    initializeCharts()
  })
  
  // Setup user management actions
  function setupUserActions() {
    // View user details
    const viewUserButtons = document.querySelectorAll(".view-user")
    if (viewUserButtons.length > 0) {
      viewUserButtons.forEach((button) => {
        button.addEventListener("click", function () {
          const userId = this.getAttribute("data-id")
          openUserDetailsModal(userId)
        })
      })
    }
  
    // Edit user
    const editUserButtons = document.querySelectorAll(".edit-user")
    if (editUserButtons.length > 0) {
      editUserButtons.forEach((button) => {
        button.addEventListener("click", function () {
          const userId = this.getAttribute("data-id")
          // In a real app, this would open an edit user modal
          alert(`Edit user with ID: ${userId}`)
        })
      })
    }
  
    // Ban user
    const banUserButtons = document.querySelectorAll(".ban-user")
    if (banUserButtons.length > 0) {
      banUserButtons.forEach((button) => {
        button.addEventListener("click", function () {
          const userId = this.getAttribute("data-id")
          if (confirm("Are you sure you want to ban this user? They will no longer be able to access the platform.")) {
            banUser(userId)
          }
        })
      })
    }
  
    // Unban user
    const unbanUserButtons = document.querySelectorAll(".unban-user")
    if (unbanUserButtons.length > 0) {
      unbanUserButtons.forEach((button) => {
        button.addEventListener("click", function () {
          const userId = this.getAttribute("data-id")
          if (confirm("Are you sure you want to unban this user? They will regain access to the platform.")) {
            unbanUser(userId)
          }
        })
      })
    }
  }
  
  // Setup report management actions
  function setupReportActions() {
    // View reported note
    const viewNoteButtons = document.querySelectorAll(".report-actions .btn-primary")
    if (viewNoteButtons.length > 0) {
      viewNoteButtons.forEach((button) => {
        button.addEventListener("click", () => {
          // In a real app, this would open the reported note
          alert("Viewing reported note...")
        })
      })
    }
  
    // Remove reported note
    const removeNoteButtons = document.querySelectorAll(".report-actions .btn-danger")
    if (removeNoteButtons.length > 0) {
      removeNoteButtons.forEach((button) => {
        button.addEventListener("click", function () {
          const reportCard = this.closest(".report-card")
          if (confirm("Are you sure you want to remove this note? This action cannot be undone.")) {
            // In a real app, this would call an API to remove the note
            if (reportCard) {
              reportCard.style.opacity = "0"
              setTimeout(() => {
                reportCard.remove()
  
                // Update report count
                updateReportCount()
              }, 300)
            }
          }
        })
      })
    }
  
    // Dismiss report
    const dismissReportButtons = document.querySelectorAll(".report-actions .btn-outline")
    if (dismissReportButtons.length > 0) {
      dismissReportButtons.forEach((button) => {
        button.addEventListener("click", function () {
          const reportCard = this.closest(".report-card")
          if (confirm("Are you sure you want to dismiss this report?")) {
            // In a real app, this would call an API to dismiss the report
            if (reportCard) {
              reportCard.style.opacity = "0"
              setTimeout(() => {
                reportCard.remove()
  
                // Update report count
                updateReportCount()
              }, 300)
            }
          }
        })
      })
    }
  }
  
  // Open user details modal
  function openUserDetailsModal(userId) {
    const modal = document.getElementById("user-details-modal")
  
    if (modal) {
      // In a real app, this would fetch the user data from an API
      // For demo, we'll use hardcoded data based on the user ID
      let userData = {}
  
      if (userId === "1") {
        userData = {
          name: "Zainab Malik",
          email: "zainab.malik@nu.edu.pk",
          semester: "6th Semester",
          joined: "May 15, 2024",
          status: "active",
          uploads: 8,
          downloads: 42,
          rating: 4.7,
          reports: 0,
        }
      } else if (userId === "2") {
        userData = {
          name: "Usman Khan",
          email: "usman.khan@nu.edu.pk",
          semester: "7th Semester",
          joined: "May 14, 2024",
          status: "active",
          uploads: 12,
          downloads: 78,
          rating: 4.5,
          reports: 0,
        }
      } else if (userId === "3") {
        userData = {
          name: "Ali Hassan",
          email: "ali.hassan@nu.edu.pk",
          semester: "5th Semester",
          joined: "May 12, 2024",
          status: "banned",
          uploads: 5,
          downloads: 23,
          rating: 3.8,
          reports: 2,
        }
      } else if (userId === "4") {
        userData = {
          name: "Fatima Ali",
          email: "fatima.ali@nu.edu.pk",
          semester: "8th Semester",
          joined: "May 10, 2024",
          status: "active",
          uploads: 15,
          downloads: 92,
          rating: 4.9,
          reports: 0,
        }
      } else if (userId === "5") {
        userData = {
          name: "Ahmed Khan",
          email: "ahmed.khan@nu.edu.pk",
          semester: "6th Semester",
          joined: "May 8, 2024",
          status: "active",
          uploads: 7,
          downloads: 35,
          rating: 4.2,
          reports: 1,
        }
      }
  
      // Populate the modal
      document.getElementById("modal-user-name").textContent = userData.name
      document.getElementById("modal-user-email").textContent = userData.email
      document.getElementById("modal-user-semester").textContent = userData.semester
      document.getElementById("modal-user-joined").textContent = `Joined: ${userData.joined}`
  
      const statusBadge = document.getElementById("modal-user-status")
      statusBadge.textContent = userData.status === "active" ? "Active" : "Banned"
      statusBadge.className = `status-badge ${userData.status}`
  
      document.getElementById("modal-user-uploads").textContent = userData.uploads
      document.getElementById("modal-user-downloads").textContent = userData.downloads
      document.getElementById("modal-user-rating").textContent = userData.rating
      document.getElementById("modal-user-reports").textContent = userData.reports
  
      // Update action buttons
      const banButton = document.getElementById("modal-ban-user")
      if (userData.status === "active") {
        banButton.textContent = "Ban User"
        banButton.className = "btn btn-warning"
      } else {
        banButton.textContent = "Unban User"
        banButton.className = "btn btn-primary"
      }
  
      // Show the modal
      modal.classList.add("active")
  
      // Add event listener to close button
      const closeButton = modal.querySelector(".modal-close")
      if (closeButton) {
        closeButton.addEventListener("click", () => {
          modal.classList.remove("active")
        })
      }
  
      // Close modal when clicking outside
      window.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active")
        }
      })
  
      // Add event listeners to action buttons
      const editButton = document.getElementById("modal-edit-user")
      if (editButton) {
        editButton.addEventListener("click", () => {
          alert(`Edit user: ${userData.name}`)
          modal.classList.remove("active")
        })
      }
  
      if (banButton) {
        banButton.addEventListener("click", () => {
          if (userData.status === "active") {
            if (confirm(`Are you sure you want to ban ${userData.name}?`)) {
              banUser(userId)
              modal.classList.remove("active")
            }
          } else {
            if (confirm(`Are you sure you want to unban ${userData.name}?`)) {
              unbanUser(userId)
              modal.classList.remove("active")
            }
          }
        })
      }
  
      const deleteButton = document.getElementById("modal-delete-user")
      if (deleteButton) {
        deleteButton.addEventListener("click", () => {
          if (confirm(`Are you sure you want to delete ${userData.name}? This action cannot be undone.`)) {
            deleteUser(userId)
            modal.classList.remove("active")
          }
        })
      }
    }
  }
  
  // Ban user function
  function banUser(userId) {
    // Show loading state
    const banButton = document.querySelector(`.ban-user[data-id="${userId}"]`)
    if (banButton) {
      const originalHTML = banButton.innerHTML
      banButton.disabled = true
      banButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
  
      // Simulate API call delay
      setTimeout(() => {
        // In a real app, this would call an API to ban the user
  
        // Update the user status in the UI
        const userRow = banButton.closest("tr")
        if (userRow) {
          const statusBadge = userRow.querySelector(".status-badge")
          if (statusBadge) {
            statusBadge.textContent = "Banned"
            statusBadge.className = "status-badge banned"
          }
  
          // Replace ban button with unban button
          const actionButtons = userRow.querySelector(".action-buttons")
          if (actionButtons) {
            actionButtons.innerHTML = actionButtons.innerHTML.replace(
              `<button class="action-btn ban-user" data-id="${userId}">
                <i class="fas fa-ban"></i>
              </button>`,
              `<button class="action-btn unban-user" data-id="${userId}">
                <i class="fas fa-check"></i>
              </button>`,
            )
  
            // Setup the new unban button
            const unbanButton = actionButtons.querySelector(".unban-user")
            if (unbanButton) {
              unbanButton.addEventListener("click", function () {
                const userId = this.getAttribute("data-id")
                if (confirm("Are you sure you want to unban this user? They will regain access to the platform.")) {
                  unbanUser(userId)
                }
              })
            }
          }
        }
  
        // Show success message
        alert("User has been banned successfully.")
      }, 1500)
    }
  }
  
  // Unban user function
  function unbanUser(userId) {
    // Show loading state
    const unbanButton = document.querySelector(`.unban-user[data-id="${userId}"]`)
    if (unbanButton) {
      const originalHTML = unbanButton.innerHTML
      unbanButton.disabled = true
      unbanButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
  
      // Simulate API call delay
      setTimeout(() => {
        // In a real app, this would call an API to unban the user
  
        // Update the user status in the UI
        const userRow = unbanButton.closest("tr")
        if (userRow) {
          const statusBadge = userRow.querySelector(".status-badge")
          if (statusBadge) {
            statusBadge.textContent = "Active"
            statusBadge.className = "status-badge active"
          }
  
          // Replace unban button with ban button
          const actionButtons = userRow.querySelector(".action-buttons")
          if (actionButtons) {
            actionButtons.innerHTML = actionButtons.innerHTML.replace(
              `<button class="action-btn unban-user" data-id="${userId}">
                <i class="fas fa-check"></i>
              </button>`,
              `<button class="action-btn ban-user" data-id="${userId}">
                <i class="fas fa-ban"></i>
              </button>`,
            )
  
            // Setup the new ban button
            const banButton = actionButtons.querySelector(".ban-user")
            if (banButton) {
              banButton.addEventListener("click", function () {
                const userId = this.getAttribute("data-id")
                if (
                  confirm("Are you sure you want to ban this user? They will no longer be able to access the platform.")
                ) {
                  banUser(userId)
                }
              })
            }
          }
        }
  
        // Show success message
        alert("User has been unbanned successfully.")
      }, 1500)
    }
  }
  
  // Delete user function
  function deleteUser(userId) {
    // In a real app, this would call an API to delete the user
  
    // Remove the user row from the UI
    const userRow = document.querySelector(`.view-user[data-id="${userId}"]`).closest("tr")
    if (userRow) {
      userRow.style.opacity = "0"
      setTimeout(() => {
        userRow.remove()
      }, 300)
    }
  
    // Show success message
    alert("User has been deleted successfully.")
  }
  
  // Update report count
  function updateReportCount() {
    const reportsList = document.querySelector(".reports-list")
    const reportCount = reportsList ? reportsList.children.length : 0
  
    // Update the report count in the UI
    const reportBadge = document.querySelector(".sidebar-nav .badge")
    if (reportBadge) {
      reportBadge.textContent = reportCount
    }
  
    const reportStatValue = document.querySelector(".stat-info h3")
    if (reportStatValue) {
      reportStatValue.textContent = reportCount
    }
  
    // If no reports left, show empty state
    if (reportCount === 0 && reportsList) {
      reportsList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success-color); margin-bottom: 1rem;"></i>
          <h3>No Pending Reports</h3>
          <p>All reports have been handled. Great job!</p>
        </div>
      `
    }
  }
  
  // Submit announcement function
  function submitAnnouncement(announcementData) {
    // Show loading state
    const submitButton = document.querySelector('#announcement-form button[type="submit"]')
    const originalText = submitButton.textContent
    submitButton.disabled = true
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...'
  
    // Simulate API call delay
    setTimeout(() => {
      // In a real app, this would call an API to create the announcement
      
      // Show success message
      submitButton.innerHTML = '<i class="fas fa-check"></i> Posted!'
      
      // Create announcement preview
      const announcementPreview = document.createElement("div")
      announcementPreview.className = "announcement-preview"
      announcementPreview.innerHTML = `
        <div class="announcement-card ${announcementData.isImportant ? 'important' : ''}">
          <div class="announcement-header">
            <h4>${announcementData.title}</h4>
            <span class="announcement-date">Just now</span>
          </div>
          <div class="announcement-content">
            <p>${announcementData.content}</p>
          </div>
          <div class="announcement-footer">
            <span class="announcement-author">Posted by: Admin</span>
            ${announcementData.sendEmail ? '<span class="email-sent"><i class="fas fa-envelope"></i> Email sent to all users</span>' : ''}
          </div>
        </div>
      `
      
      // Add the preview after the form
      document.getElementById("announcement-form").after(announcementPreview)
      
      // Reset form after a delay
      setTimeout(() => {
        document.getElementById("announcement-form").reset()
        submitButton.disabled = false
        submitButton.textContent = originalText
        
        // Remove preview after a delay
        setTimeout(() => {
          announcementPreview.style.opacity = "0"
          setTimeout(() => {
            announcementPreview.remove()
          }, 300)
        }, 3000)
      }, 1500)
    }\
  }
  
  // Initialize charts and statistics
  function initializeCharts() {
    // In a real app, this would initialize charts using a library like Chart.js
    console.log("Charts initialized")
  
    // For demo purposes, we'll add some animation to the stats
    animateStats()
  }
  
  // Animate the statistics counters
  function animateStats() {
    const statValues = document.querySelectorAll(".stat-info h3")
  
    statValues.forEach((stat) => {
      const finalValue = Number.parseInt(stat.textContent.replace(/,/g, ""))
      animateValue(stat, 0, finalValue, 2000)
    })
  }
  
  // Helper function to animate a counter
  function animateValue(element, start, end, duration) {
    let startTimestamp = null
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
  
      // Format the number with commas if it's large
      let value = Math.floor(progress * (end - start) + start)
      if (value > 999) {
        value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      }
  
      element.textContent = value
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }
  