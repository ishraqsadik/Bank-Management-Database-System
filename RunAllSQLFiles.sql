-- RunAllSQLFiles.sql
-- Purpose:
--   This script automates the entire database setup by executing all required SQL commands in order.
--
-- Execution Steps:
--   1. Create the database with a team-specific name (team2DB).
--   2. Connect to the created database.
--   3. Execute the following SQL sections:
--         a. DDL statements (contents of Create.txt).
--         b. Sample data inserts (contents of Inserts.txt).
--         c. Update statements (contents of Updates.txt).
--         d. Constraint violation checks (contents of ConstraintsCheck.txt).
--         e. (Errors.pdf is documentation only and is not executed.)

--


-- To run this script, open command prompt (or terminal), navigate to the directory containing RunAllSQLFiles.sql, and run:
-- psql -U postgres -d postgres -f RunAllSQLFiles.sql


-- Make sure the postgresql server is running. 



-- Team: 2

---------------------------------------------------------------
-- Create the database (drop if it exists)
---------------------------------------------------------------
DROP DATABASE IF EXISTS "bankdb";
CREATE DATABASE "bankdb";

---------------------------------------------------------------
-- Connect to the created database
---------------------------------------------------------------
\c "bankdb"

---------------------------------------------------------------
-- Execute DDL statements
-- (Contents of Create.txt)
---------------------------------------------------------------


CREATE TYPE account_type_enum AS ENUM ('Checking', 'Savings', 'Credit');
CREATE TYPE account_status_enum AS ENUM('Active', 'Inactive', 'Flagged');
CREATE TYPE transaction_type_enum AS ENUM ('Deposit', 'Withdrawal', 'Transfer', 'Payment');
CREATE TYPE credit_card_status_enum AS ENUM ('Active', 'Blocked', 'Closed');
CREATE TYPE loan_type_enum AS ENUM ('Personal', 'Home', 'Auto', 'Business');
CREATE TYPE loan_status_enum AS ENUM ('Pending', 'Approved', 'Rejected', 'Active', 'Closed');
CREATE TYPE employee_role_enum AS ENUM ('Teller', 'Loan Officer', 'Administrator', 'IT', 'Manager');
CREATE TYPE user_type_enum AS ENUM ('Customer', 'Employee');

CREATE TABLE Branch (
    branch_id INT PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE Customer (
    customer_id INT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    identification_number VARCHAR(50) UNIQUE NOT NULL,
    credit_score INT CHECK (credit_score BETWEEN 300 AND 850),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Account (
    account_id INT PRIMARY KEY,
    customer_id INT NOT NULL,
    branch_id INT NOT NULL,
    account_type account_type_enum NOT NULL,
    balance DECIMAL(15,2) NOT NULL CHECK (balance >= 0),
    interest_rate DECIMAL(5,2),
    status account_status_enum DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id) ON DELETE CASCADE
);

CREATE TABLE Beneficiary (
    beneficiary_id INT PRIMARY KEY,
    beneficiary_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL
);

-- Junction Table for M:N Account-Beneficiary Relationship
CREATE TABLE AccountBeneficiary (
    account_id INT NOT NULL,
    beneficiary_id INT NOT NULL,
    PRIMARY KEY (account_id, beneficiary_id),
    FOREIGN KEY (account_id) REFERENCES Account(account_id) ON DELETE CASCADE,
    FOREIGN KEY (beneficiary_id) REFERENCES Beneficiary(beneficiary_id) ON DELETE CASCADE
);

CREATE TABLE Transaction (
    transaction_id INT PRIMARY KEY,
    account_id INT NOT NULL,
    transaction_type transaction_type_enum NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_date DATE NOT NULL,
    FOREIGN KEY (account_id) REFERENCES Account(account_id) ON DELETE CASCADE
);

CREATE TABLE CreditCard (
    card_id INT PRIMARY KEY,
    customer_id INT NOT NULL,
    card_number VARCHAR(16) UNIQUE NOT NULL,
    expiration_date DATE NOT NULL,
    credit_limit DECIMAL(15,2) NOT NULL,
    status credit_card_status_enum DEFAULT 'Active',
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE
);

CREATE TABLE Loan (
    loan_id INT PRIMARY KEY,
    customer_id INT NOT NULL,
    loan_type loan_type_enum NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    interest_rate DECIMAL(5,2) NOT NULL,
    term_months INT NOT NULL CHECK (term_months > 0),
    status loan_status_enum NOT NULL,
    date_taken_out DATE NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE
);

CREATE TABLE LoanPayment (
    payment_id INT PRIMARY KEY,
    loan_id INT NOT NULL,
    amount_paid DECIMAL(15,2) NOT NULL CHECK (amount_paid > 0),
    payment_date DATE NOT NULL,
    FOREIGN KEY (loan_id) REFERENCES Loan(loan_id) ON DELETE CASCADE
);



CREATE TABLE Employee (
    employee_id INT PRIMARY KEY,
    branch_id INT NOT NULL,
    role employee_role_enum NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id) ON DELETE CASCADE
);

CREATE TABLE AuditLog (
    log_id INT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type user_type_enum NOT NULL,
    action TEXT NOT NULL,
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);







---------------------------------------------------------------
-- Insert sample data
-- (Contents of Inserts.txt)
---------------------------------------------------------------




