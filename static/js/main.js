// Main JavaScript for FAST Parhai

document.addEventListener("DOMContentLoaded", () => {
    // Initialize sidebar toggle functionality
    initSidebar()
  
    // Initialize theme toggle
    initThemeToggle()
  })
  
  // Initialize sidebar functionality
  function initSidebar() {
    const sidebarToggle = document.getElementById("sidebarToggle")
    const menuToggle = document.getElementById("menuToggle")
    const sidebar = document.querySelector(".sidebar")
    const mainContent = document.querySelector(".main-content")
  
    // Check if sidebar state is saved in localStorage
    const sidebarCollapsed = localStorage.getItem("sidebarCollapsed") === "true"
  
    if (sidebarCollapsed) {
      sidebar.classList.add("collapsed")
      mainContent.classList.add("expanded")
      if (sidebarToggle) {
        sidebarToggle.innerHTML = '<i class="fas fa-chevron-right"></i>'
      }
    }
  
    // Sidebar toggle button click event
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", toggleSidebar)
    }
  
    // Menu toggle button click event
    if (menuToggle) {
      menuToggle.addEventListener("click", toggleSidebar)
    }
  
    function toggleSidebar() {
      if (window.innerWidth < 992) {
        // On mobile, toggle the active class
        sidebar.classList.toggle("active")
      } else {
        // On desktop, toggle the collapsed class
        sidebar.classList.toggle("collapsed")
        mainContent.classList.toggle("expanded")
  
        const isCollapsed = sidebar.classList.contains("collapsed")
  
        // Update toggle button icon
        if (sidebarToggle) {
          sidebarToggle.innerHTML = isCollapsed
            ? '<i class="fas fa-chevron-right"></i>'
            : '<i class="fas fa-chevron-left"></i>'
        }
  
        // Save state to localStorage
        localStorage.setItem("sidebarCollapsed", isCollapsed)
      }
    }
  
    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (event) => {
      const isMobile = window.innerWidth < 992
      if (
        isMobile &&
        !sidebar.contains(event.target) &&
        !menuToggle.contains(event.target) &&
        sidebar.classList.contains("active")
      ) {
        sidebar.classList.remove("active")
      }
    })
  }
  
  // Initialize theme toggle functionality
  function initThemeToggle() {
    const themeToggle = document.querySelector(".theme-toggle")
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)")
  
    // Check if theme preference is saved in localStorage
    const savedTheme = localStorage.getItem("theme")
  
    if (savedTheme === "dark" || (!savedTheme && prefersDarkScheme.matches)) {
      document.body.classList.add("dark-mode")
      updateThemeIcons(true)
    } else {
      document.body.classList.remove("dark-mode")
      updateThemeIcons(false)
    }
  
    // Theme toggle click event
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode")
  
        const isDarkMode = document.body.classList.contains("dark-mode")
        localStorage.setItem("theme", isDarkMode ? "dark" : "light")
  
        updateThemeIcons(isDarkMode)
      })
    }
  
    function updateThemeIcons(isDark) {
      const themeIcon = document.querySelector(".theme-toggle i")
      if (themeIcon) {
        themeIcon.classList.remove(isDark ? "fa-moon" : "fa-sun")
        themeIcon.classList.add(isDark ? "fa-sun" : "fa-moon")
      }
    }
  }
  
  // Mobile menu toggle
  document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navLinks.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                navLinks.classList.remove('active');
            }
        });
    }
  });
  
  document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle ? themeToggle.querySelector('i') : null;
    // Check saved theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        if (icon) icon.classList.replace('fa-moon', 'fa-sun');
    }
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                if (icon) icon.classList.replace('fa-moon', 'fa-sun');
            } else {
                localStorage.setItem('theme', 'light');
                if (icon) icon.classList.replace('fa-sun', 'fa-moon');
            }
        });
    }
  });
  