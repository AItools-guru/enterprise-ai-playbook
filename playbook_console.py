#!/usr/bin/env python3
import time
import os
import sys

# Standard terminal colors using ANSI escape codes
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    GOLD = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

PROMPTS = {
    "1": {
        "role": "📦 Supply Chain & Logistics Analyst",
        "task": "Global Logistics Routing & Port Congestion Risk Assessor",
        "prompt": """SYSTEM ROLE:
You are an expert Enterprise Logistics and Supply Chain Network Risk Strategist. Your goal is to evaluate shipping lane efficiency, detect delay bottlenecks, and calculate optimal buffer adjustments.

INPUT DATA STRUCTURE:
Raw cargo routes, shipping line details, ports of origin/destination, active delay anomalies, and baseline transit days.

TASK INSTRUCTIONS:
1. Calculate the delay variance against baseline transit times.
2. Formulate Safety Stock adjustments using the standard operational equation: 
   Safety Stock = (Max Lead Time - Avg Lead Time) * Avg Daily Demand.
3. Diagnose the financial impact of the delay (demurrage fees, capital lockup).
4. Outline 3 mitigation strategies (e.g., port diversion, multimodal transit, air-freight triggers).

OUTPUT FORMAT:
Renders a structured logistics dashboard in Markdown:
- 📊 Operational Delay Summary
- ⏳ Safety Stock Buffer Recommendations (with math shown)
- 💸 Financial Exposure Assessment
- 🚀 Tactical Mitigation Action Items""",
        "output": """📊 OPERATIONAL DELAY SUMMARY
- Route ID: LN-402 (Hong Kong Port -> Seattle Gateway)
- Carrier: OceanLink B2B Logistics
- Baseline Transit: 18 Days | Actual Transit: 27 Days
- Delay Variance: +9 Days (Severe Anomalous Bottleneck at Seattle customs)

⏳ SAFETY STOCK BUFFER RECOMMENDATIONS
- Average Daily Demand: 1,200 Units
- Average Lead Time (Baseline): 18 Days
- Maximum Lead Time (Anomalous Peak): 27 Days
- Safety Stock Equation: (27 - 18) * 1,200
- Buffer Action Required: Increase safety stock inventory by +10,800 units for Q3 to prevent distribution node stockouts.

💸 FINANCIAL EXPOSURE ASSESSMENT
- Delayed Cargo Capital Value: $540,000 locked in transit
- Demurrage & Port Holding Penalty: $1,450/day (Accrued: $13,050 over 9 days)
- Total Disruption Financial Cost: $13,050 direct penalties + 4.2% supply chain margin degradation.

🚀 TACTICAL MITIGATION ACTION ITEMS
1. [Action 1] Reroute secondary container clusters (LN-403, LN-404) to Port of Vancouver; execute short-haul rail distribution to US North-West nodes.
2. [Action 2] Implement buffer inventory tracking at Omaha central hub to offset Seattle port backlog.
3. [Action 3] Trigger local supplier procurement contracts in Salt Lake City, Utah for high-velocity SKUs."""
    },
    "2": {
        "role": "📋 Product Manager",
        "task": "Market Opportunity Discovery & Product Vision Synthesizer",
        "prompt": """SYSTEM ROLE:
You are a Principal Growth Product Manager and Strategic Analyst. Your goal is to convert complex competitive and user feedback logs into high-impact, executive-ready product briefs.

INPUT DATA STRUCTURE:
Customer review logs, feature request tickets, competitive landscape metrics, and engineering resource constraints.

TASK INSTRUCTIONS:
1. Synthesize user pain points into 3 primary "Jobs-To-Be-Done" (JTBD) frameworks.
2. Outline the product vision and core value proposition (the "Why").
3. Estimate strategic product goals using the RICE framework (Reach, Impact, Confidence, Effort).
4. Define 3 key North Star product metrics (KPIs) to track launch success.

OUTPUT FORMAT:
Renders a 1-page executive Product Strategy Brief:
- 🎯 Core Value Proposition & Vision Statement
- 💡 Jobs-To-Be-Done (JTBD) Matrix
- 📊 RICE Prioritization Summary Table
- 📈 Success KPIs (North Star & Guardrail metrics)""",
        "output": """🎯 CORE VALUE PROPOSITION & VISION STATEMENT
"To democratize enterprise supply chain transparency, providing operational managers with real-time risk predictions and automated logistics routing to completely eliminate transport delay anxieties."

💡 JOBS-TO-BE-DONE (JTBD) MATRIX
1. [Job 1] When an ocean port experiences sudden delay anomalies, logistics directors want to automatically evaluate land rerouting options so they can keep retail nodes stocked and protect margins.
2. [Job 2] When evaluating quarterly performance metrics, executive sponsors want a transparent ROI scorecard so they can justify logistics software subscriptions.

📊 RICE PRIORITIZATION SUMMARY TABLE
| Feature Proposal | Reach (1-10) | Impact (1-3) | Confidence % | Effort (Person-Mo) | RICE Score |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Automated Port Rerouting Engine | 8 | 3.0 | 90% | 4.0 | 540 (Priority 1) |
| Multi-Carrier Billing Portal | 5 | 1.0 | 80% | 2.5 | 160 (Priority 2) |

📈 SUCCESS KPIs
* **North Star Metric:** Daily Automated Rerouting Events Successfully Completed (Target: >150/day).
* **Efficiency Indicator:** Average Time-to-Mitigate Shipping Disruptions (Target: <15 Minutes).
* **Guardrail Indicator:** Billing discrepancies / payment failures (Target: <0.1% rate)."""
    },
    "3": {
        "role": "📋 Product Owner",
        "task": "Agile User Story Map & Acceptance Criteria Generator",
        "prompt": """SYSTEM ROLE:
You are a Principal Product Owner and Agile SDLC Expert. Your goal is to break down high-level epic briefs into detailed, developer-ready backlog user stories that leave zero room for ambiguity.

INPUT DATA STRUCTURE:
Feature descriptions, stakeholder requirements, technical constraints, and user persona profiles.

TASK INSTRUCTIONS:
1. Structure stories using the standard template: "As a [user persona], I want [action] so that [expected business value]."
2. Draft comprehensive Behavior-Driven Development (BDD) Acceptance Criteria using the Gherkin format (Given-When-Then) for happy paths, edge cases, and validation rules.
3. Explicitly document technical dependencies, data validations, and security conditions.
4. Estimate story complexity using Fibonacci sequence points.

OUTPUT FORMAT:
Renders a structured Agile Backlog card:
- 👤 User Story Definition
- 🛠️ Given-When-Then Acceptance Criteria (Scenario 1: Happy Path, Scenario 2: Validation Failure)
- ⛓️ Technical Dependencies & Constraints
- 🃏 Fibonacci Story Point Recommendation""",
        "output": """👤 USER STORY DEFINITION
- ID: AP-802 | Title: Automated Regional Port Diversion Logic
- "As an Enterprise Logistics Manager, I want the system to suggest alternative delivery ports when delay variance exceeds +5 days, so that I can protect time-to-market margins and prevent distribution node stockouts."

🛠️ GIVEN-WHEN-THEN ACCEPTANCE CRITERIA
* **Scenario 1: Happy Path - Rerouting Triggered Successfully**
  * **Given** a container shipment LN-402 is transit-logged on the Pacific Route,
  * **And** the active delay variance at Seattle Gateway rises to +6 days,
  * **When** the logistics manager views the shipment details panel,
  * **Then** the system renders a glowing "Alternative Route Available" button,
  * **And** displays Port of Vancouver as the optimal diversion node with a 90% confidence score.

* **Scenario 2: Validation Failure - Alternate Port backlogged**
  * **Given** a container shipment is delayed by +6 days,
  * **And** Port of Vancouver is also reporting delay variance > +4 days,
  * **When** the system calculates alternate paths,
  * **Then** the system suppresses the Port of Vancouver recommendation,
  * **And** returns a warning alert recommending multi-modal overland freight instead.

⛓️ TECHNICAL DEPENDENCIES
- Requires active integration with CoinGecko API / Port congestion logs (REST endpoint: `GET /api/v2/port-congestion`).
- Must pass ISO-27001 data tokenization checks.

🃏 FIBONACCI STORY POINT RECOMMENDATION
- 5 Story Points (Medium complexity: requires integrating multiple REST endpoints and UI dynamic maps)."""
    },
    "4": {
        "role": "📋 Project Manager",
        "task": "Risk Log, Milestone Planner & Critical Path Dependency Analyzer",
        "prompt": """SYSTEM ROLE:
You are a Certified PMP Lead Project Manager and Portfolio Operations Strategist. Your goal is to audit project milestones, track execution risks, and map critical path dependencies.

INPUT DATA STRUCTURE:
Project timeline logs, active task owners, resource constraints, milestone completion metrics, and bottleneck logs.

TASK INSTRUCTIONS:
1. Identify and categorize execution risks (Low, Medium, High) using a standard Risk Matrix.
2. Define Milestone Dependencies (Finish-to-Start, Start-to-Start).
3. Identify Critical Path tasks that threaten the project delivery date.
4. Draft a Project Health Recovery Plan (CRASHING or FAST-TRACKING actions).

OUTPUT FORMAT:
Renders a structured Project Status Dashboard:
- 🚩 Critical Path Alert Panel
- 🎛️ Risk Assessment Matrix (Severity vs. Probability)
- ⛓️ Dependency Milestone Logic
- 🚀 Project Recovery Playbook""",
        "output": """🚩 CRITICAL PATH ALERT PANEL
- Critical Path Status: 🔴 BEHIND SCHEDULE (Delay: 12 days)
- Bottleneck Node: Database schema modeling and PostgreSQL migration (Assigned to: Data Eng Squad).
- Critical Dependency Chain: `Database Schema Design` (Completed) -> `ETL Pipeline Development` (12-day delay) -> `Power BI UI Dashboard Build` (Blocked) -> `Executive UAT Sign-off`.

🎛️ RISK ASSESSMENT MATRIX
| Risk Event Description | Probability | Severity | Status | Mitigation Action Plan |
| :--- | :--- | :--- | :--- | :--- |
| Port Congestion API rate limits | Medium | High | Active | Implement local Redis cache layer to store API queries for 24h. |
| Stakeholder UAT alignment lag | High | Medium | Potential | Set up recurring daily 15-minute alignment stand-ups on Slack. |

⛓️ DEPENDENCY MILESTONE LOGIC
- Milestone 1: Star Schema DB construction (Finish-to-Start) -> Milestone 2: ETL extraction main run (Finish-to-Start) -> Milestone 3: Dashboard deployment.

🚀 PROJECT RECOVERY PLAYBOOK
1. [Crash Execution] Allocate 2 senior software developers from the Core Platform squad to support the Data Eng team for 5 days.
2. [Fast-Track Tasks] Begin coding the Power BI frontend components using mock static JSON datasets while the SQL ETL pipeline is finalized."""
    },
    "5": {
        "role": "⚡ Business Analyst",
        "task": "Customer Cohort Retention & Churn Diagnostic Interpreter",
        "prompt": """SYSTEM ROLE:
You are an Enterprise Business Analyst and Revenue Operations (RevOps) Lead. Your goal is to audit pipeline conversions, detect customer retention leaks, and build growth models.

INPUT DATA STRUCTURE:
Opportunity funnels, stage transition days, cohort churn data, regional revenue distributions, and account penetration statistics.

TASK INSTRUCTIONS:
1. Calculate pipeline velocity metrics (average days in each sales stage).
2. Diagnose cohort churn percentages against industry baselines.
3. Quantify the financial revenue leakage in proposal-to-win conversions.
4. Formulate 3 growth levers (up-sell expansion, bottleneck removal, pipeline crashing).

OUTPUT FORMAT:
Renders a business diagnostics scorecard:
- 📉 Revenue Funnel Leakage Audit
- ⏳ Pipeline Velocity Scorecard (Days-in-Stage analysis)
- 🧬 Customer Cohort Retention Assessment
- 💸 RevOps Growth Recommendations""",
        "output": """📉 REVENUE FUNNEL LEAKAGE AUDIT
- Total Baseline Revenue: $856M Operations
- Funnel Conversion: Prospecting (100%) -> Proposal (45%) -> Closed Won (12%).
- Major Pipeline Leak: **33% leakage occurs at the Proposal stage** (waiting for custom pricing reviews).
- Financial Revenue Leakage Impact: **$8.2M in annual recurring revenue lost** due to deals stalling at the Proposal stage.

⏳ PIPELINE VELOCITY SCORECARD
- Average Sales Cycle: 138 Days
- Stage Duration breakdown: Prospecting (14 days) -> Qualification (24 days) -> **Proposal (52 days - Critical Bottleneck)** -> Negotiation (28 days) -> Closed (20 days).

🧬 CUSTOMER COHORT RETENTION ASSESSMENT
- Month-12 (M12) Customer Retention: 84% (Industry Benchmark: 91%).
- Major Churn Driver: Onboarding friction and delays in shipping key products (Supply Chain alignment issue).

💸 REVOPS GROWTH RECOMMENDATIONS
1. [Lever 1] Integrate the AI-Driven Pricing Engine to compress Proposal approval cycles from 52 days to 3 days (Plugs $8.2M bottleneck).
2. [Lever 2] Implement automatic Slack/Email triggers for outbound Hunter reps when prospect accounts drop activity metrics below baseline thresholds."""
    },
    "6": {
        "role": "💻 Software Engineer",
        "task": "System Architecture, Design Patterns & Code Refactoring Auditor",
        "prompt": """SYSTEM ROLE:
You are a Principal Software Engineer and System Architect. Your goal is to analyze database schemas, assess code quality, and refactor slow SQL analytics or data models into clean, high-performance architectures.

INPUT DATA STRUCTURE:
Raw relational database schemas, staging tables, slow-running SQL queries, or data processing code snippets.

TASK INSTRUCTIONS:
1. Inspect the SQL/schema query plan for full-table scans, lack of indexes, or costly nested loops.
2. Refactor the code or schema using optimal design patterns (e.g., Star Schema, Common Table Expressions - CTEs, Indexing).
3. Estimate complexity using Big-O notation.
4. Provide clear before-and-after performance comparisons.

OUTPUT FORMAT:
Renders a high-fidelity technical audit report:
- 🔴 Performance Bottleneck Diagnosis
- 🛠️ Refactored SQL / Code Block (with syntax highlighting)
- 📊 Database Schema Indexing Recommendations
- ⚡ Complexity Analysis (Big-O notation changes)""",
        "output": """🔴 PERFORMANCE BOTTLENECK DIAGNOSIS
- Issue: Daily automated port metrics query is timing out after 120 seconds.
- Root Cause: Full-table scan occurring on the `ocean_shipment_logs` table because the query uses nested loops to join on unindexed `port_code` and `timestamp` columns.
- Impact: Blocked API requests on the interactive map page.

🛠️ REFACTORED SQL CODE BLOCK
-- Optimized with Common Table Expressions (CTE) and Indexed lookups
WITH daily_shipments AS (
    SELECT id, port_id, container_status, actual_transit_days
    FROM ocean_shipment_logs
    WHERE log_timestamp >= CURRENT_DATE - INTERVAL '1 day'
)
SELECT s.id, p.port_name, s.container_status, s.actual_transit_days
FROM daily_shipments s
JOIN dim_ports p ON s.port_id = p.port_id
ORDER BY s.actual_transit_days DESC;

📊 DATABASE SCHEMA INDEXING RECOMMENDATIONS
- Execute this index script immediately to resolve table scans:
  `CREATE INDEX idx_logs_timestamp_port ON ocean_shipment_logs(log_timestamp, port_id);`

⚡ COMPLEXITY ANALYSIS
- Before Complexity: O(N * M) - Quadratic due to double table scan joins.
- After Complexity: O(N log N) - Linear-logarithmic sorting through indexed lookup index tree structure. Query time compressed from 120 seconds to 80 milliseconds."""
    }
}

