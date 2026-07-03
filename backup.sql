-- =========================================================================
-- HELICON LTD - KNITWEAR MANUFACTURING MANAGEMENT SYSTEM
-- MASTER DATABASE DATABASE ENGINE BACKUP SNAPSHOT DUMP BLUEPRINT
-- FILE TARGET: backup.sql
-- =========================================================================

-- -------------------------------------------------------------
-- 1. SYSTEM USER ACCESS CONTROL LOG REGISTRY
-- -------------------------------------------------------------
DROP TABLE IF EXISTS system_users CASCADE;

CREATE TABLE system_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(50) NOT NULL
);

-- Pre-seed baseline authorization cache logins
INSERT INTO system_users (username, password_hash, department) VALUES
('merch1', 'pass123', 'merchant'),
('store1', 'pass123', 'store'),
('design1', 'pass123', 'designer'),
('prog1', 'pass123', 'programmer'),
('knit1', 'pass123', 'knitting'),
('makeup1', 'pass123', 'makeup'),
('finish1', 'pass123', 'finishing'),
('ie1', 'pass123', 'ie')
ON CONFLICT (username) DO NOTHING;


-- -------------------------------------------------------------
-- 2. MASTER MANUFACTURING PROGRESS TRACKING INDEX GRID
-- -------------------------------------------------------------
DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
    slno SERIAL PRIMARY KEY,
    
    -- MERCHANDISER INTAKE FIELDS
    buyer VARCHAR(255) NOT NULL,
    style VARCHAR(100) UNIQUE NOT NULL,
    issued_log_date DATE,
    required_date_agreed_by_sample_manager DATE,
    pcs_required INT DEFAULT 0,
    committed_date_for_yarn DATE,
    committed_date_for_accessories DATE,
    
    -- MATERIAL STORE INVENTORY FIELDS
    yarn_name VARCHAR(255),
    yarn_in_house_yes_no VARCHAR(10) DEFAULT 'No',
    yarn_approximate_date DATE,
    accessories_in_housed_yes_no VARCHAR(10) DEFAULT 'No',
    accessories_approximate_date DATE,
    store_date_confirmed_by_merchant VARCHAR(10) DEFAULT 'No',
    
    -- TECHNICAL DESIGNER SPECS BLOCKS
    sample_type_stage VARCHAR(100),
    yarn_composition VARCHAR(255),
    yarn_count VARCHAR(50),
    yarn_ply VARCHAR(50),
    designer_needle_point VARCHAR(100),
    designer_courses_point VARCHAR(100),
    designer_tension_spec VARCHAR(100),
    designer_weight VARCHAR(50),
    designer_weight_validated_by VARCHAR(150),
    designer_tension_validated_by VARCHAR(150),
    
    -- M1 CAD PROGRAMMER FIELD BLOCKS
    machine_type VARCHAR(100),
    gauge VARCHAR(50),
    machine_system VARCHAR(50),
    knitting_way VARCHAR(100),
    machine_speed VARCHAR(50),
    knitting_minutes INT DEFAULT 0,
    panels_qty INT DEFAULT 0,
    structure_stitch_spec TEXT,
    programmer_speed_validated_by VARCHAR(150),
    programmer_minutes_validated_by VARCHAR(150),
    
    -- LIVE KNITTING MACHINE FLOOR EXECUTION
    total_knitted_pcs INT DEFAULT 0,
    knit_mc_planned INT DEFAULT 0,
    knit_mc_running INT DEFAULT 0,
    target_pcs INT DEFAULT 0,
    achieved_pcs INT DEFAULT 0,
    target_sah NUMERIC(10,2) DEFAULT 0.00,
    achieved_sah NUMERIC(10,2) DEFAULT 0.00,
    target_smv NUMERIC(10,2) DEFAULT 0.00,
    planned_smv NUMERIC(10,2) DEFAULT 0.00,
    actual_smv NUMERIC(10,2) DEFAULT 0.00,
    floor_smv_validated_by_programmer_head VARCHAR(150),
    floor_smv_validated_by_knitting_head VARCHAR(150),
    
    -- MAKEUP & LINKING PRODUCTION LINES
    makeup_lines_planned INT DEFAULT 0,
    makeup_lines_running INT DEFAULT 0,
    makeup_line_wise_target_pcs TEXT,
    makeup_line_wise_achieved_pcs TEXT,
    
    -- FINISHING QUALITY ASSURANCE LINES
    finishing_lines_planned INT DEFAULT 0,
    finishing_lines_running INT DEFAULT 0,
    finishing_line_wise_target_pcs TEXT,
    finishing_line_wise_achieved_pcs TEXT,
    
    -- INDUSTRIAL ENGINEERING (IE) PROCESS ANALYSIS
    ie_knitting_process_wise_costed_smv NUMERIC(10,2) DEFAULT 0.00,
    ie_makeup_process_wise_costed_smv NUMERIC(10,2) DEFAULT 0.00,
    ie_finishing_process_wise_costed_smv NUMERIC(10,2) DEFAULT 0.00,
    ie_smv_comparison_status VARCHAR(100) DEFAULT 'Pending Review',
    
    status VARCHAR(100) DEFAULT 'Yarn-Pending'
);


-- -------------------------------------------------------------
-- 3. PIPELINE TEST PARAMETER DUMP ENTRIES
-- -------------------------------------------------------------
INSERT INTO orders (
    buyer, style, issued_log_date, required_date_agreed_by_sample_manager, pcs_required, 
    status, yarn_name, yarn_in_house_yes_no, gauge, machine_type, achieved_pcs
) VALUES 
('Next Sourcing', 'G22117', CURRENT_DATE, CURRENT_DATE + INTERVAL '21 days', 3500, 'Live Floor Knitting', '100% Cotton 2/32', 'Yes', '12GG', 'Stoll CMS 530', 450),
('Zara International', 'ZR-99-K', CURRENT_DATE - 1, CURRENT_DATE + INTERVAL '14 days', 5000, 'Yarn-Pending', '80/20 Acrylic Blend', 'No', '7GG', 'Shima Seiki', 0)
ON CONFLICT (style) DO NOTHING;

-- =========================================================================
-- DUMP COMPLETE - FILE STABLE FOR RESTORE CODES EXECUTION
-- =========================================================================