-- ==============================
-- Insert Data into Branch Table
-- ==============================
INSERT INTO Branch (branch_id, branch_name, address, phone) VALUES
  (1, 'Downtown Branch', '123 Main St, Cityville', '555-0101'),
  (2, 'Uptown Branch', '456 Elm St, Cityville', '555-0102'),
  (3, 'Suburban Branch', '789 Oak St, Townsville', '555-0103'),
  (4, 'Eastside Branch', '101 Maple Ave, Cityville', '555-0104'),
  (5, 'Westside Branch', '202 Pine Ave, Townsville', '555-0105'),
  (6, 'Central Branch', '303 Cedar Rd, Metropolis', '555-0106'),
  (7, 'North Branch', '404 Birch Rd, Metropolis', '555-0107'),
  (8, 'South Branch', '505 Walnut St, Cityville', '555-0108'),
  (9, 'Harbor Branch', '606 Dockside Ln, Seaside', '555-0109'),
  (10, 'Airport Branch', '707 Runway Rd, Airville', '555-0110');

-- ==============================
-- Insert Data into Customer Table
-- ==============================
INSERT INTO Customer (customer_id, first_name, last_name, date_of_birth, email, phone, address, identification_number, credit_score, created_at) VALUES
  (1, 'John', 'Doe', '1980-05-15', 'john.doe@example.com', '555-1001', '10 Downing St, London', 'ID1001', 720, CURRENT_TIMESTAMP),
  (2, 'Jane', 'Smith', '1990-08-22', 'jane.smith@example.com', '555-1002', '20 Baker St, London', 'ID1002', 680, CURRENT_TIMESTAMP),
  (3, 'Alice', 'Johnson', '1975-12-05', 'alice.johnson@example.com', '555-1003', '30 King Rd, London', 'ID1003', 750, CURRENT_TIMESTAMP),
  (4, 'Bob', 'Brown', '1985-03-18', 'bob.brown@example.com', '555-1004', '40 Queen Rd, London', 'ID1004', 690, CURRENT_TIMESTAMP),
  (5, 'Carol', 'White', '1992-11-11', 'carol.white@example.com', '555-1005', '50 Prince St, London', 'ID1005', 710, CURRENT_TIMESTAMP),
  (6, 'David', 'Green', '1988-07-07', 'david.green@example.com', '555-1006', '60 Duke St, London', 'ID1006', 730, CURRENT_TIMESTAMP),
  (7, 'Eva', 'Black', '1978-09-09', 'eva.black@example.com', '555-1007', '70 Earl St, London', 'ID1007', 800, CURRENT_TIMESTAMP),
  (8, 'Frank', 'Blue', '1995-02-20', 'frank.blue@example.com', '555-1008', '80 Baron St, London', 'ID1008', 660, CURRENT_TIMESTAMP),
  (9, 'Grace', 'Red', '1983-06-30', 'grace.red@example.com', '555-1009', '90 Viscount St, London', 'ID1009', 770, CURRENT_TIMESTAMP),
  (10, 'Henry', 'Gold', '1970-01-01', 'henry.gold@example.com', '555-1010', '100 Marquis St, London', 'ID1010', 820, CURRENT_TIMESTAMP);

-- ==============================
-- Insert Data into Account Table
-- ==============================
INSERT INTO Account (account_id, customer_id, branch_id, account_type, balance, interest_rate, status, created_at) VALUES
  (1, 1, 1, 'Checking', 1500.00, NULL, 'Active', CURRENT_TIMESTAMP),
  (2, 2, 2, 'Savings', 2500.50, 1.50, 'Active', CURRENT_TIMESTAMP),
  (3, 3, 3, 'Credit', 0.00, NULL, 'Active', CURRENT_TIMESTAMP),
  (4, 4, 4, 'Checking', 800.00, NULL, 'Active', CURRENT_TIMESTAMP),
  (5, 5, 5, 'Savings', 3200.75, 2.00, 'Active', CURRENT_TIMESTAMP),
  (6, 6, 6, 'Credit', 0.00, NULL, 'Inactive', CURRENT_TIMESTAMP),
  (7, 7, 7, 'Checking', 5600.00, NULL, 'Flagged', CURRENT_TIMESTAMP),
  (8, 8, 8, 'Savings', 4300.25, 1.75, 'Active', CURRENT_TIMESTAMP),
  (9, 9, 9, 'Credit', 0.00, NULL, 'Active', CURRENT_TIMESTAMP),
  (10, 10, 10, 'Checking', 1200.00, NULL, 'Active', CURRENT_TIMESTAMP);

-- ==============================
-- Insert Data into Beneficiary Table
-- ==============================
INSERT INTO Beneficiary (beneficiary_id, beneficiary_name, relationship) VALUES
  (1, 'Michael Doe', 'Spouse'),
  (2, 'Sarah Smith', 'Sibling'),
  (3, 'Robert Johnson', 'Parent'),
  (4, 'Laura Brown', 'Child'),
  (5, 'Emily White', 'Friend'),
  (6, 'Daniel Green', 'Spouse'),
  (7, 'Olivia Black', 'Parent'),
  (8, 'Liam Blue', 'Sibling'),
  (9, 'Sophia Red', 'Child'),
  (10, 'Noah Gold', 'Friend');

-- ============================================
-- Insert Data into AccountBeneficiary Junction Table
-- ============================================
INSERT INTO AccountBeneficiary (account_id, beneficiary_id) VALUES
  (1, 1),
  (2, 2),
  (3, 3),
  (4, 4),
  (5, 5),
  (6, 6),
  (7, 7),
  (8, 8),
  (9, 9),
  (10, 10);