def print_header(title):
    print(f"\n{Colors.BOLD}{Colors.GOLD}============================================================{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.CYAN}  {title}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.GOLD}============================================================{Colors.ENDC}")

def calculate_roi_sim(team_size, hourly_rate, automation_rate, tool_cost):
    monthly_work_hours = 160
    task_efficiency_compression = 0.5
    
    # Hours saved per month
    hours_saved = int(team_size * monthly_work_hours * (automation_rate / 100) * task_efficiency_compression)
    
    # Financial metrics
    monthly_labor_savings = hours_saved * hourly_rate
    monthly_tool_cost = team_size * tool_cost
    net_savings = monthly_labor_savings - monthly_tool_cost
    
    # Productivity multiplier
    productivity = 1 / (1 - ((automation_rate / 100) * task_efficiency_compression))
    
    # Payback
    setup_cost = monthly_tool_cost * 1.5
    if net_savings > 0:
        breakeven = setup_cost / net_savings
        breakeven_str = f"{breakeven:.1f} Months"
    else:
        breakeven_str = "Infinite"
        
    print_header("AI OPERATIONS ROI SCENARIO MODEL")
    print(f"{Colors.BOLD}INPUT VARIABLES:{Colors.ENDC}")
    print(f"  - Team Size: {Colors.CYAN}{team_size} Reps/Analysts{Colors.ENDC}")
    print(f"  - Blended Labor Cost: {Colors.CYAN}${hourly_rate}/hour{Colors.ENDC}")
    print(f"  - AI Automation Rate: {Colors.CYAN}{automation_rate}%{Colors.ENDC}")
    print(f"  - AI Tool Subscription: {Colors.CYAN}${tool_cost}/month per user{Colors.ENDC}")
    print("")
    print(f"{Colors.BOLD}CALCULATED IMPACT METRICS:{Colors.ENDC}")
    print(f"  - Hours Saved / Month:      {Colors.GREEN}{hours_saved:,} Hours{Colors.ENDC}")
    print(f"  - Net Monthly Savings ($):  {Colors.GREEN}${net_savings:,}{Colors.ENDC}")
    print(f"  - Capacity Multiplier:      {Colors.GREEN}{productivity:.2f}x Output Increase{Colors.ENDC}")
    print(f"  - Breakeven Timeline:       {Colors.GREEN}{breakeven_str}{Colors.ENDC}")
    print("")
    
    if net_savings > 0:
        print(f"{Colors.BOLD}{Colors.GREEN}✓ ROI Positive:{Colors.ENDC} Implementing AI yields equivalent capacity of adding {Colors.BOLD}{round(hours_saved / monthly_work_hours)}{Colors.ENDC} operators free of charge!")
    else:
        print(f"{Colors.BOLD}{Colors.RED}✗ ROI Negative:{Colors.ENDC} Platform subscription costs exceed labor savings. Recommend scaling automation % or decreasing tool costs.")

