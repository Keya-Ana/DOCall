import sqlite3
from flask import Flask, render_template, request, redirect, url_for, session, flash
import sqlite3
from werkzeug.security import check_password_hash, generate_password_hash
 
def create_tables():
    conn = sqlite3.connect("med_reminder.db")
    cursor = conn.cursor()

    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL)''')

    conn.commit()
    conn.close()

if __name__ == "__main__":
    create_tables()


app = Flask(__name__)
app.secret_key = "your_secret_key"  

def get_db_connection():
    conn = sqlite3.connect("med_reminder.db")
    conn.row_factory = sqlite3.Row  # To get dict-like results
    return conn

# Login Route
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        # Check if this is a login or signup request
        if 'signup-name' in request.form:
            # Handle signup
            username = request.form["signup-name"]
            email = request.form["signup-email"]
            password = request.form["signup-password"]
            confirm_password = request.form["signup-confirm"]
            
            if password != confirm_password:
                flash("Passwords don't match!", "danger")
                return redirect(url_for("login"))
            
            hashed_password = generate_password_hash(password)
            
            conn = get_db_connection()
            try:
                conn.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                             (username, email, hashed_password))
                conn.commit()
                flash("Registration successful! Please log in.", "success")
                return redirect(url_for("login"))
            except sqlite3.IntegrityError:
                flash("Email already exists.", "danger")
                return redirect(url_for("login"))
            finally:
                conn.close()
        else:
            # Handle login
            email = request.form["email"]
            password = request.form["password"]
            
            conn = get_db_connection()
            user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
            conn.close()
            
            if user and check_password_hash(user["password"], password):
                session["user_id"] = user["id"]
                session["email"] = user["email"]
                return redirect(url_for("dashboard"))
            else:
                flash("Invalid email or password.", "danger")
                return redirect(url_for("login"))
    
    return render_template("login1.html")
# Logout Route
@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))

# Protected Dashboard Route
@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        flash("Please log in first.", "warning")
        return redirect(url_for("login"))
    return render_template("dashboard.html", email=session["email"])

@app.route('/patients')
def patients():
    return render_template('patients.html')  # Looks in `templates/patients.html`

@app.route('/schedule')
def schedule():
    return render_template('schedule-App.html') 
 
@app.route('/medreport')
def medReport():
    return render_template('Med-Report.html')  

@app.route('/notification')
def medNotification():
    return render_template('med-Notification.html') 
 
@app.route('/analytics')
def analytics():
    return render_template('analysis.html')
  
@app.route('/chat')
def chat():
    return render_template('chat.html')  

@app.route('/staff')
def staff():
    return render_template('staff.html')  

if __name__ == "__main__":
    app.run(debug=True)