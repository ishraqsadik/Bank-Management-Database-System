
\echo '=== VIEWS: Branch Performance (5 rows) ==='
SELECT * FROM vw_branch_performance LIMIT 5;

\echo '=== VIEWS: Customer Transaction Stats (5 rows) ==='
SELECT * FROM vw_customer_transaction_stats LIMIT 5;

\echo '=== VIEWS: High‑Balance Branches (5 rows) ==='
SELECT * FROM vw_high_balance_branches LIMIT 5;

\echo '=== VIEWS: Active Accounts (5 rows) ==='
SELECT * FROM vw_active_accounts LIMIT 5;


\echo '=== SP: sp_add_funds(account_id=1, deposit=100) ==='
DO $$
DECLARE new_bal NUMERIC;
BEGIN
  CALL sp_add_funds(1, 100, new_bal);
  RAISE NOTICE 'new_balance = %', new_bal;
END;
$$;


\echo '=== SP: sp_adjust_credit_score(customer_id=1, delta=50) ==='
DO $$
DECLARE new_score INT;
BEGIN
  CALL sp_adjust_credit_score(1, 50, new_score);
  RAISE NOTICE 'new_score = %', new_score;
END;
$$;


\echo '=== FN: fn_avg_transaction_amount(account_id=1) ==='
SELECT fn_avg_transaction_amount(1) AS avg_amount;

\echo '=== FN: fn_customer_risk_status(customer_id=1) ==='
SELECT fn_customer_risk_status(1) AS risk_status;


\echo '=== TRIGGERS: clear TriggerLog ==='
TRUNCATE TriggerLog;

\echo '=== TRIGGERS: DELETE FROM transaction id=10 ==='
DELETE FROM Transaction WHERE transaction_id = 10;

\echo '=== TRIGGERS: INSERT INTO transaction id=999 ==='
INSERT INTO Transaction (transaction_id, account_id, transaction_type, amount, transaction_date)
  VALUES (999, 1, 'Deposit', 123.45, CURRENT_DATE);

\echo '=== TRIGGERS: UPDATE Account id=1 ==='
UPDATE Account SET balance = balance + 1 WHERE account_id = 1;

\echo '=== TRIGGERS: TRUNCATE AuditLog ==='
TRUNCATE AuditLog;

\echo '=== TRIGGERS: show TriggerLog ==='
SELECT * FROM TriggerLog ORDER BY log_id;