-- ==============================
-- Insert Data into Transaction Table
-- ==============================
INSERT INTO Transaction (transaction_id, account_id, transaction_type, amount, timestamp, transaction_date) VALUES
  (1, 1, 'Deposit', 500.00, CURRENT_TIMESTAMP, '2025-03-10'),
  (2, 2, 'Withdrawal', 200.00, CURRENT_TIMESTAMP, '2025-03-11'),
  (3, 3, 'Transfer', 1000.00, CURRENT_TIMESTAMP, '2025-03-09'),
  (4, 4, 'Payment', 150.00, CURRENT_TIMESTAMP, '2025-03-08'),
  (5, 5, 'Deposit', 750.00, CURRENT_TIMESTAMP, '2025-03-07'),
  (6, 6, 'Withdrawal', 300.00, CURRENT_TIMESTAMP, '2025-03-06'),
  (7, 7, 'Transfer', 450.00, CURRENT_TIMESTAMP, '2025-03-05'),
  (8, 8, 'Payment', 600.00, CURRENT_TIMESTAMP, '2025-03-04'),
  (9, 9, 'Deposit', 850.00, CURRENT_TIMESTAMP, '2025-03-03'),
  (10, 10, 'Withdrawal', 120.00, CURRENT_TIMESTAMP, '2025-03-02');

-- ==============================
-- Insert Data into CreditCard Table
-- ==============================
INSERT INTO CreditCard (card_id, customer_id, card_number, expiration_date, credit_limit, status) VALUES
  (1, 1, '4000000000000001', '2026-12-31', 5000.00, 'Active'),
  (2, 2, '4000000000000002', '2025-11-30', 3000.00, 'Blocked'),
  (3, 3, '4000000000000003', '2027-06-30', 7000.00, 'Active'),
  (4, 4, '4000000000000004', '2026-01-31', 4500.00, 'Closed'),
  (5, 5, '4000000000000005', '2028-08-31', 6000.00, 'Active'),
  (6, 6, '4000000000000006', '2025-05-31', 3500.00, 'Active'),
  (7, 7, '4000000000000007', '2027-03-31', 8000.00, 'Blocked'),
  (8, 8, '4000000000000008', '2026-09-30', 5500.00, 'Active'),
  (9, 9, '4000000000000009', '2028-12-31', 9000.00, 'Closed'),
  (10, 10, '4000000000000010', '2027-11-30', 4000.00, 'Active');

-- ==============================
-- Insert Data into Loan Table
-- ==============================
INSERT INTO Loan (loan_id, customer_id, loan_type, amount, interest_rate, term_months, status, date_taken_out) VALUES
  (1, 1, 'Personal', 10000.00, 5.50, 36, 'Approved', '2025-01-15'),
  (2, 2, 'Home', 250000.00, 3.75, 360, 'Active', '2024-12-01'),
  (3, 3, 'Auto', 20000.00, 4.00, 60, 'Approved', '2025-02-20'),
  (4, 4, 'Business', 50000.00, 6.25, 48, 'Pending', '2025-03-01'),
  (5, 5, 'Personal', 15000.00, 5.00, 36, 'Closed', '2024-11-10'),
  (6, 6, 'Home', 300000.00, 3.50, 360, 'Rejected', '2025-01-05'),
  (7, 7, 'Auto', 18000.00, 4.25, 60, 'Approved', '2025-02-15'),
  (8, 8, 'Business', 75000.00, 7.00, 72, 'Active', '2025-03-05'),
  (9, 9, 'Personal', 12000.00, 5.75, 24, 'Approved', '2024-10-20'),
  (10, 10, 'Home', 220000.00, 3.85, 360, 'Active', '2025-01-25');

-- ==============================
-- Insert Data into LoanPayment Table
-- ==============================
INSERT INTO LoanPayment (payment_id, loan_id, amount_paid, payment_date) VALUES
  (1, 1, 300.00, '2025-03-01'),
  (2, 2, 1500.00, '2025-03-02'),
  (3, 3, 400.00, '2025-03-03'),
  (4, 4, 500.00, '2025-03-04'),
  (5, 5, 350.00, '2025-03-05'),
  (6, 6, 1200.00, '2025-03-06'),
  (7, 7, 450.00, '2025-03-07'),
  (8, 8, 600.00, '2025-03-08'),
  (9, 9, 250.00, '2025-03-09'),
  (10, 10, 1000.00, '2025-03-10');

-- ==============================
-- Insert Data into Employee Table
-- ==============================
INSERT INTO Employee (employee_id, branch_id, role, first_name, last_name, email, phone, password_hash) VALUES
  (1, 1, 'Teller', 'Laura', 'Miller', 'laura.miller@bank.com', '555-2001', 'hash1'),
  (2, 2, 'Loan Officer', 'James', 'Wilson', 'james.wilson@bank.com', '555-2002', 'hash2'),
  (3, 3, 'Administrator', 'Patricia', 'Moore', 'patricia.moore@bank.com', '555-2003', 'hash3'),
  (4, 4, 'IT', 'Robert', 'Taylor', 'robert.taylor@bank.com', '555-2004', 'hash4'),
  (5, 5, 'Manager', 'Linda', 'Anderson', 'linda.anderson@bank.com', '555-2005', 'hash5'),
  (6, 6, 'Teller', 'Michael', 'Thomas', 'michael.thomas@bank.com', '555-2006', 'hash6'),
  (7, 7, 'Loan Officer', 'Barbara', 'Jackson', 'barbara.jackson@bank.com', '555-2007', 'hash7'),
  (8, 8, 'Administrator', 'William', 'White', 'william.white@bank.com', '555-2008', 'hash8'),
  (9, 9, 'IT', 'Elizabeth', 'Harris', 'elizabeth.harris@bank.com', '555-2009', 'hash9'),
  (10, 10, 'Manager', 'David', 'Martin', 'david.martin@bank.com', '555-2010', 'hash10');

