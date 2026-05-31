// Forum Page JavaScript

document.addEventListener("DOMContentLoaded", () => {
    // Ask Question Modal
    const askQuestionBtn = document.getElementById("ask-question-btn")
    const askQuestionModal = document.getElementById("ask-question-modal")
    const modalCloseButtons = document.querySelectorAll(".modal-close")
  
    if (askQuestionBtn && askQuestionModal) {
      // Open modal when clicking the Ask Question button
      askQuestionBtn.addEventListener("click", () => {
        askQuestionModal.classList.add("active")
      })
  
      // Close modal when clicking the close button
      modalCloseButtons.forEach((button) => {
        button.addEventListener("click", () => {
          askQuestionModal.classList.remove("active")
        })
      })
  
      // Close modal when clicking outside
      window.addEventListener("click", (e) => {
        if (e.target === askQuestionModal) {
          askQuestionModal.classList.remove("active")
        }
      })
    }
  
    // Ask question form posts to server (no client-side intercept)
    const askQuestionForm = document.getElementById("ask-question-form")
    if (askQuestionForm && askQuestionModal) {
      askQuestionForm.addEventListener("submit", () => {
        const submitButton = askQuestionForm.querySelector('button[type="submit"]')
        if (submitButton) {
          submitButton.disabled = true
          submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...'
        }
      })
    }
  
    // Forum search functionality
    const forumSearchInput = document.getElementById("forum-search-input")
    if (forumSearchInput) {
      forumSearchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          const searchTerm = this.value.trim().toLowerCase()
          if (searchTerm) {
            searchQuestions(searchTerm)
          }
        }
      })
    }
  
    // Search questions function
    function searchQuestions(searchTerm) {
      const questionCards = document.querySelectorAll(".question-card")
      let matchFound = false
  
      questionCards.forEach((card) => {
        const title = card.querySelector(".question-title").textContent.toLowerCase()
        const excerpt = card.querySelector(".question-excerpt").textContent.toLowerCase()
        const tags = Array.from(card.querySelectorAll(".tag")).map((tag) => tag.textContent.toLowerCase())
  
        // Check if the search term is in the title, excerpt, or tags
        if (title.includes(searchTerm) || excerpt.includes(searchTerm) || tags.some((tag) => tag.includes(searchTerm))) {
          card.style.display = "flex"
          card.style.animation = "highlight 2s"
          matchFound = true
        } else {
          card.style.display = "none"
        }
      })
  
      // Show message if no matches found
      const noResultsMessage = document.querySelector(".no-results-message")
      if (!matchFound) {
        if (!noResultsMessage) {
          const message = document.createElement("div")
          message.className = "no-results-message"
          message.innerHTML = `
            <i class="fas fa-search" style="font-size: 2rem; color: var(--text-light); margin-bottom: 1rem;"></i>
            <h3>No Results Found</h3>
            <p>No questions match your search term <strong id="search-term-display"></strong>.</p>
            <button class="btn btn-primary clear-search">Clear Search</button>
          `
          document.querySelector(".forum-questions").prepend(message)
          // Safely set the search term without innerHTML XSS risk
          document.getElementById("search-term-display").textContent = searchTerm
  
          // Add event listener to clear search button
          message.querySelector(".clear-search").addEventListener("click", () => {
            forumSearchInput.value = ""
            questionCards.forEach((card) => {
              card.style.display = "flex"
              card.style.animation = ""
            })
            message.remove()
          })
        }
      } else if (noResultsMessage) {
        noResultsMessage.remove()
      }
    }
  
    // Filter functionality
    const filterCategory = document.getElementById("filter-category")
    const filterSort = document.getElementById("filter-sort")
    const filterSemester = document.getElementById("filter-semester")
  
    const filterElements = [filterCategory, filterSort, filterSemester]
  
    filterElements.forEach((filter) => {
      if (filter) {
        filter.addEventListener("change", applyFilters)
      }
    })
  
    // Apply filters function
    function applyFilters() {
      const category = filterCategory ? filterCategory.value : "all"
      const sortBy = filterSort ? filterSort.value : "newest"
      const semester = filterSemester ? filterSemester.value : "all"
  
      // In a real app, this would call an API to get filtered questions
      // For demo, we'll just show a message
  
      const filterMessage = document.createElement("div")
      filterMessage.className = "filter-message"
      filterMessage.innerHTML = `<p>Filters applied: <span id="filter-summary"></span></p>`
      
      // Safely set filter summary
      const filterSummary = `Category = ${getCategoryName(category)}, Sort = ${sortBy}, Semester = ${getSemesterName(semester)}`
      document.getElementById("filter-summary").textContent = filterSummary
      }
  
      // Add the new message
      document.querySelector(".forum-filters").after(filterMessage)
  
      // Remove message after a delay
      setTimeout(() => {
        filterMessage.style.opacity = "0"
        setTimeout(() => {
          filterMessage.remove()
        }, 300)
      }, 3000)
    }
  
    // Pagination functionality
    const paginationButtons = document.querySelectorAll(".pagination-btn")
    if (paginationButtons.length > 0) {
      paginationButtons.forEach((button) => {
        button.addEventListener("click", function () {
          // Remove active class from all buttons
          paginationButtons.forEach((btn) => {
            if (btn.classList.contains("active")) {
              btn.classList.remove("active")
            }
          })
  
          // Add active class to clicked button
          if (!this.classList.contains("next")) {
            this.classList.add("active")
          } else {
            // If next button is clicked, activate the next page
            const activeButton = document.querySelector(".pagination-btn.active")
            const nextButton = activeButton.nextElementSibling
            if (nextButton && !nextButton.classList.contains("next")) {
              nextButton.classList.add("active")
            }
          }
  
          // Scroll to top
          window.scrollTo({ top: 0, behavior: "smooth" })
  
          // In a real app, this would load the next page of questions
          // For demo, we'll just show a loading indicator
  
          const questionsList = document.querySelector(".forum-questions")
          if (questionsList) {
            questionsList.innerHTML = `
              <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i>
                <p>Loading questions...</p>
              </div>
            `
  
            // Simulate loading delay
            setTimeout(() => {
              // Restore original questions (in a real app, this would load new questions)
              location.reload()
            }, 1500)
          }
        })
      })
    }
  })
  