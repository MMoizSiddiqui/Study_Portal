// Dashboard Page JavaScript

document.addEventListener("DOMContentLoaded", () => {
    // Load user data from localStorage (in a real app, this would come from an API)
    const userData = JSON.parse(localStorage.getItem("user")) || {
      name: "John Doe",
      email: "john.doe@example.com",
      semester: "5",
      avatar: "images/default-avatar.png",
    }
  
    // Update user information in the UI
    updateUserInfo(userData)
  
    // Initialize dashboard components
    initializeCharts()
  
    // Handle notifications
    const notificationsIcon = document.querySelector(".notifications")
    if (notificationsIcon) {
      notificationsIcon.addEventListener("click", () => {
        alert("Notifications feature coming soon!")
      })
    }
  })
  
  // Update user information in the UI
  function updateUserInfo(userData) {
    // Update sidebar user info
    const userNameElements = document.querySelectorAll("#user-name, #welcome-name")
    const userSemesterElements = document.querySelectorAll("#user-semester")
    const userAvatarElements = document.querySelectorAll("#user-avatar, #header-avatar")
  
    userNameElements.forEach((element) => {
      if (element) element.textContent = userData.name.split(" ")[0]
    })
  
    userSemesterElements.forEach((element) => {
      if (element) element.textContent = `Semester ${userData.semester}`
    })
  
    userAvatarElements.forEach((element) => {
      if (element) element.src = userData.avatar
    })
  }
  
  // Initialize charts and statistics (placeholder for now)
  function initializeCharts() {
    // In a real app, this would initialize charts using a library like Chart.js
    console.log("Charts initialized")
  
    // For demo purposes, we'll add some animation to the stats
    animateStats()
  }
  
  // Animate the statistics counters
  function animateStats() {
    const statValues = document.querySelectorAll(".stat-info h4")
  
    statValues.forEach((stat) => {
      const finalValue = Number.parseInt(stat.textContent)
      animateValue(stat, 0, finalValue, 1500)
    })
  }
  
  // Helper function to animate a counter
  function animateValue(element, start, end, duration) {
    let startTimestamp = null
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      const value = Math.floor(progress * (end - start) + start)
      element.textContent = value
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }
  