document.addEventListener("DOMContentLoaded", () => {
    // Mobile menu toggle
    const menuToggle = document.querySelector(".menu-toggle")
    const nav = document.querySelector("nav")

    if (menuToggle && nav) {
        menuToggle.addEventListener("click", () => {
            nav.classList.toggle("active")
            const icon = menuToggle.querySelector("i")
            if (nav.classList.contains("active")) {
                icon.classList.remove("fa-bars")
                icon.classList.add("fa-times")
            } else {
                icon.classList.remove("fa-times")
                icon.classList.add("fa-bars")
            }
        })

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target) && nav.classList.contains("active")) {
                nav.classList.remove("active")
                const icon = menuToggle.querySelector("i")
                icon.classList.remove("fa-times")
                icon.classList.add("fa-bars")
            }
        })
    }

    // Form submission handling
    const contactForm = document.getElementById("contactForm")
    const formSuccess = document.getElementById("formSuccess")
  
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        // Remove e.preventDefault() to allow form submission
        const submitButton = contactForm.querySelector(".btn-submit")
        const originalText = submitButton.textContent
  
        submitButton.disabled = true
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...'
  
        // Let the form submit naturally to the backend
        // The success message will be shown after the page reloads
      })
    }
  
    // FAQ accordion functionality
    const faqItems = document.querySelectorAll(".faq-item")
  
    faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question")
  
      question.addEventListener("click", () => {
        // Close all other items
        faqItems.forEach((otherItem) => {
          if (otherItem !== item && otherItem.classList.contains("active")) {
            otherItem.classList.remove("active")
          }
        })
  
        // Toggle current item
        item.classList.toggle("active")
      })
    })
  
    // Live chat widget functionality
    const chatToggle = document.querySelector(".chat-toggle")
    const chatWidget = document.querySelector(".chat-widget")
    const closeChat = document.querySelector(".close-chat")
    const chatInput = document.querySelector(".chat-input input")
    const chatSendButton = document.querySelector(".chat-input button")
    const chatMessages = document.querySelector(".chat-messages")
    const btnChat = document.querySelector(".btn-chat")
  
    // Function to toggle chat widget
    function toggleChat() {
      chatWidget.classList.toggle("active")
      if (chatWidget.classList.contains("active")) {
        chatInput.focus()
      }
    }
  
    // Event listeners for chat widget
    if (chatToggle) {
      chatToggle.addEventListener("click", toggleChat)
    }
  
    if (closeChat) {
      closeChat.addEventListener("click", toggleChat)
    }
  
    if (btnChat) {
      btnChat.addEventListener("click", () => {
        if (!chatWidget.classList.contains("active")) {
          toggleChat()
        }
        chatInput.focus()
      })
    }
  
    // Function to add a message to the chat
    function addMessage(content, isUser = false) {
      const messageDiv = document.createElement("div")
      messageDiv.className = isUser ? "message user" : "message support"
  
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      const timeString = `${hours}:${minutes}`
  
      messageDiv.innerHTML = `
              <div class="message-content">
                  <p>${content}</p>
                  <span class="time">${timeString}</span>
              </div>
          `
  
      chatMessages.appendChild(messageDiv)
      chatMessages.scrollTop = chatMessages.scrollHeight
    }
  
    // Function to handle user message submission
    function handleMessageSubmit() {
      const message = chatInput.value.trim()
  
      if (message) {
        // Add user message
        addMessage(message, true)
        chatInput.value = ""
  
        // Simulate typing indicator
        setTimeout(() => {
          const responses = [
            "Thank you for your message! Our team will get back to you shortly.",
            "I'll forward this to the appropriate department. Is there anything else you'd like to know?",
            "Thanks for reaching out! We typically respond within 24 hours.",
            "I understand your question. Let me check with our team and get back to you.",
          ]
  
          // Random response selection
          const randomResponse = responses[Math.floor(Math.random() * responses.length)]
          addMessage(randomResponse)
        }, 1000)
      }
    }
  
    // Event listeners for sending messages
    if (chatSendButton) {
      chatSendButton.addEventListener("click", handleMessageSubmit)
    }
  
    if (chatInput) {
      chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          handleMessageSubmit()
        }
      })
    }
  
    // Google Maps API integration (if needed)
    // This would typically be implemented with a real API key
    // For demonstration purposes, we're using an iframe
  })
  