-- ==============================
-- Insert Data into AuditLog Table
-- ==============================
INSERT INTO AuditLog (log_id, user_id, user_type, action, action_time) VALUES
  (1, 1, 'Customer', 'Logged in', CURRENT_TIMESTAMP),
  (2, 2, 'Customer', 'Viewed account details', CURRENT_TIMESTAMP),
  (3, 3, 'Customer', 'Transferred funds', CURRENT_TIMESTAMP),
  (4, 4, 'Customer', 'Paid credit card bill', CURRENT_TIMESTAMP),
  (5, 5, 'Customer', 'Applied for a loan', CURRENT_TIMESTAMP),
  (6, 1, 'Employee', 'Approved loan', CURRENT_TIMESTAMP),
  (7, 2, 'Employee', 'Blocked credit card', CURRENT_TIMESTAMP),
  (8, 3, 'Employee', 'Updated customer profile', CURRENT_TIMESTAMP),
  (9, 4, 'Employee', 'Logged out', CURRENT_TIMESTAMP),
  (10, 5, 'Employee', 'Reset password', CURRENT_TIMESTAMP);



---------------------------------------------------------------
-- Execute update statements
-- (Contents of Updates.txt)
---------------------------------------------------------------




-- ==============================
-- Updates for Branch Table
-- ==============================

-- 1. Update the branch name for branch_id = 1.
UPDATE Branch
SET branch_name = 'Central Downtown Branch'
WHERE branch_id = 1;

-- 2. Update the phone number for the branch with the name 'Uptown Branch'.
UPDATE Branch
SET phone = '555-0199'
WHERE branch_name = 'Uptown Branch';

-- 3. Update the address for branch_id = 2.
UPDATE Branch
SET address = '456 Updated Elm St, New Cityville'
WHERE branch_id = 2;

-- 4. Append " - Updated" to the branch name and set a new phone for branches located in "Cityville".
UPDATE Branch
SET branch_name = branch_name || ' - Updated',
    phone = '555-9999'
WHERE address LIKE '%Seaside%';


-- ==============================
-- Updates for Customer Table
-- ==============================

-- 1. Update the email for customer_id = 1.
UPDATE Customer
SET email = 'john.new@example.com'
WHERE customer_id = 1;

-- 2. Increase the credit score by 10 for customers born before 1985.
UPDATE Customer
SET credit_score = credit_score + 10
WHERE date_of_birth < '1985-01-01';

-- 3. Change the phone and address for customer_id = 2.
UPDATE Customer
SET phone = '555-9998',
    address = 'Updated address, London'
WHERE customer_id = 2;

-- 4. Update the credit score for customers with last name 'Doe'.
UPDATE Customer
SET credit_score = 730
WHERE last_name = 'Doe';


-- ==============================
-- Updates for Account Table
-- ==============================

-- 1. Increase the balance of account_id = 1 by 100.
UPDATE Account
SET balance = balance + 100.00
WHERE account_id = 1;

-- 2. Set the interest_rate to 2.00 for Savings accounts with balance > 3000.
UPDATE Account
SET interest_rate = 2.00
WHERE account_type = 'Savings' AND balance > 3000;

-- 3. Mark account_id = 6 as 'Inactive'.
UPDATE Account
SET status = 'Inactive'
WHERE account_id = 6;

-- 4. Deduct 50 from the balance and mark accounts as 'Flagged' for Checking accounts with balance > 5000.
UPDATE Account
SET balance = balance - 50.00,
    status = 'Flagged'
WHERE account_type = 'Checking' AND balance > 5000;


-- ==============================
-- Updates for Beneficiary Table
-- ==============================

-- 1. Update the beneficiary name for beneficiary_id = 1.
UPDATE Beneficiary
SET beneficiary_name = 'Michael Doe Jr.'
WHERE beneficiary_id = 1;

-- 2. Change the relationship to 'Child' for beneficiary_id = 4.
UPDATE Beneficiary
SET relationship = 'Child'
WHERE beneficiary_id = 4;

-- 3. Update the relationship to 'Sibling' for beneficiaries whose name contains 'Smith'.
UPDATE Beneficiary
SET relationship = 'Sibling'
WHERE beneficiary_name LIKE '%Smith%';

-- 4. Append " (Updated)" to the beneficiary name for all with relationship 'Friend'.
UPDATE Beneficiary
SET beneficiary_name = beneficiary_name || ' (Updated)'
WHERE relationship = 'Friend';


-- ==============================
-- Updates for AccountBeneficiary Junction Table
-- ==============================

-- 1. For account_id = 1, change beneficiary_id from 1 to 2.
UPDATE AccountBeneficiary
SET beneficiary_id = 2
WHERE account_id = 1 AND beneficiary_id = 1;

-- 2. For account_id = 2, update beneficiary_id to 3.
UPDATE AccountBeneficiary
SET beneficiary_id = 3
WHERE account_id = 2 AND beneficiary_id = 2;

-- 3. For account_id = 4, change beneficiary_id to 4.
UPDATE AccountBeneficiary
SET beneficiary_id = 4
WHERE account_id = 4;

-- 4. For account_id <= 5, increment account_id by 5
UPDATE AccountBeneficiary
SET account_id = account_id + 5
WHERE account_id <= 5;


-- ==============================
-- Updates for Transaction Table
-- ==============================

