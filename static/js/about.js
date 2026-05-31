document.addEventListener("DOMContentLoaded", () => {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector(".mobile-menu-toggle")
    const mainNav = document.querySelector(".main-nav")
  
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener("click", function () {
        mainNav.classList.toggle("active")
        this.classList.toggle("active")
      })
    }
  
    // Testimonials Slider
    const testimonials = document.querySelectorAll(".testimonial")
    const dots = document.querySelectorAll(".dot")
    const prevBtn = document.querySelector(".prev-btn")
    const nextBtn = document.querySelector(".next-btn")
    let currentSlide = 0
  
    // Hide all testimonials except the first one
    function hideAllTestimonials() {
      testimonials.forEach((testimonial) => {
        testimonial.style.display = "none"
      })
    }
  
    // Show the current testimonial
    function showTestimonial(index) {
      hideAllTestimonials()
      testimonials[index].style.display = "block"
  
      // Update dots
      dots.forEach((dot) => dot.classList.remove("active"))
      dots[index].classList.add("active")
    }
  
    // Initialize slider
    hideAllTestimonials()
    showTestimonial(currentSlide)
  
    // Next button click
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        currentSlide = (currentSlide + 1) % testimonials.length
        showTestimonial(currentSlide)
      })
    }
  
    // Previous button click
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        currentSlide = (currentSlide - 1 + testimonials.length) % testimonials.length
        showTestimonial(currentSlide)
      })
    }
  
    // Dot clicks
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        currentSlide = index
        showTestimonial(currentSlide)
      })
    })
  
    // Auto slide every 5 seconds
    setInterval(() => {
      currentSlide = (currentSlide + 1) % testimonials.length
      showTestimonial(currentSlide)
    }, 5000)
  
    // Animation on scroll
    function animateOnScroll() {
      const elements = document.querySelectorAll(".mission-box, .vision-box, .values-box, .team-member, .achievement-box")
  
      elements.forEach((element) => {
        const elementPosition = element.getBoundingClientRect().top
        const screenPosition = window.innerHeight / 1.3
  
        if (elementPosition < screenPosition) {
          element.style.opacity = "1"
          element.style.transform = "translateY(0)"
        }
      })
    }
  
    // Set initial state for animation
    const animatedElements = document.querySelectorAll(
      ".mission-box, .vision-box, .values-box, .team-member, .achievement-box",
    )
    animatedElements.forEach((element) => {
      element.style.opacity = "0"
      element.style.transform = "translateY(20px)"
      element.style.transition = "opacity 0.5s ease, transform 0.5s ease"
    })
  
    // Run animation on scroll
    window.addEventListener("scroll", animateOnScroll)
    // Run animation on load
    animateOnScroll()
  
    // Counter animation for achievement numbers
    function animateCounter(element, target) {
      let current = 0
      const increment = target / 100
      const timer = setInterval(() => {
        current += increment
        element.textContent = Math.ceil(current)
        if (current >= target) {
          element.textContent = target
          clearInterval(timer)
        }
      }, 20)
    }
  
    // Animate counters when they come into view
    const achievementNumbers = document.querySelectorAll(".achievement-number")
  
    function checkCounters() {
      achievementNumbers.forEach((counter) => {
        const elementPosition = counter.getBoundingClientRect().top
        const screenPosition = window.innerHeight / 1.3
  
        if (elementPosition < screenPosition && !counter.classList.contains("animated")) {
          counter.classList.add("animated")
          const target = Number.parseInt(counter.textContent.replace(/,/g, "").replace(/\+/g, ""))
          animateCounter(counter, target)
        }
      })
    }
  
    window.addEventListener("scroll", checkCounters)
    checkCounters()
  })
  