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

# Fetch Drug Data
# Fetch Drug Data
@app.route('/api/drug-info', methods=['GET'])
def get_drug_info():
    import requests
    from flask import request, jsonify

    drug_name = request.args.get('name')
    if not drug_name:
        return jsonify({'error': 'No drug name provided'}), 400

    # Step 1: Get RXCUI (RxNorm ID)
    try:
        rxcui_resp = requests.get(
            f'https://rxnav.nlm.nih.gov/REST/rxcui.json?name={drug_name}', timeout=10
        )
        rxcui_resp.raise_for_status()
        rxcui_data = rxcui_resp.json()
        rxcui = rxcui_data.get('idGroup', {}).get('rxnormId', [None])[0]
        if not rxcui:
            return jsonify({'error': 'Drug not found in RxNorm'}), 404
    except (requests.RequestException, ValueError) as e:
        print("Error fetching RXCUI:", e)
        return jsonify({'error': 'Failed to fetch RXCUI'}), 502

    # Step 2: Get interaction data
    interaction_list = []
    try:
        interactions_resp = requests.get(
            f'https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui={rxcui}', timeout=10
        )
        interactions_resp.raise_for_status()
        interactions_data = interactions_resp.json()
        for group in interactions_data.get('interactionTypeGroup', []):
            for interaction_type in group.get('interactionType', []):
                for pair in interaction_type.get('interactionPair', []):
                    interaction_list.append({
                        'interacts_with': pair['interactionConcept'][1]['minConceptItem']['name'],
                        'description': pair['description']
                    })
    except requests.HTTPError as e:
        if interactions_resp.status_code == 404:
            print(f"No interactions found for rxcui={rxcui}")
        else:
            print("HTTP error during interactions fetch:", e)
        # Not a blocker, allow continuing with empty interaction list
    except (requests.RequestException, ValueError) as e:
        print("Error fetching interactions:", e)
        return jsonify({'error': 'Failed to fetch drug interactions'}), 502

    # Step 3: Get drug label data from OpenFDA
    try:
        fda_resp = requests.get(
            f'https://api.fda.gov/drug/label.json?search={drug_name}&limit=1', timeout=10
        )
        fda_resp.raise_for_status()
        fda_data = fda_resp.json()
        if not fda_data.get('results'):
            return jsonify({'error': 'Drug label not found'}), 404

        label = fda_data['results'][0]
        brand_name = label.get('openfda', {}).get('brand_name', ["Unknown"])[0]
        manufacturer = label.get('openfda', {}).get('manufacturer_name', ["Unknown"])[0]
        usage = label.get('indications_and_usage', ["N/A"])[0]
        side_effects = label.get('adverse_reactions', ["N/A"])[0]
        warnings = label.get('warnings', ["N/A"])[0]
    except (requests.RequestException, ValueError) as e:
        print("Error fetching FDA data:", e)
        return jsonify({'error': 'Failed to fetch drug label data'}), 502

    return jsonify({
        'brand_name': brand_name,
        'manufacturer': manufacturer,
        'usage': usage,
        'side_effects': side_effects,
        'warnings': warnings,
        'interactions': interaction_list  # This may be an empty list if not found
    })


# Logout Route
@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))

from functools import wraps
from flask import make_response

def nocache(view):
    @wraps(view)
    def no_cache(*args, **kwargs):
        response = make_response(view(*args, **kwargs))
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "-1"
        return response
    return no_cache


# Protected Dashboard Route
@app.route("/dashboard")
@nocache
def dashboard():
    if "user_id" not in session:
        flash("Please log in first.", "warning")
        return redirect(url_for("login"))
    return render_template("dashboard.html", email=session["email"])

@app.route('/patients')
def patients():
    if "user_id" not in session:
        flash("Please log in first.", "warning")
        return redirect(url_for("login"))
    return render_template('patients.html', staff_id=session["user_id"])


  # Looks in `templates/patients.html`

@app.route('/schedule')
def schedule():
    return render_template('schedule-App.html') 
 
@app.route('/medreport')
def medReport():
    return render_template('Med-Report.html')  

@app.route('/notification')
def notification():
    return render_template('notification.html') 
 
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