def simulate_llm(key):
    data = PROMPTS[key]
    print_header(f"SANDBOX: SIMULATING AI EXECUTION FOR {data['role'].upper()}")
    
    logs = [
        "[System] Scrubbing corporate customer logs (PII Masking applied)...",
        "[Success] Scrubbed target logs. Data schema assertions verified.",
        "[System] Compiling System Prompt and CTE constraints...",
        "[API] Connecting to Enterprise Llama-3 API Gateway (Secure VPC)...",
        "[API] Streaming model inference response (Time to first token: 142ms)..."
    ]
    
    for log in logs:
        time.sleep(0.4)
        if "[Success]" in log:
            print(f"{Colors.GREEN}{log}{Colors.ENDC}")
        else:
            print(f"{Colors.BLUE}{log}{Colors.ENDC}")
            
    print(f"\n{Colors.BOLD}{Colors.GOLD}>>> RENDERED SYSTEM PROMPT DEFINITION:{Colors.ENDC}")
    print(f"{Colors.CYAN}{data['prompt']}{Colors.ENDC}")
    
    time.sleep(1.0)
    print(f"\n{Colors.BOLD}{Colors.GREEN}>>> COMPILING FINAL AI DIAGNOSTIC OUTPUT:{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}============================================================{Colors.ENDC}")
    print(data['output'])
    print(f"{Colors.BOLD}{Colors.BLUE}============================================================{Colors.ENDC}")
    print(f"{Colors.GREEN}[Success] Operational task finished successfully. Execution: 1.45s.{Colors.ENDC}")

