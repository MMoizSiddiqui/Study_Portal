// Login Page JavaScript

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form")
  
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault()
  
        // Get form inputs
        const email = document.getElementById("email")
        const password = document.getElementById("password")
  
        // Validate email
        if (!email.value.trim()) {
          showError(email, "Email is required")
          return
        } else if (!isValidEmail(email.value)) {
          showError(email, "Please enter a valid email address")
          return
        } else {
          clearError(email)
        }
  
        // Validate password
        if (!password.value) {
          showError(password, "Password is required")
          return
        } else {
          clearError(password)
        }
  
        // If validation passes, simulate login
        simulateLogin(email.value, password.value)
      })
  
      // Clear errors on input
      const inputs = loginForm.querySelectorAll("input")
      inputs.forEach((input) => {
        input.addEventListener("input", function () {
          clearError(this)
        })
      })
    }
  })
  
  // Email validation function
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  // Show error message
  function showError(input, message) {
    const formControl = input.parentElement
    formControl.className = "form-control error"
    const small = formControl.querySelector("small")
    small.innerText = message
  }
  
  // Clear error message
  function clearError(input) {
    const formControl = input.parentElement
    formControl.className = "form-control"
  }
  
  // Simulate login (in a real app, this would call an API)
  function simulateLogin(email, password) {
    // Show loading state
    const submitButton = document.querySelector('#login-form button[type="submit"]')
    const originalText = submitButton.textContent
    submitButton.disabled = true
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...'
  
    // Simulate API call delay
    setTimeout(() => {
      // In a real app, this would be an API call to verify credentials
      // For demo purposes, we'll just redirect to dashboard
      submitButton.innerHTML = '<i class="fas fa-check"></i> Success!'
  
      // Store user info in localStorage (for demo purposes only)
      const userInfo = {
        name: "John Doe",
        email: email,
        semester: "5",
        avatar: "images/default-avatar.png",
      }
      localStorage.setItem("user", JSON.stringify(userInfo))
  
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = "dashboard.html"
      }, 1000)
    }, 2000)
  }
  