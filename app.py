import os
import re
import time
import uuid
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from functools import wraps

from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    send_from_directory,
    abort,
)
from flask_login import (
    LoginManager,
    UserMixin,
    login_user,
    login_required,
    logout_user,
    current_user,
)
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
from sqlalchemy import func, inspect, or_, text
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

# --- Paths & allowed uploads ---
UPLOAD_FOLDER = "uploads"
ALLOWED_NOTE_EXTENSIONS = {"pdf", "doc", "docx", "ppt", "pptx"}
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}
PER_PAGE = 9

# Lightweight in-memory throttling to reduce brute-force/abuse.
RATE_LIMIT_RULES = {
    "login": (5, 60),  # 5 attempts/minute
    "register": (5, 300),
    "contact": (10, 300),
    "upload_notes": (12, 300),
    "forum_ask": (10, 300),
    "answer": (20, 300),
    "add_note_comment": (20, 300),
    "toggle_upvote": (30, 60),
}
_RATE_LIMIT_BUCKETS: dict[tuple[str, str], deque] = defaultdict(deque)
USERNAME_RE = re.compile(r"^[A-Za-z0-9_]{3,50}$")
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
SEMESTER_RE = re.compile(r"^[1-8]$")


def _database_uri() -> str:
    uri = os.environ.get("DATABASE_URL") or os.environ.get("SQLALCHEMY_DATABASE_URI")
    if not uri:
        return "sqlite:///fastparhai.db"
    if uri.startswith("mysql://"):
        return "mysql+pymysql://" + uri[len("mysql://") :]
    return uri


app = Flask(__name__)
# Use environment SECRET_KEY for production, or default for local development
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-local-key-change-in-production-12345678901234567890")
app.config["SECRET_KEY"] = SECRET_KEY
app.config["SQLALCHEMY_DATABASE_URI"] = _database_uri()
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB
app.config["WTF_CSRF_ENABLED"] = True
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = os.environ.get("SESSION_COOKIE_SECURE", "0") == "1"
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=8)

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = "login"
csrf = CSRFProtect(app)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# --- Models ---


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    is_suspended = db.Column(db.Boolean, default=False)
    semester = db.Column(db.String(20), nullable=True)
    profile_pic = db.Column(db.String(200), nullable=True)
    notes = db.relationship("Note", backref="uploader", lazy=True)
    note_comments = db.relationship(
        "NoteComment", backref="author", lazy=True, foreign_keys="NoteComment.author_id"
    )


class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    course = db.Column(db.String(100), nullable=False)
    semester = db.Column(db.String(20), nullable=False)
    category = db.Column(db.String(100), nullable=False, default="")
    description = db.Column(db.Text, nullable=True)
    filename = db.Column(db.String(200), nullable=False)
    download_count = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    uploader_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    comments = db.relationship(
        "NoteComment",
        backref="note",
        lazy=True,
        cascade="all, delete-orphan",
    )
    upvotes_rel = db.relationship(
        "NoteUpvote", backref="note", lazy=True, cascade="all, delete-orphan"
    )