def menu():
    while True:
        os.system('clear' if os.name == 'posix' else 'cls')
        print(f"{Colors.BOLD}{Colors.GOLD}============================================================{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.CYAN}       ODP Business Solutions — Enterprise AI Playbook{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.GOLD}============================================================{Colors.ENDC}")
        print("  1. 🎛️ Run AI ROI Scenario Simulator")
        print("  2. 📋 View System Prompts & Simulate AI Execution")
        print("  3. Exit Console")
        print(f"{Colors.BOLD}{Colors.GOLD}============================================================{Colors.ENDC}")
        
        choice = input(f"{Colors.BOLD}Select Option (1-3): {Colors.ENDC}").strip()
        
        if choice == "1":
            try:
                print("\nLet's model an operational scenario:")
                team = int(input("Enter Team Size (e.g., 15): ") or 15)
                rate = int(input("Enter Blended Hourly Rate ($) (e.g., 55): ") or 55)
                auto = int(input("Enter AI Task Automation Rate (%) (e.g., 35): ") or 35)
                cost = int(input("Enter AI Tool Subscription Cost ($/mo) (e.g., 250): ") or 250)
                calculate_roi_sim(team, rate, auto, cost)
            except ValueError:
                print(f"{Colors.RED}Invalid numeric entry. Using defaults...{Colors.ENDC}")
                calculate_roi_sim(15, 55, 35, 250)
            input("\nPress [Enter] to return to menu...")
            
        elif choice == "2":
            os.system('clear' if os.name == 'posix' else 'cls')
            print_header("PROMPT ENGINEERING CATALOG — CHOOSE ROLE")
            for k, v in PROMPTS.items():
                print(f"  {k}. {v['role']} — ({v['task']})")
            print("  7. Return to main menu")
            print(f"{Colors.BOLD}{Colors.GOLD}============================================================{Colors.ENDC}")
            
            role_choice = input(f"{Colors.BOLD}Select Role (1-7): {Colors.ENDC}").strip()
            if role_choice in PROMPTS:
                simulate_llm(role_choice)
            input("\nPress [Enter] to return to menu...")
            
        elif choice == "3" or choice.lower() == "exit":
            print(f"\n{Colors.BOLD}{Colors.GOLD}Exiting AI Operations Console. Designed by Saurabh Shidhore.{Colors.ENDC}\n")
            break
        else:
            print(f"{Colors.RED}Invalid option selected. Press [Enter] to try again.{Colors.ENDC}")
            time.sleep(1)

if __name__ == "__main__":
    try:
        menu()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.BOLD}{Colors.GOLD}Exiting console. Safe operations!{Colors.ENDC}\n")
