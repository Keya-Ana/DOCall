# Health & Medication Reminder  

## 📌 Project Overview  
The **Health & Medication Reminder** is a Flask-based web application that helps users track their medications, set reminders, and receive alerts. It ensures users never miss a dose by providing a simple, intuitive interface to manage their medication schedules.  

## 🛠️ Technologies Used  
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Flask (Python)  
- **Database:** SQLite3  
- **Version Control:** Git  

## 🔥 Features  
✅ **User Authentication** – Secure login with session-based authentication  
✅ **Medication Management** – Add, edit, and delete medications (Name, Dosage, Time)  
✅ **Automated Reminders** – Set reminders & receive notifications  
✅ **Track Medication History** – View past and upcoming doses  

## ⚙️ Setup Instructions  
1. **Clone the Repository:**  
   ```bash
   git clone <repo_url>
   cd health-medication-reminder

install dependencies
   pip install -r requirements.txt
     pip install Flask

Run the application
   python app.py http://127.0.0.1:5000 + route

🌐 API Integration

The app can fetch external health-related data using APIs (e.g., drug interactions or health tips). API integration details will be updated soon.
   
📂 Database Schema
The application uses SQLite3 with two main tables:
1. Users Table (users) Format
Eg:
+----+-----------+------------------+------------+
| id | username  | email            | password   |
+----+-----------+------------------+------------+
| 1  | john_doe  | john@example.com | hashed_pw1 |
| 2  | jane_doe  | jane@example.com | hashed_pw2 |
+----+-----------+------------------+------------+

2. Medications Table (medications) Format
Eg:
+----+---------+-------------+--------+-----------+
| id | user_id | name        | dosage | time      |
+----+---------+-------------+--------+-----------+
| 1  | 1       | Paracetamol | 500mg  | 08:00 AM  |
| 2  | 2       | Ibuprofen   | 200mg  | 02:00 PM  |
+----+---------+-------------+--------+-----------+