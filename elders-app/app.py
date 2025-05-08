from flask import Flask, render_template, request, redirect
from db_config import connect

app = Flask(__name__)

# Home Page
@app.route('/')
def home():
    conn = connect()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM residents")
    resident_count = cursor.fetchone()[0]
    conn.close()
    return render_template('home.html', resident_count=resident_count)

# Residents
@app.route('/residents')
def residents():
    conn = connect()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM residents ORDER BY resident_id ASC")
    data = cursor.fetchall()
    conn.close()
    return render_template('residents.html', residents=data)

@app.route('/add_resident', methods=['POST'])
def add_resident():
    conn = connect()
    cursor = conn.cursor()
    # Insert into residents table
    query = """
        INSERT INTO residents (first_name, last_name, dob, gender, admission_date, room_number)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    values = (
        request.form['first_name'],
        request.form['last_name'],
        request.form['dob'],
        request.form['gender'],
        request.form['admission_date'],
        request.form['room_number']
    )
    cursor.execute(query, values)
    conn.commit()
    # Get the new resident's ID
    cursor.execute("SELECT LAST_INSERT_ID()")
    resident_id = cursor.fetchone()[0]
    # Create empty records in related tables
    cursor.execute("""
        INSERT INTO health_details (resident_id, medical_conditions, mobility_status, cognitive_condition, daily_routine)
        VALUES (%s, %s, %s, %s, %s)
    """, (resident_id, "None recorded", "Not assessed", "Not assessed", "Standard"))
    cursor.execute("""
        INSERT INTO food_preferences (resident_id, dietary_restrictions, preferred_cuisine)
        VALUES (%s, %s, %s)
    """, (resident_id, "None recorded", "Standard"))
    conn.commit()
    conn.close()
    return redirect('/residents')

@app.route('/delete_resident/<int:resident_id>', methods=['POST'])
def delete_resident(resident_id):
    conn = connect()
    cursor = conn.cursor()
    # Delete from related tables first
    cursor.execute("DELETE FROM food_preferences WHERE resident_id = %s", (resident_id,))
    cursor.execute("DELETE FROM health_details WHERE resident_id = %s", (resident_id,))
    cursor.execute("DELETE FROM guardians WHERE resident_id = %s", (resident_id,))
    # Then delete the resident
    cursor.execute("DELETE FROM residents WHERE resident_id = %s", (resident_id,))
    conn.commit()
    conn.close()
    return redirect('/residents')

# Guardians
@app.route('/guardians')
def guardians():
    conn = connect()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM guardians")
    data = cursor.fetchall()
    conn.close()
    return render_template('guardians.html', guardians=data)

@app.route('/add_guardian', methods=['POST'])
def add_guardian():
    conn = connect()
    cursor = conn.cursor()
    query = """
        INSERT INTO guardians (resident_id, guardian_name, guardian_contact, guardian_relationship, guardian_address, guardian_email)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    values = (
        request.form['resident_id'],
        request.form['guardian_name'],
        request.form['guardian_contact'],
        request.form['guardian_relationship'],
        request.form['guardian_address'],
        request.form['guardian_email']
    )
    cursor.execute(query, values)
    conn.commit()
    conn.close()
    return redirect('/guardians')

# Health Details
@app.route('/health')
def health():
    conn = connect()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM health_details")
    data = cursor.fetchall()
    conn.close()
    return render_template('health_details.html', health=data)

@app.route('/update_health/<int:health_id>', methods=['POST'])
def update_health(health_id):
    conn = connect()
    cursor = conn.cursor()
    query = """
        UPDATE health_details
        SET medical_conditions = %s, mobility_status = %s, cognitive_condition = %s, daily_routine = %s
        WHERE health_id = %s
    """
    values = (
        request.form['medical_conditions'],
        request.form['mobility_status'],
        request.form['cognitive_condition'],
        request.form['daily_routine'],
        health_id
    )
    cursor.execute(query, values)
    conn.commit()
    conn.close()
    return redirect('/health')

# Food Preferences
@app.route('/food')
def food():
    conn = connect()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM food_preferences")
    data = cursor.fetchall()
    conn.close()
    return render_template('food_preferences.html', food=data)

@app.route('/update_food/<int:food_id>', methods=['POST'])
def update_food(food_id):
    conn = connect()
    cursor = conn.cursor()
    query = """
        UPDATE food_preferences
        SET dietary_restrictions = %s, preferred_cuisine = %s
        WHERE food_id = %s
    """
    values = (
        request.form['dietary_restrictions'],
        request.form['preferred_cuisine'],
        food_id
    )
    cursor.execute(query, values)
    conn.commit()
    conn.close()
    return redirect('/food')

# Reports
@app.route('/reports')
def reports():
    conn = connect()
    cursor = conn.cursor()
    cursor.execute("SELECT gender, COUNT(*) FROM residents GROUP BY gender")
    gender_count = cursor.fetchall()
    conn.close()
    return render_template('reports.html', gender_count=gender_count)

if __name__ == '__main__':
    app.run(debug=True)