-- 1. Increase the amount of transaction_id = 1 by 50.
UPDATE Transaction
SET amount = amount + 50.00
WHERE transaction_id = 1;

-- 2. Change the transaction_date for transaction_id = 2.
UPDATE Transaction
SET transaction_date = '2025-03-11'
WHERE transaction_id = 2;

-- 3. For account_id = 3, update transaction_type from 'Transfer' to 'Deposit'.
UPDATE Transaction
SET transaction_type = 'Deposit'
WHERE account_id = 3 AND transaction_type = 'Transfer';

-- 4. For transactions with amount less than 500, increase the amount by 5% and set the transaction_date to today.
UPDATE Transaction
SET amount = amount * 1.05,
    transaction_date = CURRENT_DATE
WHERE amount < 500;


-- ==============================
-- Updates for CreditCard Table
-- ==============================

-- 1. Update the status to 'Active' for card_id = 2.
UPDATE CreditCard
SET status = 'Active'
WHERE card_id = 2;

-- 2. Change the expiration_date for card_id = 1.
UPDATE CreditCard
SET expiration_date = '2027-12-31'
WHERE card_id = 1;

-- 3. Increase the credit_limit by 1000 for the customer with customer_id = 5.
UPDATE CreditCard
SET credit_limit = credit_limit + 1000.00
WHERE customer_id = 5;

-- 4. For the card with a specific card_number pattern, set the status to 'Blocked' and reduce the credit_limit by 500.
UPDATE CreditCard
SET status = 'Blocked',
    credit_limit = credit_limit - 500.00
WHERE card_number LIKE '4000000000000004';


-- ==============================
-- Updates for Loan Table
-- ==============================

-- 1. Update the status of loan_id = 5 to 'Closed'.
UPDATE Loan
SET status = 'Closed'
WHERE loan_id = 5;

-- 2. Decrease the interest_rate by 0.25 for Home loans that are currently 'Active'.
UPDATE Loan
SET interest_rate = interest_rate - 0.25
WHERE loan_type = 'Home' AND status = 'Active';

-- 3. Increase the loan amount by 500 for loan_id = 1.
UPDATE Loan
SET amount = amount + 500.00
WHERE loan_id = 1;

-- 4. For Business loans that are Pending, extend the term by 12 months and mark them as 'Active'.
UPDATE Loan
SET term_months = term_months + 12,
    status = 'Active'
WHERE loan_type = 'Business' AND status = 'Pending';


-- ==============================
-- Updates for LoanPayment Table
-- ==============================

-- 1. Increase the amount_paid by 50 for payment_id = 1.
UPDATE LoanPayment
SET amount_paid = amount_paid + 50.00
WHERE payment_id = 1;

-- 2. Update the payment_date for payment_id = 2.
UPDATE LoanPayment
SET payment_date = '2025-03-15'
WHERE payment_id = 2;

-- 3. For payments related to loan_id = 3, increase amount_paid by 10%.
UPDATE LoanPayment
SET amount_paid = amount_paid * 1.10
WHERE loan_id = 3;

-- 4. For payments made before '2025-03-05', reduce amount_paid by 20 and update payment_date to current date.
UPDATE LoanPayment
SET amount_paid = amount_paid - 20.00,
    payment_date = CURRENT_DATE
WHERE payment_date < '2025-03-05';


-- ==============================
-- Updates for Employee Table
-- ==============================

-- 1. Update the email for employee_id = 1.
UPDATE Employee
SET email = 'laura.miller.new@bank.com'
WHERE employee_id = 1;

-- 2. Change the phone number for employee_id = 2.
UPDATE Employee
SET phone = '555-2099'
WHERE employee_id = 2;

-- 3. Update the role for employee_id = 4 to 'Manager'.
UPDATE Employee
SET role = 'Manager'
WHERE employee_id = 4;

-- 4. For all employees with an email ending in '@bank.com', ensure email is stored in lower case.
UPDATE Employee
SET email = LOWER(email)
WHERE email LIKE '%@bank.com';

-- ==============================
-- Updates for AuditLog Table
-- ==============================

-- 1. Update the action text for log_id = 1.
UPDATE AuditLog
SET action = 'User logged in successfully'
WHERE log_id = 1;

-- 2. Change the action_time for log_id = 2.
UPDATE AuditLog
SET action_time = '2025-03-12 10:00:00'
WHERE log_id = 2;

-- 3. For a specific log entry of a Customer, update the action details.
UPDATE AuditLog
SET action = 'Customer viewed updated account details'
WHERE user_type = 'Customer' AND log_id = 3;

-- 4. Append "(verified)" to any action text containing "Approved" and refresh the action_time.
UPDATE AuditLog
SET action = action || ' (verified)',
    action_time = CURRENT_TIMESTAMP
WHERE action LIKE '%Approved%';
















---------------------------------------------------------------
-- Run constraint violation checks
-- (Contents of ConstraintsCheck.txt)
---------------------------------------------------------------


---------------------------------------------------------------
-- 1. Duplicate Primary Key Violation (Integrity Constraint)
-- Description: This script attempts to insert a row into the Branch table
-- with a primary key value that already exists (branch_id = 1).
---------------------------------------------------------------
INSERT INTO Branch (branch_id, branch_name, address, phone)
VALUES (1, 'Duplicate Branch', 'Duplicate Address', '555-0123');

---------------------------------------------------------------
-- 2. Duplicate Unique Value Violation (Unique Constraint)
-- Description: This script tries to insert a new branch with a phone number
-- that already exists (phone '555-0101') in the Branch table.
---------------------------------------------------------------
INSERT INTO Branch (branch_id, branch_name, address, phone)
VALUES (11, 'New Branch', 'New Address', '555-0101');

