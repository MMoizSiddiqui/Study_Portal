# FAST Parhai - Academic Resource Sharing Platform

A Flask-based collaborative learning platform designed for FAST University students to share and access academic resources.

## 🚀 Quick Start

### How to Run in Terminal

**Open PowerShell or Command Prompt and run:**

```powershell
# Navigate to the project folder
cd "c:\Users\Moiz Siddiqui\Desktop\semester 6\fast-parhai-updated-submission"

# Install dependencies (first time only)
pip install -r requirements.txt

# Run the application
python app.py
```

**Expected Output:**
```
✓ FAST Parhai initialized successfully!
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
```

**Then open your browser and go to:**
```
http://127.0.0.1:5000
```

### Prerequisites
- Python 3.12+
- Flask and dependencies (see `requirements.txt`)

## 📋 Credentials & Account Setup

### 🔓 Default Admin Account

The admin account is **automatically created** on first run:

**Admin Login:**
- **Username:** `admin`
- **Password:** `Admin123456`
- **Access:** http://127.0.0.1:5000/login

### 👨‍💼 First Login Steps

1. Go to `http://127.0.0.1:5000/login`
2. Enter username: `admin`
3. Enter password: `Admin123456`
4. Click "Login"
5. You'll be redirected to the admin dashboard

### 🔑 Change Admin Password

After first login, go to Settings (/settings) and change the default password to something secure.

### 👤 Create Regular User Accounts

1. Click "Register" on the home page
2. Fill in username, email, password (min 8 characters)
3. Select **Student** from the role dropdown
4. Complete registration
5. Login with your credentials

### Default Configuration
- **Host:** localhost (127.0.0.1)
- **Port:** 5000
- **Database:** SQLite (fastparhai.db) - auto-created on first run
- **Secret Key:** Default local development key (auto-generated)

## 🎯 Features

### User Features
- **Share Notes:** Upload PDF, DOC, DOCX, PPT, PPTX files
- **Browse Resources:** Search and filter by course, semester, file type
- **Forum:** Ask questions, get answers, discuss topics
- **Testimonials:** Share feedback about your experience
- **Profile:** Manage profile picture, settings, and activity
- **Upvote:** Rate helpful study materials
- **Download:** Track and access study materials

### Admin Features
- **Dashboard:** Overview of platform metrics
- **User Management:** Suspend/manage user accounts
- **Analytics:** Track top resources, contributors
- **Testimonial Moderation:** Approve/reject user testimonials
- **Comments Management:** Review and moderate comments
- **Activity Logs:** Track all platform activities

## 📁 Project Structure

```
fast-parhai-updated-submission/
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── fastparhai.db          # SQLite database (auto-created)
├── templates/             # HTML templates
│   ├── index.html         # Home page
│   ├── about.html         # About page with testimonials
│   ├── admin-*            # Admin panel templates
│   └── ...
├── static/                # CSS, JS, images
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   └── images/           # Images
└── uploads/              # User-uploaded files
```

## 🔒 Security Features

- **CSRF Protection:** All forms protected with CSRF tokens
- **Password Hashing:** Werkzeug secure hashing
- **File Upload Validation:** Magic byte verification + file extension whitelist
- **Rate Limiting:** Protection against brute-force attacks
- **Session Security:** HTTPOnly cookies, SameSite policy
- **XSS Protection:** Input sanitization in frontend
- **Security Headers:** CSP, X-Frame-Options, etc.

## 📝 Database Models

### User
- username, email, password_hash
- is_admin, is_suspended
- semester, profile_pic

### Note
- title, course, semester, category, description
- filename, download_count
- uploader_id, created_at

### Question (Forum)
- title, content, category, semester, tags
- is_anonymous, author_id, created_at

### Answer
- content, author_id, question_id, created_at

### Testimonial
- author_name, author_semester, content
- is_approved, user_id, created_at

### ActivityLog
- actor_id, action, details, ip_address, created_at

## 🛠️ Configuration

### File Upload Limits
- **Max file size:** 16 MB
- **Allowed note formats:** PDF, DOC, DOCX, PPT, PPTX
- **Allowed image formats:** PNG, JPG, JPEG, WEBP, GIF

### Rate Limiting
- **Login:** 5 attempts/minute
- **Register:** 5 attempts/5 minutes
- **Contact:** 10 attempts/5 minutes
- **Upload:** 12 attempts/5 minutes

## 🌐 Routes Summary

### Public Routes
- `/` - Home page
- `/about` - About page with testimonial submission
- `/contact` - Contact form
- `/login` - User login
- `/register` - User registration
- `/leaderboard` - Student leaderboard

### User Routes (Login Required)
- `/dashboard` - User dashboard
- `/browse-notes` - Browse all notes
- `/note/<id>` - View note details
- `/forum` - Discussion forum
- `/profile` - User profile
- `/settings` - Account settings

### Admin Routes (Admin Login Required)
- `/admin-dashboard` - Admin main dashboard
- `/admin/analytics` - Analytics and statistics
- `/admin/users` - Manage users
- `/admin/testimonials` - Approve testimonials
- `/admin/comments` - Manage comments
- `/admin/logs` - Activity logs

## 🚀 Deployment Notes

For production deployment:
1. Change SECRET_KEY to a strong random value
2. Set `app.config["SESSION_COOKIE_SECURE"] = True` for HTTPS
3. Use a production WSGI server (Gunicorn, etc.)
4. Configure proper database (MySQL recommended)
5. Set up proper environment variables
6. Enable debug mode: `debug=False` (already set)

## 📧 Support

For issues or questions, contact: support@fastparhai.edu

## 📄 License

Internal - FAST University Project

---

**Happy Learning! 🎓**