class NoteUpvote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    note_id = db.Column(db.Integer, db.ForeignKey("note.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    __table_args__ = (db.UniqueConstraint("user_id", "note_id", name="uq_user_note_upvote"),)


class NoteComment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    author_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    note_id = db.Column(db.Integer, db.ForeignKey("note.id"), nullable=False)


class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False, default="general")
    semester = db.Column(db.String(20), nullable=False, default="all")
    tags = db.Column(db.String(300), nullable=True)
    is_anonymous = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    author_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    author = db.relationship("User", foreign_keys=[author_id])
    answers = db.relationship(
        "Answer", backref="question", lazy=True, cascade="all, delete-orphan"
    )


class Answer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey("question.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    author = db.relationship("User", foreign_keys=[author_id])


class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())


class Testimonial(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    author_name = db.Column(db.String(150), nullable=False)
    author_semester = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)


class ActivityLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    actor_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    action = db.Column(db.String(120), nullable=False)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


def allowed_note_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_NOTE_EXTENSIONS


def allowed_image_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS


def is_valid_username(value: str) -> bool:
    return bool(USERNAME_RE.fullmatch(value))


def is_valid_email(value: str) -> bool:
    return bool(EMAIL_RE.fullmatch(value))


def is_valid_semester(value: str | None) -> bool:
    if not value:
        return True
    return bool(SEMESTER_RE.fullmatch(value))


def unique_stored_filename(original: str) -> str:
    base = secure_filename(original)
    if not base:
        base = "file"
    ext = base.rsplit(".", 1)[-1].lower() if "." in base else ""
    stem = base[: -len(ext) - 1] if ext else base
    return f"{uuid.uuid4().hex[:10]}_{stem}.{ext}" if ext else f"{uuid.uuid4().hex[:10]}_{stem}"


def looks_like_allowed_note_content(file_storage, filename: str) -> bool:
    ext = filename.rsplit(".", 1)[1].lower() if "." in filename else ""
    stream = getattr(file_storage, "stream", None)
    if not stream:
        return False
    try:
        pos = stream.tell()
    except Exception:
        pos = None
    header = stream.read(8)
    if pos is not None:
        stream.seek(pos)
    # PDF
    if ext == "pdf":
        return header.startswith(b"%PDF")
    # Legacy MS Office binary container (DOC/PPT)
    if ext in {"doc", "ppt"}:
        return header.startswith(b"\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1")
    # OOXML docs (DOCX/PPTX are zip containers)
    if ext in {"docx", "pptx"}:
        return header.startswith(b"PK\x03\x04")
    return False


def log_activity(action: str, details: str | None = None, actor_id=None):
    try:
        ip = request.remote_addr
    except RuntimeError:
        ip = None
    aid = actor_id
    if aid is None and current_user.is_authenticated:
        aid = current_user.id
    row = ActivityLog(actor_id=aid, action=action, details=details, ip_address=ip)
    db.session.add(row)


def not_suspended(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if current_user.is_authenticated and current_user.is_suspended:
            logout_user()
            flash("Your account has been suspended. Contact an administrator.", "error")
            return redirect(url_for("login"))
        return f(*args, **kwargs)

    return decorated


def check_rate_limit(endpoint: str):
    rule = RATE_LIMIT_RULES.get(endpoint)
    if not rule:
        return
    max_requests, window_seconds = rule
    ip = request.remote_addr or "unknown"
    key = (endpoint, ip)
    now = time.time()
    bucket = _RATE_LIMIT_BUCKETS[key]
    while bucket and (now - bucket[0]) > window_seconds:
        bucket.popleft()
    if len(bucket) >= max_requests:
        abort(429)
    bucket.append(now)


def _sqlite_column_names(table: str) -> set:
    with db.engine.connect() as conn:
        rows = conn.execute(text(f'PRAGMA table_info("{table}")')).fetchall()
    return {r[1] for r in rows}


def migrate_legacy_sqlite():
    uri = app.config.get("SQLALCHEMY_DATABASE_URI") or ""
    if not str(uri).startswith("sqlite"):
        return
    insp = inspect(db.engine)
    if not insp.has_table("user"):
        return
    alters = []
    cols = _sqlite_column_names("user")
    if "is_suspended" not in cols:
        alters.append('ALTER TABLE user ADD COLUMN is_suspended BOOLEAN DEFAULT 0')
    if "semester" not in cols:
        alters.append("ALTER TABLE user ADD COLUMN semester VARCHAR(20)")
    for stmt in alters:
        try:
            with db.engine.connect() as conn:
                conn.execute(text(stmt))
                conn.commit()
        except Exception:
            pass
    if insp.has_table("note"):
        ncols = _sqlite_column_names("note")
        stmts = []
        if "category" not in ncols:
            stmts.append('ALTER TABLE note ADD COLUMN category VARCHAR(100) DEFAULT ""')
        if "description" not in ncols:
            stmts.append("ALTER TABLE note ADD COLUMN description TEXT")
        if "download_count" not in ncols:
            stmts.append("ALTER TABLE note ADD COLUMN download_count INTEGER DEFAULT 0")
        if "created_at" not in ncols:
            stmts.append("ALTER TABLE note ADD COLUMN created_at DATETIME")
        for stmt in stmts:
            try:
                with db.engine.connect() as conn:
                    conn.execute(text(stmt))
                    conn.commit()
            except Exception:
                pass
        if "created_at" in _sqlite_column_names("note"):
            Note.query.filter(Note.created_at.is_(None)).update(
                {Note.created_at: datetime.now(timezone.utc)}, synchronize_session=False
            )
            db.session.commit()
    if insp.has_table("question"):
        qcols = _sqlite_column_names("question")
        qstmts = []
        if "category" not in qcols:
            qstmts.append('ALTER TABLE question ADD COLUMN category VARCHAR(50) DEFAULT "general"')
        if "semester" not in qcols:
            qstmts.append('ALTER TABLE question ADD COLUMN semester VARCHAR(20) DEFAULT "all"')
        if "tags" not in qcols:
            qstmts.append("ALTER TABLE question ADD COLUMN tags VARCHAR(300)")
        if "is_anonymous" not in qcols:
            qstmts.append("ALTER TABLE question ADD COLUMN is_anonymous BOOLEAN DEFAULT 0")
        if "created_at" not in qcols:
            qstmts.append("ALTER TABLE question ADD COLUMN created_at DATETIME")
        for stmt in qstmts:
            try:
                with db.engine.connect() as conn:
                    conn.execute(text(stmt))
                    conn.commit()
            except Exception:
                pass
    if insp.has_table("answer"):
        acols = _sqlite_column_names("answer")
        if "created_at" not in acols:
            try:
                with db.engine.connect() as conn:
                    conn.execute(text("ALTER TABLE answer ADD COLUMN created_at DATETIME"))
                    conn.commit()
            except Exception:
                pass


def upvote_counts_for_notes(note_ids: list[int]) -> dict[int, int]:
    if not note_ids:
        return {}
    rows = (
        db.session.query(NoteUpvote.note_id, func.count(NoteUpvote.id))
        .filter(NoteUpvote.note_id.in_(note_ids))
        .group_by(NoteUpvote.note_id)
        .all()
    )
    return {nid: c for nid, c in rows}


def contributor_score(user_id: int) -> int:
    u = Note.query.filter_by(uploader_id=user_id).count()
    c = NoteComment.query.filter_by(author_id=user_id).count()
    a = Answer.query.filter_by(author_id=user_id).count()
    return u + c + a


class _SimplePagination:
    """Minimal pagination object when ordering cannot use SQL OFFSET."""

    def __init__(self, page: int, per_page: int, total: int, items: list):
        self.page = page
        self.per_page = per_page
        self.total = total
        self.items = items
        self.pages = max(1, (total + per_page - 1) // per_page) if per_page else 1

    @property
    def has_prev(self) -> bool:
        return self.page > 1

    @property
    def has_next(self) -> bool:
        return self.page * self.per_page < self.total


# --- Routes ---


@app.before_request
def apply_rate_limits():
    if request.method == "POST":
        check_rate_limit(request.endpoint or "")


@app.route("/")
def index():
    all_notes = Note.query.order_by(Note.id.desc()).limit(80).all()
    counts = upvote_counts_for_notes([n.id for n in all_notes])
    notes = sorted(all_notes, key=lambda n: counts.get(n.id, 0), reverse=True)[:6]
    testimonials = Testimonial.query.filter_by(is_approved=True).order_by(Testimonial.created_at.desc()).limit(10).all()
    return render_template("index.html", notes=notes, upvote_counts=counts, testimonials=testimonials)


@app.route("/about")
def about():
    testimonials = Testimonial.query.filter_by(is_approved=True).order_by(Testimonial.created_at.desc()).limit(10).all()
    return render_template("about.html", testimonials=testimonials)


@app.route("/submit-testimonial", methods=["POST"])
def submit_testimonial():
    author_name = (request.form.get("author_name") or "").strip()[:150]
    author_semester = (request.form.get("author_semester") or "").strip()[:50]
    content = (request.form.get("content") or "").strip()[:1000]
    
    if not all([author_name, author_semester, content]):
        flash("All fields are required.", "error")
        return redirect(url_for("about"))
    
    if len(content) < 20:
        flash("Testimonial must be at least 20 characters long.", "error")
        return redirect(url_for("about"))
    
    user_id = current_user.id if current_user.is_authenticated else None
    testimonial = Testimonial(
        author_name=author_name,
        author_semester=author_semester,
        content=content,
        user_id=user_id,
        is_approved=False
    )
    db.session.add(testimonial)
    db.session.commit()
    log_activity("testimonial_submitted", f"testimonial_id={testimonial.id}")
    flash("Thank you! Your testimonial has been submitted for review.", "success")
    return redirect(url_for("about"))


@app.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        name = (request.form.get("name") or "").strip()[:150]
        email = (request.form.get("email") or "").strip()[:150]
        subject = (request.form.get("subject") or "").strip()[:200]
        message = (request.form.get("message") or "").strip()[:10000]
        if not all([name, email, subject, message]):
            flash("Please fill all fields.", "error")
            return redirect(url_for("contact"))
        db.session.add(ContactMessage(name=name, email=email, subject=subject, message=message))
        db.session.commit()
        log_activity("contact_submitted", f"subject={subject}")
        flash("Your message has been sent successfully!", "success")
        return redirect(url_for("contact"))
    return render_template("contact.html")


@app.route("/browse-notes")
@login_required
@not_suspended
def browse_notes():
    q = (request.args.get("q") or "").strip()
    semester = (request.args.get("semester") or "").strip()
    course = (request.args.get("course") or "").strip()
    ext = (request.args.get("ext") or "").strip().lower()
    sort = (request.args.get("sort") or "newest").strip()
    page = max(1, int(request.args.get("page", 1)))

    query = Note.query
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                Note.title.ilike(like),
                Note.course.ilike(like),
                func.coalesce(Note.description, "").ilike(like),
            )
        )
    if semester:
        query = query.filter(Note.semester == semester)
    if course:
        query = query.filter(Note.course == course)
    if ext and ext in ALLOWED_NOTE_EXTENSIONS:
        query = query.filter(Note.filename.endswith("." + ext))

    if sort == "popular":
        all_ids = [r[0] for r in query.with_entities(Note.id).all()]
        uv = upvote_counts_for_notes(all_ids)
        ordered_ids = sorted(all_ids, key=lambda i: uv.get(i, 0), reverse=True)
        # paginate in Python for correct sort
        start = (page - 1) * PER_PAGE
        chunk_ids = ordered_ids[start : start + PER_PAGE]
        notes = Note.query.filter(Note.id.in_(chunk_ids)).all() if chunk_ids else []
        id_order = {nid: idx for idx, nid in enumerate(chunk_ids)}
        notes.sort(key=lambda n: id_order.get(n.id, 0))
        pagination = _SimplePagination(page, PER_PAGE, len(ordered_ids), notes)
    elif sort == "downloads":
        query = query.order_by(Note.download_count.desc(), Note.id.desc())
        pagination = query.paginate(page=page, per_page=PER_PAGE, error_out=False)
        notes = pagination.items
    else:
        query = query.order_by(Note.created_at.desc().nullslast(), Note.id.desc())
        pagination = query.paginate(page=page, per_page=PER_PAGE, error_out=False)
        notes = pagination.items
    counts = upvote_counts_for_notes([n.id for n in notes])

    sem_rows = db.session.query(Note.semester).distinct().order_by(Note.semester).all()
    semesters = [r[0] for r in sem_rows] or ["1", "2", "3", "4", "5", "6", "7", "8"]
    course_rows = db.session.query(Note.course).distinct().order_by(Note.course).all()
    courses = [r[0] for r in course_rows] or ["CS101", "CS201"]

    return render_template(
        "browse-notes.html",
        notes=notes,
        upvote_counts=counts,
        semesters=semesters,
        courses=courses,
        page=page,
        pagination=pagination,
        filters={"q": q, "semester": semester, "course": course, "ext": ext, "sort": sort},
    )


@app.route("/note/<int:note_id>")
@login_required
@not_suspended
def note_details(note_id):
    note = Note.query.get_or_404(note_id)
    related = (
        Note.query.filter(Note.id != note_id, Note.course == note.course)
        .order_by(Note.id.desc())
        .limit(4)
        .all()
    )
    upvotes = NoteUpvote.query.filter_by(note_id=note.id).count()
    user_upvoted = False
    if current_user.is_authenticated:
        user_upvoted = (
            NoteUpvote.query.filter_by(note_id=note.id, user_id=current_user.id).first()
            is not None
        )
    comments = (
        NoteComment.query.filter_by(note_id=note.id).order_by(NoteComment.created_at.asc()).all()
    )
    return render_template(
        "note-details.html",
        note=note,
        related_notes=related,
        upvotes=upvotes,
        user_upvoted=user_upvoted,
        comments=comments,
    )


@app.route("/note/<int:note_id>/download")
@login_required
@not_suspended
def download_note(note_id):
    note = Note.query.get_or_404(note_id)
    note.download_count = (note.download_count or 0) + 1
    db.session.commit()
    log_activity("note_download", f"note_id={note.id}", actor_id=current_user.id)
    return send_from_directory(app.config["UPLOAD_FOLDER"], note.filename, as_attachment=True)


@app.route("/note/<int:note_id>/upvote", methods=["POST"])
@login_required
@not_suspended
def toggle_upvote(note_id):
    note = Note.query.get_or_404(note_id)
    existing = NoteUpvote.query.filter_by(note_id=note.id, user_id=current_user.id).first()
    if existing:
        db.session.delete(existing)
        flash("Upvote removed.", "info")
    else:
        db.session.add(NoteUpvote(user_id=current_user.id, note_id=note.id))
        flash("Thanks for the upvote!", "success")
    db.session.commit()
    return redirect(url_for("note_details", note_id=note_id))


@app.route("/note/<int:note_id>/comment", methods=["POST"])
@login_required
@not_suspended
def add_note_comment(note_id):
    note = Note.query.get_or_404(note_id)
    body = (request.form.get("body") or "").strip()
    if not body or len(body) > 8000:
        flash("Comment must be between 1 and 8000 characters.", "error")
        return redirect(url_for("note_details", note_id=note_id))
    db.session.add(NoteComment(body=body, author_id=current_user.id, note_id=note.id))
    db.session.commit()
    log_activity("note_comment", f"note_id={note.id}")
    flash("Comment posted.", "success")
    return redirect(url_for("note_details", note_id=note_id))


@app.route("/forum")
@login_required
@not_suspended
def forum():
    cat = (request.args.get("category") or "all").strip()
    sem = (request.args.get("semester") or "all").strip()
    q = Question.query
    if cat != "all":
        q = q.filter(Question.category == cat)
    if sem != "all":
        q = q.filter(Question.semester == sem)
    questions = q.order_by(Question.created_at.desc().nullslast(), Question.id.desc()).all()
    return render_template("forum.html", questions=questions)


@app.route("/forum/ask", methods=["POST"])
@login_required
@not_suspended
def forum_ask():
    title = (request.form.get("title") or "").strip()[:200]
    content = (request.form.get("content") or "").strip()[:20000]
    category = (request.form.get("category") or "general").strip()[:50]
    semester = (request.form.get("semester") or "all").strip()[:20]
    tags = (request.form.get("tags") or "").strip()[:300]
    anonymous = request.form.get("anonymous") == "on"
    if len(title) < 5 or len(content) < 10:
        flash("Title (min 5) and details (min 10) are required.", "error")
        return redirect(url_for("forum"))
    question = Question(
        title=title,
        content=content,
        category=category,
        semester=semester,
        tags=tags,
        is_anonymous=anonymous,
        author_id=current_user.id,
    )
    db.session.add(question)
    db.session.commit()
    log_activity("forum_question", f"qid={question.id}")
    flash("Question posted.", "success")
    return redirect(url_for("forum_question_detail", question_id=question.id))


@app.route("/forum/question/<int:question_id>")
@login_required
@not_suspended
def forum_question_detail(question_id):
    question = Question.query.get_or_404(question_id)
    answers = (
        Answer.query.filter_by(question_id=question.id)
        .order_by(Answer.created_at.asc().nullslast(), Answer.id.asc())
        .all()
    )
    return render_template(
        "forum_question.html", question=question, answers=answers
    )


@app.route("/answer", methods=["POST"])
@login_required
@not_suspended
def answer():
    question_id = request.form.get("question_id")
    content = (request.form.get("answer") or "").strip()
    if not question_id or not content or len(content) > 20000:
        flash("Invalid answer.", "error")
        return redirect(url_for("forum"))
    qobj = Question.query.get_or_404(int(question_id))
    db.session.add(Answer(content=content, author_id=current_user.id, question_id=qobj.id))
    db.session.commit()
    log_activity("forum_answer", f"question_id={qobj.id}")
    flash("Your answer has been submitted!", "success")
    return redirect(url_for("forum_question_detail", question_id=qobj.id))


@app.route("/profile")
@login_required
@not_suspended
def profile():
    user_notes = Note.query.filter_by(uploader_id=current_user.id).all()
    uploads_count = len(user_notes)
    return render_template("profile.html", user_notes=user_notes, uploads_count=uploads_count)


@app.route("/settings", methods=["GET", "POST"])
@login_required
@not_suspended
def settings():
    if request.method == "POST":
        email = (request.form.get("email") or "").strip().lower()[:150]
        semester = (request.form.get("semester") or "").strip()[:20]
        new_pw = request.form.get("password") or ""
        if email:
            taken = User.query.filter(User.email == email, User.id != current_user.id).first()
            if taken:
                flash("That email is already in use.", "error")
                return redirect(url_for("settings"))
            current_user.email = email
        current_user.semester = semester or None
        if new_pw:
            if len(new_pw) < 8:
                flash("Password must be at least 8 characters.", "error")
                return redirect(url_for("settings"))
            current_user.password = generate_password_hash(new_pw)
        db.session.commit()
        log_activity("profile_update", "settings saved")
        flash("Settings updated!", "success")
        return redirect(url_for("settings"))
    return render_template("settings.html")


@app.route("/leaderboard")
@login_required
def leaderboard():
    users = User.query.filter_by(is_admin=False).all()
    ranked = []
    for u in users:
        if u.is_suspended:
            continue
        ranked.append((u, contributor_score(u.id)))
    ranked.sort(key=lambda x: -x[1])
    ranked = ranked[:50]
    return render_template("leaderboard.html", ranked=ranked)


@app.route("/admin-dashboard")
@login_required
def admin_dashboard():
    if not current_user.is_admin:
        abort(403)
    total_users = User.query.count()
    total_notes = Note.query.count()
    suspended_users = User.query.filter_by(is_suspended=True).count()
    recent_notes = Note.query.order_by(Note.id.desc()).limit(10).all()
    recent_users = User.query.order_by(User.id.desc()).limit(15).all()
    recent_events = ActivityLog.query.order_by(ActivityLog.id.desc()).limit(10).all()
    return render_template(
        "admin-dashboard.html",
        total_users=total_users,
        total_notes=total_notes,
        suspended_users=suspended_users,
        recent_notes=recent_notes,
        recent_users=recent_users,
        recent_events=recent_events,
    )


@app.route("/admin/health")
@login_required
def admin_health():
    if not current_user.is_admin:
        abort(403)
    db_ok = True
    users_count = 0
    notes_count = 0
    try:
        users_count = User.query.count()
        notes_count = Note.query.count()
    except Exception:
        db_ok = False
    return {
        "status": "ok" if db_ok else "degraded",
        "database_ok": db_ok,
        "users": users_count,
        "notes": notes_count,
        "server_time_utc": datetime.now(timezone.utc).isoformat(),
    }


@app.route("/admin/analytics")
@login_required
def admin_analytics():
    if not current_user.is_admin:
        abort(403)
    alln = Note.query.all()
    uc = upvote_counts_for_notes([n.id for n in alln])
    top_sorted = sorted(alln, key=lambda n: uc.get(n.id, 0), reverse=True)[:20]
    top_notes = [(n, uc.get(n.id, 0)) for n in top_sorted]
    most_downloaded = (
        Note.query.order_by(Note.download_count.desc(), Note.id.desc()).limit(20).all()
    )
    users = User.query.filter_by(is_admin=False).all()
    contrib = [(u, contributor_score(u.id)) for u in users if not u.is_suspended]
    contrib.sort(key=lambda x: -x[1])
    top_contributors = contrib[:20]
    return render_template(
        "admin-analytics.html",
        top_notes=top_notes,
        top_contributors=top_contributors,
        most_downloaded=most_downloaded,
    )


@app.route("/admin/users", methods=["GET", "POST"])
@login_required
def admin_users():
    if not current_user.is_admin:
        abort(403)
    if request.method == "POST":
        uid = int(request.form.get("user_id", 0))
        action = request.form.get("action")
        u = User.query.get_or_404(uid)
        if u.id == current_user.id:
            flash("You cannot modify your own account this way.", "error")
            return redirect(url_for("admin_users"))
        if action == "suspend":
            u.is_suspended = True
            log_activity("admin_suspend_user", f"target={u.username}", actor_id=current_user.id)
            flash(f"Suspended {u.username}.", "success")
        elif action == "unsuspend":
            u.is_suspended = False
            log_activity("admin_unsuspend_user", f"target={u.username}", actor_id=current_user.id)
            flash(f"Reactivated {u.username}.", "success")
        elif action == "toggle_admin":
            u.is_admin = not u.is_admin
            log_activity("admin_toggle_admin", f"target={u.username} admin={u.is_admin}")
            flash("Admin flag updated.", "success")
        db.session.commit()
        return redirect(url_for("admin_users"))
    users = User.query.order_by(User.id.desc()).all()
    return render_template("admin-users.html", users=users)


@app.route("/admin/comments")
@login_required
def admin_comments():
    if not current_user.is_admin:
        abort(403)
    comments = (
        NoteComment.query.order_by(NoteComment.created_at.desc().nullslast(), NoteComment.id.desc())
        .limit(200)
        .all()
    )
    return render_template("admin-comments.html", comments=comments)


@app.route("/admin/testimonials", methods=["GET", "POST"])
@login_required
def admin_testimonials():
    if not current_user.is_admin:
        abort(403)
    if request.method == "POST":
        testimonial_id = int(request.form.get("testimonial_id", 0))
        action = request.form.get("action")
        testimonial = Testimonial.query.get_or_404(testimonial_id)
        if action == "approve":
            testimonial.is_approved = True
            log_activity("admin_approve_testimonial", f"testimonial_id={testimonial_id}")
            flash("Testimonial approved.", "success")
        elif action == "reject":
            db.session.delete(testimonial)
            log_activity("admin_reject_testimonial", f"testimonial_id={testimonial_id}")
            flash("Testimonial rejected.", "success")
        db.session.commit()
        return redirect(url_for("admin_testimonials"))
    
    pending = Testimonial.query.filter_by(is_approved=False).order_by(Testimonial.created_at.desc()).all()
    approved = Testimonial.query.filter_by(is_approved=True).order_by(Testimonial.created_at.desc()).limit(50).all()
    return render_template("admin-testimonials.html", pending=pending, approved=approved)


@app.route("/admin/delete-comment/<int:comment_id>", methods=["POST"])
@login_required
def admin_delete_comment(comment_id):
    if not current_user.is_admin:
        abort(403)
    c = NoteComment.query.get_or_404(comment_id)
    db.session.delete(c)
    db.session.commit()
    log_activity("admin_delete_comment", f"comment_id={comment_id}")
    flash("Comment removed.", "success")
    return redirect(url_for("admin_comments"))


@app.route("/admin/logs")
@login_required
def admin_logs():
    if not current_user.is_admin:
        abort(403)
    logs = ActivityLog.query.order_by(ActivityLog.id.desc()).limit(200).all()
    return render_template("admin-logs.html", logs=logs)


@app.route("/admin/delete-answer/<int:answer_id>", methods=["POST"])
@login_required
def admin_delete_answer(answer_id):
    if not current_user.is_admin:
        abort(403)
    a = Answer.query.get_or_404(answer_id)
    qid = a.question_id
    db.session.delete(a)
    db.session.commit()
    log_activity("admin_delete_answer", f"answer_id={answer_id}")
    flash("Answer removed.", "success")
    return redirect(url_for("forum_question_detail", question_id=qid))


@app.route("/admin/delete-question/<int:question_id>", methods=["POST"])
@login_required
def admin_delete_question(question_id):
    if not current_user.is_admin:
        abort(403)
    q = Question.query.get_or_404(question_id)
    db.session.delete(q)
    db.session.commit()
    log_activity("admin_delete_question", f"question_id={question_id}")
    flash("Question removed.", "success")
    return redirect(url_for("forum"))


@app.route("/admin/manage-resources")
@login_required
def manage_resources():
    if not current_user.is_admin:
        abort(403)
    notes = Note.query.order_by(Note.id.desc()).all()
    return render_template("manage-resources.html", notes=notes)


@app.route("/admin/delete-note/<int:note_id>", methods=["POST"])
@login_required
def delete_note(note_id):
    if not current_user.is_admin:
        abort(403)
    note = Note.query.get_or_404(note_id)
    try:
        os.remove(os.path.join(app.config["UPLOAD_FOLDER"], note.filename))
    except OSError:
        pass
    db.session.delete(note)
    db.session.commit()
    log_activity("admin_delete_note", f"note_id={note_id}")
    flash("Note deleted successfully!", "success")
    return redirect(url_for("manage_resources"))


@app.route("/upload-notes", methods=["GET", "POST"])
@login_required
@not_suspended
def upload_notes():
    if request.method == "POST":
        title = (request.form.get("title") or "").strip()[:200]
        course = (request.form.get("course") or "").strip()[:100]
        semester = (request.form.get("semester") or "").strip()[:20]
        category = (request.form.get("category") or request.form.get("tags") or "").strip()[:100]
        description = (request.form.get("description") or "").strip()[:10000] or None
        file = request.files.get("file")
        if not title or not course or not semester:
            flash("Title, course, and semester are required.", "error")
            return redirect(url_for("upload_notes"))
        if not file or not file.filename:
            flash("Please choose a file.", "error")
            return redirect(url_for("upload_notes"))
        if not allowed_note_file(file.filename):
            flash("Invalid file type. Allowed: PDF, DOC/DOCX, PPT/PPTX.", "error")
            return redirect(url_for("upload_notes"))
        if not looks_like_allowed_note_content(file, file.filename):
            flash("File content does not match an allowed note format.", "error")
            return redirect(url_for("upload_notes"))
        filename = unique_stored_filename(file.filename)
        stored_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(stored_path)
        try:
            note = Note(
                title=title,
                course=course,
                semester=semester,
                category=category,
                description=description,
                filename=filename,
                uploader_id=current_user.id,
            )
            db.session.add(note)
            db.session.commit()
        except Exception:
            db.session.rollback()
            try:
                os.remove(stored_path)
            except OSError:
                pass
            flash("Upload failed. Please try again.", "error")
            return redirect(url_for("upload_notes"))
        log_activity("note_upload", f"note_id={note.id}")
        flash("Note uploaded successfully!", "success")
        return redirect(url_for("dashboard"))
    return render_template("upload-notes.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = (request.form.get("username") or "").strip()[:150]
        email = (request.form.get("email") or "").strip().lower()[:150]
        password = request.form.get("password") or ""
        semester = (request.form.get("semester") or "").strip()[:20] or None
        profile_pic = request.files.get("profilePicture")
        profile_pic_filename = None
        if profile_pic and profile_pic.filename:
            if not allowed_image_file(profile_pic.filename):
                flash("Profile picture must be PNG, JPG, JPEG, WEBP, or GIF.", "error")
                return redirect(url_for("register"))
            profile_pic_filename = unique_stored_filename(profile_pic.filename)
            profile_pic.save(os.path.join(app.config["UPLOAD_FOLDER"], profile_pic_filename))
        if len(username) < 3 or len(password) < 8:
            flash("Username (min 3) and password (min 8) required.", "error")
            return redirect(url_for("register"))
        if not is_valid_username(username):
            flash("Username can only contain letters, numbers, and underscore.", "error")
            return redirect(url_for("register"))
        if not is_valid_email(email):
            flash("Please provide a valid email address.", "error")
            return redirect(url_for("register"))
        if semester and not is_valid_semester(semester):
            flash("Semester must be between 1 and 8.", "error")
            return redirect(url_for("register"))
        if User.query.filter((User.username == username) | (User.email == email)).first():
            flash("Username or email already exists!", "error")
            return redirect(url_for("register"))
        try:
            user = User(
                username=username,
                email=email,
                password=generate_password_hash(password),
                semester=semester,
                profile_pic=profile_pic_filename,
                is_admin=False,
            )
            db.session.add(user)
            db.session.commit()
        except Exception:
            db.session.rollback()
            if profile_pic_filename:
                try:
                    os.remove(os.path.join(app.config["UPLOAD_FOLDER"], profile_pic_filename))
                except OSError:
                    pass
            flash("Registration failed. Please try again.", "error")
            return redirect(url_for("register"))
        log_activity("register", f"username={username}", actor_id=user.id)
        return render_template("register_success.html", username=username)
    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = (request.form.get("username") or "").strip()
        password = request.form.get("password") or ""
        user = User.query.filter_by(username=username).first()
        if not user or not check_password_hash(user.password, password):
            flash("Invalid username or password!", "error")
            return redirect(url_for("login"))
        if user.is_suspended:
            flash("This account has been suspended.", "error")
            return redirect(url_for("login"))
        login_user(user)
        log_activity("login", f"user={user.username}", actor_id=user.id)
        return redirect(url_for("dashboard"))
    return render_template("login.html")


@app.route("/logout")
@login_required
def logout():
    log_activity("logout", actor_id=current_user.id)
    logout_user()
    return redirect(url_for("login"))


@app.route("/dashboard")
@login_required
@not_suspended
def dashboard():
    uploads_count = Note.query.filter_by(uploader_id=current_user.id).count()
    dl_total = (
        db.session.query(func.coalesce(func.sum(Note.download_count), 0))
        .filter(Note.uploader_id == current_user.id)
        .scalar()
    )
    my_upvotes = (
        db.session.query(func.count(NoteUpvote.id))
        .join(Note, Note.id == NoteUpvote.note_id)
        .filter(Note.uploader_id == current_user.id)
        .scalar()
    )
    tn = Note.query.order_by(Note.id.desc()).limit(40).all()
    tuc = upvote_counts_for_notes([n.id for n in tn])
    top_ids = sorted([n.id for n in tn], key=lambda i: tuc.get(i, 0), reverse=True)[:4]
    trending = []
    for i in top_ids:
        n = db.session.get(Note, i)
        if n:
            trending.append((n, tuc.get(i, 0)))
    return render_template(
        "dashboard.html",
        uploads_count=uploads_count,
        downloads_count=int(dl_total or 0),
        avg_rating=int(my_upvotes or 0),
        trending_notes=trending,
    )


@app.route("/upload", methods=["GET", "POST"])
@login_required
@not_suspended
def upload():
    return redirect(url_for("upload_notes"))


@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


def bootstrap_admin():
    """Create default admin account on first run."""
    admin_user = User.query.filter_by(username="admin").first()
    if admin_user:
        return
    u = User(
        username="admin",
        email="admin@fast.edu.pk",
        password=generate_password_hash("Admin123456"),
        is_admin=True,
    )
    db.session.add(u)
    db.session.commit()
    print("✓ Default admin account created: admin / Admin123456")


@app.errorhandler(403)
def forbidden_error(error):
    return render_template("403.html"), 403


@app.errorhandler(429)
def too_many_requests(error):
    return "Too many requests. Please wait and try again.", 429


@app.after_request
def add_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "img-src 'self' data: https://via.placeholder.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; "
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; "
        "script-src 'self' 'unsafe-inline'; "
        "connect-src 'self'; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'"
    )
    return response


# Initialize DB at import time so gunicorn picks it up too
with app.app_context():
    db.create_all()
    migrate_legacy_sqlite()
    db.create_all()
    bootstrap_admin()
    print("✓ FAST Parhai initialized successfully!")

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