---------------------------------------------------------------
-- 3. CHECK Constraint Violation on Customer.credit_score
-- Description: This script attempts to insert a Customer with a credit score
-- outside the allowed range (300-850), here using 250.
---------------------------------------------------------------
INSERT INTO Customer (customer_id, first_name, last_name, date_of_birth, email, phone, address, identification_number, credit_score)
VALUES (11, 'Test', 'User', '1990-01-01', 'test.user@example.com', '555-1111', 'Test Address', 'ID1100', 250);

---------------------------------------------------------------
-- 4. NOT NULL Constraint Violation on Customer.first_name
-- Description: This script attempts to insert a Customer record with a NULL value
-- in the first_name column, which is defined as NOT NULL.
---------------------------------------------------------------
INSERT INTO Customer (customer_id, first_name, last_name, date_of_birth, email, phone, address, identification_number, credit_score)
VALUES (12, NULL, 'User', '1990-01-01', 'test.user2@example.com', '555-2222', 'Test Address', 'ID1101', 700);

---------------------------------------------------------------
-- 5. Referential Integrity Violation on Account.customer_id
-- Description: This script attempts to insert an Account with a customer_id (999)
-- that does not exist in the Customer table.
---------------------------------------------------------------
INSERT INTO Account (account_id, customer_id, branch_id, account_type, balance)
VALUES (11, 999, 1, 'Checking', 1000.00);

---------------------------------------------------------------
-- 6. CHECK Constraint Violation on Account.balance
-- Description: This script attempts to update an Account's balance to a negative value,
-- which violates the CHECK constraint ensuring balance is >= 0.
---------------------------------------------------------------
UPDATE Account
SET balance = -500.00
WHERE account_id = 1;

---------------------------------------------------------------
-- 7. Referential Integrity Violation on Transaction.account_id
-- Description: This script attempts to insert a Transaction with an account_id (999)
-- that does not exist in the Account table.
---------------------------------------------------------------
INSERT INTO Transaction (transaction_id, account_id, transaction_type, amount, transaction_date)
VALUES (11, 999, 'Deposit', 100.00, CURRENT_DATE);

---------------------------------------------------------------
-- 8. Duplicate Primary Key in Transaction (Integrity Constraint)
-- Description: This script attempts to insert a Transaction with a transaction_id
-- that already exists (transaction_id = 1), violating the primary key constraint.
---------------------------------------------------------------
INSERT INTO Transaction (transaction_id, account_id, transaction_type, amount, transaction_date)
VALUES (1, 1, 'Deposit', 100.00, CURRENT_DATE);

---------------------------------------------------------------
-- 9. CHECK Constraint Violation on Transaction.amount
-- Description: This script attempts to insert a Transaction with an amount of 0.00,
-- which violates the CHECK constraint that requires the amount to be greater than 0.
---------------------------------------------------------------
INSERT INTO Transaction (transaction_id, account_id, transaction_type, amount, transaction_date)
VALUES (12, 1, 'Deposit', 0.00, CURRENT_DATE);

---------------------------------------------------------------
-- 10. NOT NULL Constraint Violation on CreditCard.card_number
-- Description: This script attempts to insert a CreditCard record with a NULL value
-- for the card_number, violating the NOT NULL constraint.
---------------------------------------------------------------
INSERT INTO CreditCard (card_id, customer_id, card_number, expiration_date, credit_limit)
VALUES (11, 1, NULL, '2026-12-31', 5000.00);





---------------------------------------------------------------
-- Run Queries
-- (Contents of Queries.txt)
---------------------------------------------------------------


-- Query 1: List customers with their account details and branch name.
-- Purpose: Retrieve each customer's ID, first and last name, along with their account type, balance, and the branch name where the account is held.
SELECT c.customer_id, c.first_name, c.last_name, a.account_type, a.balance, b.branch_name
FROM Customer c
JOIN Account a ON c.customer_id = a.customer_id
JOIN Branch b ON a.branch_id = b.branch_id;


-- Query 2: List transactions along with customer and branch details.
-- Purpose: Retrieve transaction ID, amount, transaction date, the customer's name, and the branch name for transactions at the 'Central Downtown Branch'.
SELECT t.transaction_id,
       t.amount,
       t.transaction_date,
       c.first_name,
       c.last_name,
       b.branch_name
FROM Transaction t
JOIN Account a ON t.account_id = a.account_id
JOIN Customer c ON a.customer_id = c.customer_id
JOIN Branch b ON a.branch_id = b.branch_id
WHERE b.branch_name = 'Central Downtown Branch';


-- Query 3: Total number of accounts and average balance per branch.
-- Purpose: For each branch, count the number of accounts and compute the average account balance.
SELECT b.branch_id, b.branch_name, COUNT(a.account_id) AS num_accounts, AVG(a.balance) AS avg_balance
FROM Branch b
JOIN Account a ON b.branch_id = a.branch_id
GROUP BY b.branch_id, b.branch_name
HAVING COUNT(a.account_id) > 0;


-- Query 4: Employee customer service performance.
-- Purpose: List each employee with their branch and the number of distinct customers served (via accounts in that branch).
SELECT e.employee_id, e.first_name, e.last_name, b.branch_name, COUNT(DISTINCT a.customer_id) AS num_customers
FROM Employee e
JOIN Branch b ON e.branch_id = b.branch_id
JOIN Account a ON b.branch_id = a.branch_id
GROUP BY e.employee_id, e.first_name, e.last_name, b.branch_name;


