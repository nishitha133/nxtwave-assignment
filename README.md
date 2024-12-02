# **Login and Registration System**

## **Project Description**
This project is a user login, registration, and account management system. It uses Node.js and Express for the backend and SQLite for data storage. The application includes OTP-based two-factor authentication for enhanced security.

---

## **Features**
### **1. Login**
- Users can log in with their email and password.
- A 6-digit OTP (valid for 10 minutes) is sent to their email for two-factor authentication.
- After OTP verification, users are redirected to a "Thank You" page with their account details.

### **2. Registration**
- New users can register by providing:
  - Name, Email, Password, Company Name, Age, Date of Birth (DOB), and Profile Image (PNG/JPG).
- All input fields are validated.
- Profile images are uploaded and stored in the database.

### **3. Account Management**
- Logged-in users can delete their accounts from the "Thank You" page.

### **4. Error Handling**
- Invalid login credentials lead to an error page with the message: *"Sorry, we can't log you in."*

---

## **Technologies Used**
- **Backend**: Node.js, Express.js, SQLite
- **Frontend**: HTML, CSS
- **Authentication**: OTP-based Two-Factor Authentication
- **Image Handling**: Multer (file upload)

---

## **Installation Guide**
### **1. Prerequisites**
- Node.js (v16 or higher)
- npm (Node Package Manager)

### **2. Clone the Repository**
```bash
git clone https://github.com/nishitha133/nxtwave-assignment/
cd nxtwave-assignment
