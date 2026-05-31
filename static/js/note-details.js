// Note Details Page JavaScript

document.addEventListener("DOMContentLoaded", () => {
    // Rating stars functionality
    const ratingStars = document.querySelectorAll(".rating-stars i")
    const ratingText = document.querySelector(".rating-text")
    const submitRatingBtn = document.querySelector(".submit-rating")
    let selectedRating = 0
  
    if (ratingStars.length > 0) {
      ratingStars.forEach((star, index) => {
        // Hover effect
        star.addEventListener("mouseover", () => {
          resetStars()
          for (let i = 0; i <= index; i++) {
            ratingStars[i].classList.remove("far")
            ratingStars[i].classList.add("fas")
          }
          ratingText.textContent = `${index + 1} out of 5 stars`
        })
  
        // Click to select rating
        star.addEventListener("click", () => {
          selectedRating = index + 1
          resetStars()
          for (let i = 0; i <= index; i++) {
            ratingStars[i].classList.remove("far")
            ratingStars[i].classList.add("fas", "active")
          }
          ratingText.textContent = `You selected ${selectedRating} out of 5 stars`
          submitRatingBtn.disabled = false
        })
      })
  
      // Reset stars on mouseout if no rating is selected
      document.querySelector(".rating-stars").addEventListener("mouseout", () => {
        resetStars()
        if (selectedRating > 0) {
          for (let i = 0; i < selectedRating; i++) {
            ratingStars[i].classList.remove("far")
            ratingStars[i].classList.add("fas", "active")
          }
          ratingText.textContent = `You selected ${selectedRating} out of 5 stars`
        } else {
          ratingText.textContent = "Click to rate"
        }
      })
  
      // Submit rating
      submitRatingBtn.addEventListener("click", () => {
        const ratingComment = document.querySelector(".rating-comment").value
        submitRating(selectedRating, ratingComment)
      })
    }
  
    // Reset stars helper function
    function resetStars() {
      ratingStars.forEach((star) => {
        star.classList.remove("fas", "active")
        star.classList.add("far")
      })
    }
  
    // Submit rating function (would call an API in a real app)
    function submitRating(rating, comment) {
      // Show loading state
      submitRatingBtn.disabled = true
      submitRatingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...'
  
      // Simulate API call
      setTimeout(() => {
        submitRatingBtn.innerHTML = '<i class="fas fa-check"></i> Rating Submitted!'
  
        // Show success message
        const ratingSection = document.querySelector(".note-rating-section")
        ratingSection.innerHTML = `
          <div class="rating-success">
            <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success-color); margin-bottom: 1rem;"></i>
            <h3>Thank You for Your Rating!</h3>
            <p>Your feedback helps other students find quality notes.</p>
          </div>
        `
  
        // Update the displayed rating (in a real app, this would be an average)
        updateDisplayedRating(rating)
      }, 1500)
    }
  
    // Update displayed rating
    function updateDisplayedRating(newRating) {
      const ratingValueElement = document.querySelector(".rating-value")
      const ratingCountElement = document.querySelector(".rating-count")
  
      if (ratingValueElement && ratingCountElement) {
        // Get current values
        const currentRating = Number.parseFloat(ratingValueElement.textContent)
        const currentCount = Number.parseInt(ratingCountElement.textContent.match(/\d+/)[0])
  
        // Calculate new average (simplified for demo)
        const newCount = currentCount + 1
        const newAverage = (currentRating * currentCount + newRating) / newCount
  
        // Update display
        ratingValueElement.textContent = newAverage.toFixed(1)
        ratingCountElement.textContent = `(${newCount} ratings)`
  
        // Update stars
        const starsContainer = document.querySelector(".stars")
        if (starsContainer) {
          starsContainer.innerHTML = generateStarsHTML(newAverage)
        }
      }
    }
  
    // Generate stars HTML based on rating
    function generateStarsHTML(rating) {
      let html = ""
      const fullStars = Math.floor(rating)
      const hasHalfStar = rating % 1 >= 0.5
  
      // Add full stars
      for (let i = 0; i < fullStars; i++) {
        html += '<i class="fas fa-star"></i>'
      }
  
      // Add half star if needed
      if (hasHalfStar) {
        html += '<i class="fas fa-star-half-alt"></i>'
      }
  
      // Add empty stars
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
      for (let i = 0; i < emptyStars; i++) {
        html += '<i class="far fa-star"></i>'
      }
  
      return html
    }
  
    // Comment functionality
    const commentForm = document.querySelector(".comment-form")
    if (commentForm) {
      commentForm.addEventListener("submit", (e) => {
        e.preventDefault()
        const commentInput = document.querySelector(".comment-input")
        const commentText = commentInput.value.trim()
  
        if (commentText) {
          addComment(commentText)
          commentInput.value = ""
        }
      })
    }
  
    // Add comment function
    function addComment(text) {
      const commentsList = document.querySelector(".comments-list")
      if (!commentsList) return
  
      // Get user info from localStorage (in a real app, this would come from the server)
      const userData = JSON.parse(localStorage.getItem("user")) || {
        name: "John Doe",
        avatar: "images/default-avatar.png",
      }
  
      // Create comment HTML
      const commentHTML = `
        <div class="comment">
          <div class="comment-header">
            <div class="comment-user">
              <img src="${userData.avatar}" alt="User Avatar">
              <div>
                <h4>${userData.name}</h4>
                <p class="comment-date">Just now</p>
              </div>
            </div>
          </div>
          <div class="comment-content">
            <p>${text}</p>
          </div>
          <div class="comment-actions">
            <button class="comment-action">
              <i class="fas fa-thumbs-up"></i>
              <span>0</span>
            </button>
            <button class="comment-action">
              <i class="fas fa-reply"></i>
              <span>Reply</span>
            </button>
          </div>
        </div>
      `
  
      // Add to the top of the list
      commentsList.insertAdjacentHTML("afterbegin", commentHTML)
  
      // Add event listeners to the new comment
      const newComment = commentsList.firstElementChild
      setupCommentActions(newComment)
    }
  
    // Setup comment actions
    function setupCommentActions(commentElement) {
      const likeButton = commentElement.querySelector(".comment-action:first-child")
      const replyButton = commentElement.querySelector(".comment-action:last-child")
  
      if (likeButton) {
        likeButton.addEventListener("click", function () {
          const countElement = this.querySelector("span")
          let count = Number.parseInt(countElement.textContent)
  
          if (this.classList.contains("liked")) {
            this.classList.remove("liked")
            count--
          } else {
            this.classList.add("liked")
            count++
          }
  
          countElement.textContent = count
        })
      }
  
      if (replyButton) {
        replyButton.addEventListener("click", () => {
          const commentReplies = commentElement.querySelector(".comment-replies") || document.createElement("div")
  
          if (!commentElement.querySelector(".comment-replies")) {
            commentReplies.className = "comment-replies"
            commentElement.appendChild(commentReplies)
          }
  
          // Check if reply form already exists
          if (commentReplies.querySelector(".reply-form")) {
            commentReplies.querySelector(".reply-form").remove()
            return
          }
  
          // Create reply form
          const replyForm = document.createElement("div")
          replyForm.className = "reply-form"
          replyForm.innerHTML = `
            <textarea class="reply-input" placeholder="Write your reply..."></textarea>
            <div class="form-actions" style="margin-top: 0.5rem;">
              <button class="btn btn-primary btn-sm post-reply">Reply</button>
              <button class="btn btn-outline btn-sm cancel-reply">Cancel</button>
            </div>
          `
  
          commentReplies.insertAdjacentElement("afterbegin", replyForm)
  
          // Focus the textarea
          replyForm.querySelector(".reply-input").focus()
  
          // Add event listeners to the reply form
          replyForm.querySelector(".post-reply").addEventListener("click", () => {
            const replyText = replyForm.querySelector(".reply-input").value.trim()
            if (replyText) {
              addReply(commentReplies, replyText)
              replyForm.remove()
            }
          })
  
          replyForm.querySelector(".cancel-reply").addEventListener("click", () => {
            replyForm.remove()
          })
        })
      }
    }
  
    // Add reply function
    function addReply(repliesContainer, text) {
      // Get user info from localStorage
      const userData = JSON.parse(localStorage.getItem("user")) || {
        name: "John Doe",
        avatar: "images/default-avatar.png",
      }
  
      // Create reply HTML
      const replyHTML = `
        <div class="comment reply">
          <div class="comment-header">
            <div class="comment-user">
              <img src="${userData.avatar}" alt="User Avatar">
              <div>
                <h4>${userData.name}</h4>
                <p class="comment-date">Just now</p>
              </div>
            </div>
          </div>
          <div class="comment-content">
            <p>${text}</p>
          </div>
          <div class="comment-actions">
            <button class="comment-action">
              <i class="fas fa-thumbs-up"></i>
              <span>0</span>
            </button>
          </div>
        </div>
      `
  
      // Add after the reply form
      repliesContainer.insertAdjacentHTML("beforeend", replyHTML)
  
      // Add event listeners to the new reply
      const newReply = repliesContainer.lastElementChild
      setupCommentActions(newReply)
    }
  
    // Initialize existing comments
    const existingComments = document.querySelectorAll(".comment")
    existingComments.forEach((comment) => {
      setupCommentActions(comment)
    })
  
    // Download button functionality
    const downloadBtn = document.querySelector(".note-details-download .btn-primary")
    if (downloadBtn) {
      downloadBtn.addEventListener("click", function (e) {
        e.preventDefault()
  
        // Show loading state
        const originalText = this.innerHTML
        this.disabled = true
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...'
  
        // Simulate download delay
        setTimeout(() => {
          this.innerHTML = '<i class="fas fa-check"></i> Downloaded!'
  
          // Reset after a delay
          setTimeout(() => {
            this.disabled = false
            this.innerHTML = originalText
  
            // In a real app, this would trigger the actual download
            // For demo, we'll just show an alert
            alert("Download complete! In a real app, the file would be downloaded to your device.")
          }, 1500)
        }, 2000)
      })
    }
  
    // Share button functionality
    const shareBtn = document.querySelector(".note-actions .btn:nth-child(2)")
    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        // Check if Web Share API is available
        if (navigator.share) {
          navigator
            .share({
              title: document.querySelector(".note-details-info h1").textContent,
              text: "Check out these notes on FAST Parhai!",
              url: window.location.href,
            })
            .catch((error) => console.log("Error sharing:", error))
        } else {
          // Fallback for browsers that don't support Web Share API
          const dummyInput = document.createElement("input")
          document.body.appendChild(dummyInput)
          dummyInput.value = window.location.href
          dummyInput.select()
          document.execCommand("copy")
          document.body.removeChild(dummyInput)
  
          alert("Link copied to clipboard!")
        }
      })
    }
  
    // Report button functionality
    const reportBtn = document.querySelector(".note-actions .btn:nth-child(3)")
    if (reportBtn) {
      reportBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to report this note? This will notify the administrators for review.")) {
          alert("Thank you for your report. Our team will review this note shortly.")
        }
      })
    }
  })
  