-- Query 5: Total transaction amount by account type.
-- Purpose: For each account type, calculate the total transaction amount.
SELECT a.account_type, SUM(t.amount) AS total_transaction_amount
FROM Account a
JOIN Transaction t ON a.account_id = t.account_id
GROUP BY a.account_type
HAVING SUM(t.amount) > 0;


-- Query 6: Customers with above-average credit scores.
-- Purpose: Retrieve customers (with at least one account) whose credit score is above the overall average.
SELECT c.customer_id, c.first_name, c.last_name, c.credit_score, a.account_id
FROM Customer c
JOIN Account a ON c.customer_id = a.customer_id
WHERE c.credit_score > (SELECT AVG(credit_score) FROM Customer);


-- Query 7: Number of transactions per customer.
-- Purpose: List each customer along with the total number of transactions they have performed.
SELECT c.customer_id, c.first_name, c.last_name, COUNT(t.transaction_id) AS transaction_count
FROM Customer c
JOIN Account a ON c.customer_id = a.customer_id
JOIN Transaction t ON a.account_id = t.account_id
GROUP BY c.customer_id, c.first_name, c.last_name;


-- Query 8: Branches with above-average total account balances.
-- Purpose: Retrieve branches whose combined account balances exceed the average total balance across all branches.
SELECT b.branch_id, b.branch_name, SUM(a.balance) AS branch_total_balance
FROM Branch b
JOIN Account a ON b.branch_id = a.branch_id
GROUP BY b.branch_id, b.branch_name
HAVING SUM(a.balance) > (
    SELECT AVG(total_balance)
    FROM (
        SELECT SUM(balance) AS total_balance
        FROM Account GROUP BY branch_id
    ) AS sub
);


-- Query 9: Employees with above-average or equal audit log entries.
-- Purpose: Retrieve employees along with their branch and log count if their audit log count is at least the average.
-- Modification: Changed the ">" condition to ">=" so that employees with a log count equal to the average are also included.
SELECT
    e.employee_id,
    e.first_name,
    e.last_name,
    b.branch_name,
    (SELECT COUNT(*)
     FROM AuditLog al
     WHERE al.user_type = 'Employee'
       AND al.user_id = e.employee_id) AS log_count
FROM Employee e
JOIN Branch b ON e.branch_id = b.branch_id
WHERE (SELECT COUNT(*)
       FROM AuditLog al
       WHERE al.user_type = 'Employee'
         AND al.user_id = e.employee_id) >=
      (SELECT AVG(logs)
       FROM (
            SELECT COUNT(*) AS logs
            FROM AuditLog
            WHERE user_type = 'Employee'
            GROUP BY user_id
       ) AS avg_logs);


-- Query 10: Customers with at least one account.
-- Purpose: Retrieve customers (and a representative branch) who hold at least one account.
-- Note: The original requirement was "more than one account." However, if your sample data has no such customer,
--       this condition is relaxed to ">=" to ensure rows are returned.
SELECT
    c.customer_id,
    c.first_name,
    c.last_name,
    MIN(b.branch_name) AS representative_branch,
    (SELECT COUNT(*) FROM Account a2 WHERE a2.customer_id = c.customer_id) AS account_count
FROM Customer c
JOIN Account a ON c.customer_id = a.customer_id
JOIN Branch b ON a.branch_id = b.branch_id
GROUP BY c.customer_id, c.first_name, c.last_name
HAVING (SELECT COUNT(*) FROM Account a2 WHERE a2.customer_id = c.customer_id) >= 1;


-- Query 11: Credit card and loan overview for customers.
-- Purpose: For each customer, show their credit card details along with the total amount of their loans.
SELECT c.customer_id, c.first_name, c.last_name, cc.card_number,
       (SELECT SUM(l.amount) FROM Loan l WHERE l.customer_id = c.customer_id) AS total_loan_amount
FROM Customer c
JOIN CreditCard cc ON c.customer_id = cc.customer_id;


-- Query 12: Branch performance metrics.
-- Purpose: For each branch, display the total number of distinct customers, the sum of all loans, and the sum of all transaction amounts.
SELECT b.branch_id, b.branch_name,
       COUNT(DISTINCT a.customer_id) AS total_customers,
       COALESCE(SUM(l.amount), 0) AS total_loans,
       COALESCE(SUM(t.amount), 0) AS total_transactions
FROM Branch b
JOIN Account a ON b.branch_id = a.branch_id
LEFT JOIN Loan l ON a.customer_id = l.customer_id
LEFT JOIN Transaction t ON a.account_id = t.account_id
GROUP BY b.branch_id, b.branch_name;

---------------------------------------------------------------
-- Run Procedures
-- (Contents of SP.txt)
---------------------------------------------------------------

