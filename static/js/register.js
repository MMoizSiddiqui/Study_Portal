// Registration Page JavaScript

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form")
  
    // Helper function to display errors
    function showError(inputElement, message) {
      const errorElement = inputElement.nextElementSibling
      if (errorElement && errorElement.classList.contains("error-message")) {
        errorElement.textContent = message
      } else {
        const newErrorElement = document.createElement("div")
        newErrorElement.className = "error-message"
        newErrorElement.textContent = message
        inputElement.parentNode.insertBefore(newErrorElement, inputElement.nextSibling)
      }
      inputElement.classList.add("error")
    }
  
    // Helper function to clear errors
    function clearError(inputElement) {
      const errorElement = inputElement.nextElementSibling
      if (errorElement && errorElement.classList.contains("error-message")) {
        errorElement.remove()
      }
      inputElement.classList.remove("error")
    }
  
    if (registerForm) {
      // Password strength checker
      const passwordInput = document.getElementById("password")
      const confirmPasswordInput = document.getElementById("confirm-password")
      const strengthMeter = document.querySelector(".strength-meter-fill")
      const requirements = document.querySelectorAll(".password-requirements li")
  
      if (passwordInput) {
        passwordInput.addEventListener("input", function () {
          const password = this.value
          const strength = checkPasswordStrength(password)
  
          // Update strength meter
          strengthMeter.setAttribute("data-strength", strength)
  
          // Update requirements
          const hasLength = password.length >= 8
          const hasLetter = /[a-zA-Z]/.test(password)
          const hasNumber = /[0-9]/.test(password)
          const hasSpecial = /[^a-zA-Z0-9]/.test(password)
  
          updateRequirement(requirements[0], hasLength)
          updateRequirement(requirements[1], hasLetter)
          updateRequirement(requirements[2], hasNumber)
          updateRequirement(requirements[3], hasSpecial)
        })
      }
  
      // Profile picture preview
      const profilePicture = document.getElementById("profile-picture")
      const previewImage = document.getElementById("preview-image")
  
      if (profilePicture && previewImage) {
        profilePicture.addEventListener("change", function () {
          const file = this.files[0]
  
          if (file) {
            // Validate file type
            const fileType = file.type
            if (fileType !== "image/jpeg" && fileType !== "image/png") {
              showError(this, "Please select a JPG or PNG image")
              return
            }
  
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
              showError(this, "Image size should not exceed 2MB")
              return
            }
  
            // Clear any errors
            clearError(this)
  
            // Show preview
            const reader = new FileReader()
            reader.onload = (e) => {
              previewImage.src = e.target.result
              previewImage.style.display = "block"
            }
            reader.readAsDataURL(file)
          }
        })
      }
  
      // Form submission
      // registerForm.addEventListener("submit", (e) => {
      //   e.preventDefault()
      //
      //   // Get form inputs
      //   const name = document.getElementById("name")
      //   const email = document.getElementById("email")
      //   const password = document.getElementById("password")
      //   const confirmPassword = document.getElementById("confirm-password")
      //   const semester = document.getElementById("semester")
      //   const terms = document.getElementById("terms")
      //
      //   // Validate name (only alphabets, min 3 characters)
      //   if (!name.value.trim()) {
      //     showError(name, "Name is required")
      //     return
      //   } else if (name.value.length < 3) {
      //     showError(name, "Name must be at least 3 characters")
      //     return
      //   } else if (!/^[a-zA-Z\s]+$/.test(name.value)) {
      //     showError(name, "Name must contain only alphabets")
      //     return
      //   } else {
      //     clearError(name)
      //   }
      //
      //   // Validate email
      //   if (!email.value.trim()) {
      //     showError(email, "Email is required")
      //     return
      //   } else if (!isValidEmail(email.value)) {
      //     showError(email, "Please enter a valid email address")
      //     return
      //   } else {
      //     clearError(email)
      //   }
      //
      //   // Validate password
      //   if (!password.value) {
      //     showError(password, "Password is required")
      //     return
      //   } else if (password.value.length < 8) {
      //     showError(password, "Password must be at least 8 characters")
      //     return
      //   } else if (!/[a-zA-Z]/.test(password.value)) {
      //     showError(password, "Password must include at least one letter")
      //     return
      //   } else if (!/[0-9]/.test(password.value)) {
      //     showError(password, "Password must include at least one number")
      //     return
      //   } else if (!/[^a-zA-Z0-9]/.test(password.value)) {
      //     showError(password, "Password must include at least one special character")
      //     return
      //   } else {
      //     clearError(password)
      //   }
      //
      //   // Validate confirm password
      //   if (!confirmPassword.value) {
      //     showError(confirmPassword, "Please confirm your password")
      //     return
      //   } else if (confirmPassword.value !== password.value) {
      //     showError(confirmPassword, "Passwords do not match")
      //     return
      //   } else {
      //     clearError(confirmPassword)
      //   }
      //
      //   // Validate semester
      //   if (!semester.value) {
      //     showError(semester, "Please select your semester")
      //     return
      //   } else {
      //     clearError(semester)
      //   }
      //
      //   // Validate terms
      //   if (!terms.checked) {
      //     showError(terms, "You must agree to the Terms and Conditions")
      //     return
      //   } else {
      //     clearError(terms)
      //   }
      //
      //   // If validation passes, simulate registration
      //   simulateRegistration(name.value, email.value, semester.value)
      // })
  
      // Clear errors on input
      const inputs = registerForm.querySelectorAll("input, select")
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
  
  // Check password strength (0-4)
  function checkPasswordStrength(password) {
    let strength = 0
  
    // Length check
    if (password.length >= 8) strength += 1
  
    // Character type checks
    if (/[a-zA-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1
  
    return strength
  }
  
  // Update password requirement visual
  function updateRequirement(element, isMet) {
    if (isMet) {
      element.setAttribute("data-requirement", "met")
      element.querySelector("i").className = "fas fa-check-circle"
    } else {
      element.setAttribute("data-requirement", "not-met")
      element.querySelector("i").className = "fas fa-circle"
    }
  }
  
  // Simulate registration (in a real app, this would call an API)
  // function simulateRegistration(name, email, semester) {
  //   // Show loading state
  //   const submitButton = document.querySelector('#register-form button[type="submit"]')
  //   const originalText = submitButton.textContent
  //   submitButton.disabled = true
  //   submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...'
  //
  //   // Simulate API call delay
  //   setTimeout(() => {
  //     // In a real app, this would be an API call to create the account
  //     submitButton.innerHTML = '<i class="fas fa-check"></i> Account Created!'
  //
  //     // Store user info in localStorage (for demo purposes only)
  //     const userInfo = {
  //       name: name,
  //       email: email,
  //       semester: semester,
  //       avatar: "images/default-avatar.png",
  //     }
  //     localStorage.setItem("user", JSON.stringify(userInfo))
  //
  //     // Redirect to dashboard after a short delay
  //     setTimeout(() => {
  //       window.location.href = "dashboard.html"
  //     }, 1000)
  //   }, 2000)
  // }
  