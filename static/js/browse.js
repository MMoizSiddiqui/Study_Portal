// Browse Notes Page JavaScript

document.addEventListener("DOMContentLoaded", () => {
    // Filter toggle functionality for mobile
    const filterToggleBtn = document.getElementById("filter-toggle");
    const filtersSection = document.querySelector(".filters-section");
    
    if (filterToggleBtn && filtersSection) {
        filterToggleBtn.addEventListener("click", () => {
            filtersSection.classList.toggle("active");
            document.body.style.overflow = filtersSection.classList.contains("active") ? "hidden" : "";
        });

        // Close filters when clicking outside
        document.addEventListener("click", (e) => {
            if (!filtersSection.contains(e.target) && !filterToggleBtn.contains(e.target)) {
                filtersSection.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
    }

    // Show more courses functionality
    const showMoreBtn = document.getElementById("show-more-courses");
    const hiddenCourses = document.querySelectorAll('.filter-checkbox[style="display: none;"]');
    
    if (showMoreBtn && hiddenCourses.length > 0) {
        showMoreBtn.addEventListener("click", () => {
            hiddenCourses.forEach(course => {
                course.style.display = "flex";
            });
            showMoreBtn.style.display = "none";
        });
    }

    // Clear filters functionality
    const clearFiltersBtn = document.getElementById("clear-filters");
    const filterCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    const filterRadios = document.querySelectorAll('input[type="radio"]');
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", () => {
            filterCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            filterRadios.forEach(radio => {
                if (radio.value === "all") {
                    radio.checked = true;
                } else {
                    radio.checked = false;
                }
            });
        });
    }

    // Search functionality
    const searchInput = document.querySelector(".search-input input");
    const noteCards = document.querySelectorAll(".note-card");
    
    if (searchInput && noteCards.length > 0) {
        searchInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            noteCards.forEach(card => {
                const title = card.querySelector("h3").textContent.toLowerCase();
                const meta = card.querySelector(".note-meta").textContent.toLowerCase();
                
                if (title.includes(searchTerm) || meta.includes(searchTerm)) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }

    // Sort functionality
    const sortSelect = document.getElementById("sort-by");
    const notesGrid = document.querySelector(".notes-grid");
    
    if (sortSelect && notesGrid) {
        sortSelect.addEventListener("change", () => {
            const sortValue = sortSelect.value;
            const cards = Array.from(noteCards);
            
            cards.sort((a, b) => {
                switch (sortValue) {
                    case "newest":
                        return new Date(b.dataset.date) - new Date(a.dataset.date);
                    case "popular":
                        return parseInt(b.dataset.downloads) - parseInt(a.dataset.downloads);
                    case "rating":
                        return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
                    case "downloads":
                        return parseInt(b.dataset.downloads) - parseInt(a.dataset.downloads);
                    default:
                        return 0;
                }
            });
            
            // Re-append sorted cards
            cards.forEach(card => {
                notesGrid.appendChild(card);
            });
        });
    }

    // Apply filters functionality
    const applyFiltersBtn = document.querySelector(".apply-filters-btn");
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener("click", () => {
            const selectedSemesters = Array.from(document.querySelectorAll('input[name="semester"]:checked')).map(cb => cb.value);
            const selectedCourses = Array.from(document.querySelectorAll('input[name="course"]:checked')).map(cb => cb.value);
            const selectedFileTypes = Array.from(document.querySelectorAll('input[name="filetype"]:checked')).map(cb => cb.value);
            const selectedRating = document.querySelector('input[name="rating"]:checked').value;
            
            noteCards.forEach(card => {
                const semester = card.dataset.semester;
                const course = card.dataset.course;
                const fileType = card.dataset.filetype;
                const rating = parseFloat(card.dataset.rating);
                
                const semesterMatch = selectedSemesters.length === 0 || selectedSemesters.includes(semester);
                const courseMatch = selectedCourses.length === 0 || selectedCourses.includes(course);
                const fileTypeMatch = selectedFileTypes.length === 0 || selectedFileTypes.includes(fileType);
                const ratingMatch = selectedRating === "all" || 
                                  (selectedRating === "4plus" && rating >= 4) ||
                                  (selectedRating === "3plus" && rating >= 3);
                
                if (semesterMatch && courseMatch && fileTypeMatch && ratingMatch) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });

            // Close filters on mobile after applying
            if (window.innerWidth <= 992) {
                filtersSection.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
    }

    // Save/unsave note
    const saveButtons = document.querySelectorAll(".save-btn")
    saveButtons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault()
        e.stopPropagation()
  
        this.classList.toggle("saved")
        if (this.classList.contains("saved")) {
          this.innerHTML = '<i class="fas fa-bookmark"></i>'
          this.title = "Unsave Note"
        } else {
          this.innerHTML = '<i class="far fa-bookmark"></i>'
          this.title = "Save Note"
        }
      })
    })
  
    // Pagination
    const paginationNumbers = document.querySelectorAll(".pagination-number")
    paginationNumbers.forEach((number) => {
      number.addEventListener("click", function () {
        paginationNumbers.forEach((num) => num.classList.remove("active"))
        this.classList.add("active")
  
        // In a real app, this would load the corresponding page of notes
        // For demo purposes, we'll just scroll to the top
        window.scrollTo({ top: 0, behavior: "smooth" })
      })
    })
  
    // Previous/Next pagination buttons
    const prevButton = document.querySelector(".pagination-btn.prev")
    const nextButton = document.querySelector(".pagination-btn.next")
  
    if (prevButton && nextButton) {
      prevButton.addEventListener("click", function () {
        const activeNumber = document.querySelector(".pagination-number.active")
        if (
          activeNumber &&
          activeNumber.previousElementSibling &&
          activeNumber.previousElementSibling.classList.contains("pagination-number")
        ) {
          activeNumber.classList.remove("active")
          activeNumber.previousElementSibling.classList.add("active")
  
          // Enable/disable buttons as needed
          nextButton.disabled = false
          if (
            !activeNumber.previousElementSibling.previousElementSibling ||
            !activeNumber.previousElementSibling.previousElementSibling.classList.contains("pagination-number")
          ) {
            this.disabled = true
          }
  
          // Scroll to top
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      })
  
      nextButton.addEventListener("click", function () {
        const activeNumber = document.querySelector(".pagination-number.active")
        if (
          activeNumber &&
          activeNumber.nextElementSibling &&
          activeNumber.nextElementSibling.classList.contains("pagination-number")
        ) {
          activeNumber.classList.remove("active")
          activeNumber.nextElementSibling.classList.add("active")
  
          // Enable/disable buttons as needed
          prevButton.disabled = false
          if (
            !activeNumber.nextElementSibling.nextElementSibling ||
            !activeNumber.nextElementSibling.nextElementSibling.classList.contains("pagination-number")
          ) {
            this.disabled = true
          }
  
          // Scroll to top
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      })
    }
})
  