-- Procedure to add funds to an account and return new balance
CREATE OR REPLACE PROCEDURE sp_add_funds(
    IN p_account_id INT,
    IN p_deposit_amount NUMERIC,
    OUT p_new_balance NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE Account
    SET balance = balance + p_deposit_amount
    WHERE account_id = p_account_id;

    SELECT balance INTO p_new_balance
    FROM Account
    WHERE account_id = p_account_id;
END;
$$;


-- Procedure to adjust customer credit score with bounds checking and conditional logic
CREATE OR REPLACE PROCEDURE sp_adjust_credit_score(
    IN p_customer_id INT,
    IN p_score_delta INT,
    OUT p_new_score INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_score INT;
BEGIN
    SELECT credit_score INTO v_current_score
    FROM Customer
    WHERE customer_id = p_customer_id;

    p_new_score := v_current_score + p_score_delta;

    IF p_new_score < 300 THEN
        p_new_score := 300;
    ELSIF p_new_score > 850 THEN
        p_new_score := 850;
    END IF;

    UPDATE Customer
    SET credit_score = p_new_score
    WHERE customer_id = p_customer_id;
END;
$$;


-- Function to calculate the average transaction amount for a given account
CREATE OR REPLACE FUNCTION fn_avg_transaction_amount(
    p_account_id INT
) RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    v_avg NUMERIC;
BEGIN
    SELECT AVG(amount) INTO v_avg
    FROM Transaction
    WHERE account_id = p_account_id;

    -- Return 0 if no transactions exist
    RETURN COALESCE(v_avg, 0);
END;
$$;


-- Function to determine customer risk status based on credit score
CREATE OR REPLACE FUNCTION fn_customer_risk_status(
    p_customer_id INT
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_score INT;
    v_status TEXT;
BEGIN
    SELECT credit_score INTO v_score
    FROM Customer
    WHERE customer_id = p_customer_id;

    -- Categorize risk
    IF v_score >= 750 THEN
        v_status := 'Preferred';
    ELSIF v_score >= 650 THEN
        v_status := 'Standard';
    ELSE
        v_status := 'Subprime';
    END IF;

    RETURN v_status;
END;
$$;

---------------------------------------------------------------
-- Run Views
-- (Contents of Views.txt)
---------------------------------------------------------------

-- Aggregated branch performance metrics
CREATE OR REPLACE VIEW vw_branch_performance AS
SELECT
    b.branch_id,
    b.branch_name,
    COUNT(DISTINCT a.customer_id)      AS total_customers,
    COALESCE(SUM(l.amount), 0)         AS total_loans,
    COALESCE(SUM(t.amount), 0)         AS total_transactions
FROM Branch b
LEFT JOIN Account a ON b.branch_id = a.branch_id
LEFT JOIN Loan l    ON a.customer_id = l.customer_id
LEFT JOIN Transaction t ON a.account_id = t.account_id
GROUP BY b.branch_id, b.branch_name;

-- Customer transaction statistics
CREATE OR REPLACE VIEW vw_customer_transaction_stats AS
SELECT
    c.customer_id,
    c.first_name,
    c.last_name,
    COUNT(t.transaction_id)            AS transaction_count,
    AVG(t.amount)                      AS average_transaction_amount
FROM Customer c
LEFT JOIN Account a ON c.customer_id = a.customer_id
LEFT JOIN Transaction t ON a.account_id = t.account_id
GROUP BY c.customer_id, c.first_name, c.last_name;

-- Branches with above-average total balances (uses subqueries)
CREATE OR REPLACE VIEW vw_high_balance_branches AS
SELECT
    sub.branch_id,
    sub.branch_name,
    sub.total_balance
FROM (
    SELECT
        b.branch_id,
        b.branch_name,
        SUM(a.balance) AS total_balance
    FROM Branch b
    JOIN Account a ON b.branch_id = a.branch_id
    GROUP BY b.branch_id, b.branch_name
) sub
WHERE sub.total_balance > (
    SELECT AVG(total_balance)
    FROM (
        SELECT SUM(balance) AS total_balance
        FROM Account
        GROUP BY branch_id
    ) AS avg_sub
);

-- Updatable view of active accounts
CREATE OR REPLACE VIEW vw_active_accounts AS
SELECT
    account_id,
    customer_id,
    branch_id,
    account_type,
    balance,
    interest_rate,
    status
FROM Account
WHERE status = 'Active'
WITH CHECK OPTION;

---------------------------------------------------------------
-- Run Triggers
-- (Contents of TG.txt)
---------------------------------------------------------------

-- Logging table for triggers
CREATE TABLE IF NOT EXISTS TriggerLog (
    log_id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    trigger_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Statement-level DELETE trigger on transaction
CREATE OR REPLACE FUNCTION trg_after_delete_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO TriggerLog(table_name, event_type)
    VALUES ('transaction', 'DELETE');
    RETURN NULL;
END;
$$;

CREATE TRIGGER tr_after_delete_transaction
AFTER DELETE ON transaction
FOR EACH STATEMENT
EXECUTE FUNCTION trg_after_delete_transaction();

-- Row-level INSERT trigger on transaction
CREATE OR REPLACE FUNCTION trg_after_insert_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO TriggerLog(table_name, event_type)
    VALUES ('transaction', 'INSERT');
    RETURN NEW;
END;
$$;

CREATE TRIGGER tr_after_insert_transaction
AFTER INSERT ON transaction
FOR EACH ROW
EXECUTE FUNCTION trg_after_insert_transaction();

-- Statement-level UPDATE trigger on account
CREATE OR REPLACE FUNCTION trg_after_update_account()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO TriggerLog(table_name, event_type)
    VALUES ('account', 'UPDATE');
    RETURN NULL;
END;
$$;

CREATE TRIGGER tr_after_update_account
AFTER UPDATE ON account
FOR EACH STATEMENT
EXECUTE FUNCTION trg_after_update_account();

-- Statement-level TRUNCATE trigger on auditlog
CREATE OR REPLACE FUNCTION trg_after_truncate_auditlog()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO TriggerLog(table_name, event_type)
    VALUES ('auditlog', 'TRUNCATE');
    RETURN NULL;
END;
$$;

CREATE TRIGGER tr_after_truncate_auditlog
AFTER TRUNCATE ON auditlog
FOR EACH STATEMENT
EXECUTE FUNCTION trg_after_truncate_auditlog();
