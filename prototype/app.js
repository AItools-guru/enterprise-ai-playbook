/* ==========================================================================
   ENTERPRISE AI PLAYBOOK - REACTIVE APPLICATION LOGIC
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Initialize global variables
    window.globalNetSavings = 0;

    // ---------------------------------------------------------
    // 1. Tab Navigation
    // ---------------------------------------------------------
    const navItems = document.querySelectorAll(".nav-item");
    const tabPanels = document.querySelectorAll(".tab-panel");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(n => n.classList.remove("active"));
            tabPanels.forEach(p => p.classList.remove("active"));

            item.classList.add("active");
            const targetTab = item.getAttribute("data-tab");
            document.getElementById(targetTab).classList.add("active");
        });
    });

    // ---------------------------------------------------------
    // 2. Interactive ROI Simulator & Canvas Chart Engine
    // ---------------------------------------------------------
    const inputTeamSize = document.getElementById("team-size");
    const inputHourlyRate = document.getElementById("hourly-rate");
    const inputAutomationRate = document.getElementById("automation-rate");
    const inputToolCost = document.getElementById("tool-cost");

    const valTeamSize = document.getElementById("val-team-size");
    const valHourlyRate = document.getElementById("val-hourly-rate");
    const valAutomationRate = document.getElementById("val-automation-rate");
    const valToolCost = document.getElementById("val-tool-cost");

    const kpiHoursSaved = document.getElementById("kpi-hours-saved");
    const kpiNetSavings = document.getElementById("kpi-net-savings");
    const kpiProductivity = document.getElementById("kpi-productivity");
    const kpiBreakeven = document.getElementById("kpi-breakeven");
    const roiNarrative = document.getElementById("roi-narrative");
    const roiChart = document.getElementById("roi-chart");

    function drawROIChart(teamSize, hourlyRate, automationRate, toolCost, hoursSaved, netMonthlySavings) {
        if (!roiChart) return;
        const ctx = roiChart.getContext("2d");
        
        // Handle High-DPI screens
        const width = roiChart.clientWidth;
        const height = roiChart.clientHeight;
        if (roiChart.width !== width || roiChart.height !== height) {
            roiChart.width = width;
            roiChart.height = height;
        }

        ctx.clearRect(0, 0, width, height);

        // Core chart settings
        const paddingLeft = 50;
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 30;
        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        // Draw grid lines
        ctx.strokeStyle = "rgba(48, 54, 61, 0.3)";
        ctx.lineWidth = 1;
        ctx.font = "10px Inter";
        ctx.fillStyle = "#8b949e";
        
        // Horizontal lines (y-axis grid)
        const yLines = 4;
        for (let i = 0; i <= yLines; i++) {
            const y = paddingTop + (chartHeight / yLines) * i;
            ctx.beginPath();
            ctx.moveTo(paddingLeft, y);
            ctx.lineTo(width - paddingRight, y);
            ctx.stroke();
        }

        // Vertical lines & Month labels (x-axis grid)
        const totalMonths = 12;
        for (let m = 1; m <= totalMonths; m++) {
            const x = paddingLeft + (chartWidth / (totalMonths - 1)) * (m - 1);
            ctx.fillText(`M${m}`, x - 8, height - 10);
        }

        // Calculate Data Points over 12 Months
        // Setup Cost = 1.5 months of tool subscription cost
        const monthlyToolCost = teamSize * toolCost;
        const setupCost = monthlyToolCost * 1.5;
        const monthlyLaborSavings = hoursSaved * hourlyRate;

        const cumulativeCost = [];
        const cumulativeSavings = [];
        
        for (let m = 0; m < totalMonths; m++) {
            cumulativeCost.push(setupCost + (m * monthlyToolCost));
            cumulativeSavings.push(m * monthlyLaborSavings);
        }

        const maxVal = Math.max(
            Math.max(...cumulativeCost),
            Math.max(...cumulativeSavings),
            1000
        );

        // Map Value to Canvas Y coordinate
        function mapY(val) {
            return height - paddingBottom - (val / maxVal) * chartHeight;
        }

        // Map Month to Canvas X coordinate
        function mapX(mIndex) {
            return paddingLeft + (chartWidth / (totalMonths - 1)) * mIndex;
        }

        // 1. Draw Cumulative Implementation Cost Line (Cobalt Blue/Purple)
        ctx.strokeStyle = "#bc39fa";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(mapX(0), mapY(cumulativeCost[0]));
        for (let m = 1; m < totalMonths; m++) {
            ctx.lineTo(mapX(m), mapY(cumulativeCost[m]));
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash pattern

        // 2. Draw Cumulative Human Labor Savings Line (Glowing Neon Green)
        ctx.strokeStyle = "#39ff14";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#39ff14";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(mapX(0), mapY(cumulativeSavings[0]));
        for (let m = 1; m < totalMonths; m++) {
            ctx.lineTo(mapX(m), mapY(cumulativeSavings[m]));
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow

        // 3. Draw Breakeven Point Indicator
        if (monthlyLaborSavings > monthlyToolCost) {
            const breakevenMonth = setupCost / (monthlyLaborSavings - monthlyToolCost);
            if (breakevenMonth > 0 && breakevenMonth <= totalMonths) {
                const intersectX = paddingLeft + (chartWidth / (totalMonths - 1)) * (breakevenMonth - 1);
                const intersectVal = setupCost + ((breakevenMonth - 1) * monthlyToolCost);
                const intersectY = mapY(intersectVal);

                // Draw glowing outer halo ring
                ctx.fillStyle = "rgba(57, 255, 20, 0.2)";
                ctx.beginPath();
                ctx.arc(intersectX, intersectY, 10, 0, Math.PI * 2);
                ctx.fill();

                // Draw solid center dot
                ctx.fillStyle = "#ffd700";
                ctx.beginPath();
                ctx.arc(intersectX, intersectY, 5, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw tiny intersection label
                ctx.fillStyle = "#fff";
                ctx.font = "bold 9px Inter";
                ctx.fillText("Breakeven", intersectX - 24, intersectY - 14);
            }
        }
    }

    function calculateROI() {
        const teamSize = parseInt(inputTeamSize.value);
        const hourlyRate = parseInt(inputHourlyRate.value);
        const automationRate = parseInt(inputAutomationRate.value) / 100;
        const toolCost = parseInt(inputToolCost.value);

        // Update Slider Labels
        valTeamSize.textContent = teamSize;
        valHourlyRate.textContent = `$${hourlyRate}`;
        valAutomationRate.textContent = `${inputAutomationRate.value}%`;
        valToolCost.textContent = `$${toolCost}`;

        // Calculations
        const monthlyWorkHours = 160;
        const taskEfficiencyCompression = 0.5; // 50% faster on automated tasks
        const hoursSaved = Math.round(teamSize * monthlyWorkHours * automationRate * taskEfficiencyCompression);
        
        // Financials
        const totalLaborSavings = hoursSaved * hourlyRate;
        const totalImplementationCost = teamSize * toolCost;
        const netMonthlySavings = totalLaborSavings - totalImplementationCost;
        
        // Productivity Multiplier
        const capacityMultiplier = (1 / (1 - (automationRate * taskEfficiencyCompression))).toFixed(2);
        
        // Payback / Breakeven
        const setupCost = totalImplementationCost * 1.5;
        let breakevenMonths = 0;
        if (netMonthlySavings > 0) {
            breakevenMonths = (setupCost / netMonthlySavings).toFixed(1);
        } else {
            breakevenMonths = "∞";
        }

        // Render Values
        kpiHoursSaved.textContent = hoursSaved.toLocaleString();
        
        if (netMonthlySavings >= 0) {
            kpiNetSavings.textContent = `$${netMonthlySavings.toLocaleString()}`;
            kpiNetSavings.parentElement.parentElement.className = "kpi-card glow-green";
        } else {
            kpiNetSavings.textContent = `-$${Math.abs(netMonthlySavings).toLocaleString()}`;
            kpiNetSavings.parentElement.parentElement.className = "kpi-card glow-purple";
        }
        
        kpiProductivity.textContent = `${capacityMultiplier}x`;
        kpiBreakeven.textContent = breakevenMonths === "∞" ? "Infinite" : `${breakevenMonths} Months`;

        // Update Narrative
        if (netMonthlySavings <= 0) {
            roiNarrative.innerHTML = `<span style="color: #ff5f56; font-weight: 600;"><i class="fa-solid fa-triangle-exclamation"></i> Alert:</span> Your subscription costs exceed labor savings. Recommend lowering the Tool Cost slider or targeting higher automation tasks to achieve positive operational ROI.`;
        } else {
            roiNarrative.innerHTML = `<span style="color: #39ff14; font-weight: 600;"><i class="fa-solid fa-circle-check"></i> Operational Match:</span> Implementing AI across <strong>${teamSize} reps</strong> generates a capacity equivalent to adding <strong>${Math.round(hoursSaved / monthlyWorkHours)} full-time operators</strong> to your squad—fully paid off in <strong>${breakevenMonths} months</strong>.`;
        }

        // Render interactive line chart live!
        drawROIChart(teamSize, hourlyRate, parseInt(inputAutomationRate.value), toolCost, hoursSaved, netMonthlySavings);
        
        // Save to global variables for map sync
        window.globalNetSavings = netMonthlySavings;
        if (window.triggerMapUpdate) {
            window.triggerMapUpdate();
        }
    }

    // Sliders Event Listeners
    [inputTeamSize, inputHourlyRate, inputAutomationRate, inputToolCost].forEach(input => {
        input.addEventListener("input", calculateROI);
    });

    // Initialize Calculations
    calculateROI();

    // Trigger redrawing chart on window resize
    window.addEventListener("resize", calculateROI);


    // ---------------------------------------------------------
    // 3. Prompt Catalog & Sandboxed LLM Simulator Data
    // ---------------------------------------------------------
    const prompts = {
        "supply-chain": {
            title: "📦 Supply Chain & Logistics Analyst Prompt",
            prompt: `SYSTEM ROLE:
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
- 🚀 Tactical Mitigation Action Items`,
            simulatedOutput: `📊 OPERATIONAL DELAY SUMMARY
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
3. [Action 3] Trigger local supplier procurement contracts in Salt Lake City, Utah for high-velocity SKUs.`
        },
        "product-manager": {
            title: "📋 Product Manager Prompt",
            prompt: `SYSTEM ROLE:
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
- 📈 Success KPIs (North Star & Guardrail metrics)`,
            simulatedOutput: `🎯 CORE VALUE PROPOSITION & VISION STATEMENT
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
* **Guardrail Indicator:** Billing discrepancies / payment failures (Target: <0.1% rate).`
        },
        "product-owner": {
            title: "📋 Product Owner Prompt",
            prompt: `SYSTEM ROLE:
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
- 🃏 Fibonacci Story Point Recommendation`,
            simulatedOutput: `👤 USER STORY DEFINITION
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
- Requires active integration with CoinGecko API / Port congestion logs (REST endpoint: \`GET /api/v2/port-congestion\`).
- Must pass ISO-27001 data tokenization checks.

🃏 FIBONACCI STORY POINT RECOMMENDATION
- 5 Story Points (Medium complexity: requires integrating multiple REST endpoints and UI dynamic maps).`
        },
        "project-manager": {
            title: "📋 Project Manager Prompt",
            prompt: `SYSTEM ROLE:
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
- 🚀 Project Recovery Playbook`,
            simulatedOutput: `🚩 CRITICAL PATH ALERT PANEL
- Critical Path Status: 🔴 BEHIND SCHEDULE (Delay: 12 days)
- Bottleneck Node: Database schema modeling and PostgreSQL migration (Assigned to: Data Eng Squad).
- Critical Dependency Chain: \`Database Schema Design\` (Completed) -> \`ETL Pipeline Development\` (12-day delay) -> \`Power BI UI Dashboard Build\` (Blocked) -> \`Executive UAT Sign-off\`.

🎛️ RISK ASSESSMENT MATRIX
| Risk Event Description | Probability | Severity | Status | Mitigation Action Plan |
| :--- | :--- | :--- | :--- | :--- |
| Port Congestion API rate limits | Medium | High | Active | Implement local Redis cache layer to store API queries for 24h. |
| Stakeholder UAT alignment lag | High | Medium | Potential | Set up recurring daily 15-minute alignment stand-ups on Slack. |

⛓️ DEPENDENCY MILESTONE LOGIC
- Milestone 1: Star Schema DB construction (Finish-to-Start) -> Milestone 2: ETL extraction main run (Finish-to-Start) -> Milestone 3: Dashboard deployment.

🚀 PROJECT RECOVERY PLAYBOOK
1. [Crash Execution] Allocate 2 senior software developers from the Core Platform squad to support the Data Eng team for 5 days.
2. [Fast-Track Tasks] Begin coding the Power BI frontend components using mock static JSON datasets while the SQL ETL pipeline is finalized.`
        },
        "business-analyst": {
            title: "⚡ Business Analyst Prompt",
            prompt: `SYSTEM ROLE:
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
- 💸 RevOps Growth Recommendations`,
            simulatedOutput: `📉 REVENUE FUNNEL LEAKAGE AUDIT
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
2. [Lever 2] Implement automatic Slack/Email triggers for outbound Hunter reps when prospect accounts drop activity metrics below baseline thresholds.`
        },
        "software-engineer": {
            title: "💻 Software Engineer Prompt",
            prompt: `SYSTEM ROLE:
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
- ⚡ Complexity Analysis (Big-O notation changes)`,
            simulatedOutput: `🔴 PERFORMANCE BOTTLENECK DIAGNOSIS
- Issue: Daily automated port metrics query is timing out after 120 seconds.
- Root Cause: Full-table scan occurring on the \`ocean_shipment_logs\` table because the query uses nested loops to join on unindexed \`port_code\` and \`timestamp\` columns.
- Impact: Blocked API requests on the interactive map page.

🛠️ REFACTORED SQL CODE BLOCK
\`\`\`sql
-- BEFORE: Costly unindexed joins and full scans
-- SELECT * FROM logs JOIN ports ON logs.port = ports.code WHERE logs.date = today()

-- AFTER: Optimized with Common Table Expressions (CTE) and Indexed lookups
WITH daily_shipments AS (
    SELECT id, port_id, container_status, actual_transit_days
    FROM ocean_shipment_logs
    WHERE log_timestamp >= CURRENT_DATE - INTERVAL '1 day'
)
SELECT s.id, p.port_name, s.container_status, s.actual_transit_days
FROM daily_shipments s
JOIN dim_ports p ON s.port_id = p.port_id
ORDER BY s.actual_transit_days DESC;
\`\`\`

📊 DATABASE SCHEMA INDEXING RECOMMENDATIONS
- Execute this index script immediately to resolve table scans:
  \`CREATE INDEX idx_logs_timestamp_port ON ocean_shipment_logs(log_timestamp, port_id);\`

⚡ COMPLEXITY ANALYSIS
- Before Complexity: O(N * M) - Quadratic due to double table scan joins.
- After Complexity: O(N log N) - Linear-logarithmic sorting through indexed lookup index tree structure. Query time compressed from 120 seconds to 80 milliseconds.`
        }
    };

    // ---------------------------------------------------------
    // 4. Prompt UI Selectors & Terminal Execution Engine
    // ---------------------------------------------------------
    const roleBtns = document.querySelectorAll(".role-btn");
    const promptRoleTitle = document.getElementById("prompt-role-title");
    const promptContentCode = document.getElementById("prompt-content-code");
    const terminalScreen = document.getElementById("terminal-screen");
    const btnCopyPrompt = document.getElementById("btn-copy-prompt");
    const btnRunSimulation = document.getElementById("btn-run-simulation");

    let currentRole = "supply-chain";

    function updatePromptView(role) {
        currentRole = role;
        const data = prompts[role];
        promptRoleTitle.innerHTML = data.title;
        promptContentCode.textContent = data.prompt;

        // Reset terminal screen
        terminalScreen.innerHTML = `
            <p class="sys-msg">[System] Ready to run AI diagnostics for ${role}...</p>
            <p class="sys-msg">[System] Click 'Simulate AI Execution' above to test the prompt against live business data models.</p>
        `;
    }

    // Role Buttons Click Event
    roleBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            roleBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const role = btn.getAttribute("data-role");
            updatePromptView(role);
        });
    });

    // Copy Prompt to Clipboard
    btnCopyPrompt.addEventListener("click", () => {
        const textToCopy = promptContentCode.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = btnCopyPrompt.innerHTML;
            btnCopyPrompt.innerHTML = `<i class="fa-solid fa-check" style="color: #39ff14;"></i> Copied!`;
            setTimeout(() => {
                btnCopyPrompt.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error("Clipboard copy failed: ", err);
        });
    });

    // Simulate AI Execution terminal logs
    btnRunSimulation.addEventListener("click", () => {
        btnRunSimulation.classList.add("running");
        btnRunSimulation.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Running AI...`;

        terminalScreen.innerHTML = `<p class="log-line">[System] Scrubbing corporate customer logs (Scrubbing unmasked PII data)...</p>`;
        
        const logs = [
            `[Success] Scrubbed PII data. Data validated against schema assertions.`,
            `[System] Compiling System Prompt and Context Variables...`,
            `[API] Connecting to Enterprise Llama-3 API Gateway (Secure VPC)...`,
            `[API] Submitting payload (Prompt tokens: ${Math.round(promptContentCode.textContent.length / 4)} | Temperature: 0.1)`,
            `[API] Streaming model inference response (Time to first token: 145ms)...`
        ];

        let index = 0;
        const interval = setInterval(() => {
            if (index < logs.length) {
                const line = document.createElement("p");
                line.className = "log-line" + (logs[index].includes("[Success]") ? " success" : "");
                line.textContent = logs[index];
                terminalScreen.appendChild(line);
                terminalScreen.scrollTop = terminalScreen.scrollHeight;
                index++;
            } else {
                clearInterval(interval);
                
                // Print the final result header
                const titleLine = document.createElement("p");
                titleLine.className = "log-line output-title";
                titleLine.innerHTML = `<i class="fa-solid fa-square-poll-horizontal"></i> RENDERED AI OUTPUT (${currentRole.toUpperCase()} DIAGNOSTICS):`;
                terminalScreen.appendChild(titleLine);

                // Print the mock output inside a styled box
                const outputBox = document.createElement("pre");
                outputBox.className = "log-output-content";
                outputBox.textContent = prompts[currentRole].simulatedOutput;
                terminalScreen.appendChild(outputBox);
                
                // End logs
                const endLine = document.createElement("p");
                endLine.className = "log-line success";
                endLine.textContent = `[Success] Operational diagnostic task completed. Execution time: 1.48s.`;
                terminalScreen.appendChild(endLine);
                
                terminalScreen.scrollTop = terminalScreen.scrollHeight;

                // Reset button
                btnRunSimulation.classList.remove("running");
                btnRunSimulation.innerHTML = `<i class="fa-solid fa-play"></i> Simulate AI Execution`;
            }
        }, 600);
    });

    // ---------------------------------------------------------
    // 5. Interactive SVG Map Selection Logic (100% Dynamic Sync)
    // ---------------------------------------------------------
    
    // Store global net savings for regional ROI calculations (initialized at top)
    let activeMapNodeKey = "seattle";

    const nodes = {
        "seattle": {
            title: "<i class='fa-solid fa-satellite-dish'></i> Seattle Cloud Data & Supply Chain Hub",
            desc: "Focuses on international shipping lane analytics, logistics risk mitigation, and automated safety stock calculation engines.",
            roiWeight: 0.20,
            baseStats: [
                "↓ 18% shipping delay",
                "Llama-3-Agent",
                "14" // Base Latency in minutes
            ]
        },
        "sf": {
            title: "<i class='fa-solid fa-brain'></i> San Francisco AI & Product Strategy Hub",
            desc: "Serves as the central product intelligence center, analyzing JTBD customer reviews, competitive metrics, and RICE feature scoring models.",
            roiWeight: 0.40,
            baseStats: [
                "↓ 60% discovery lag",
                "Claude-3.5-Sonnet",
                "4"
            ]
        },
        "chicago": {
            title: "<i class='fa-solid fa-users-line'></i> Chicago Agile Scrum & Operations Node",
            desc: "Responsible for sprint lifecycle metrics, milestone dependency mapping, critical path risk log auditing, and Agile backlog readiness guides.",
            roiWeight: 0.25,
            baseStats: [
                "↑ 250% sprint readiness",
                "Llama-3-70B",
                "8"
            ]
        },
        "austin": {
            title: "<i class='fa-solid fa-rectangle-list'></i> Austin Code Refactoring & Software Scaling Hub",
            desc: "Manages data warehouse modeling (Star Schema SQL), database index tuning, query complexity auditing (Big-O analysis), and ETL pipeline execution.",
            roiWeight: 0.15,
            baseStats: [
                "↓ 40% code review lag",
                "GPT-4o-Coder",
                "5"
            ]
        }
    };

    const mapNodes = document.querySelectorAll(".map-node");
    const nodeDetailTitle = document.getElementById("node-detail-title");
    const nodeDetailDesc = document.getElementById("node-detail-desc");
    const nodeStat1 = document.getElementById("node-stat-1");
    const nodeStat2 = document.getElementById("node-stat-2");
    const nodeStat3 = document.getElementById("node-stat-3");
    const nodeStat4 = document.getElementById("node-stat-4");

    function updateActiveNodeDisplay() {
        const data = nodes[activeMapNodeKey];
        if (data && nodeDetailTitle) {
            // Update Title & Desc
            nodeDetailTitle.innerHTML = data.title;
            nodeDetailDesc.textContent = data.desc;
            
            // ⚙️ Calculate Dynamic Operational Velocity and apply minor telemetry fluctuation (+/- 0.2%)
            const automationPercent = parseInt(document.getElementById("automation-rate").value) || 10;
            const telemetryFluctuation = (Math.random() * 0.4 - 0.2).toFixed(1);
            
            let dynamicVelocity = "";
            if (activeMapNodeKey === "seattle") {
                const baseVal = Math.min(95, Math.round(8 + (automationPercent * 1.0)));
                const displayVal = (parseFloat(baseVal) + parseFloat(telemetryFluctuation)).toFixed(1);
                dynamicVelocity = `↓ ${displayVal}% shipping delay`;
            } else if (activeMapNodeKey === "sf") {
                const baseVal = Math.min(98, Math.round(30 + (automationPercent * 3.0)));
                const displayVal = (parseFloat(baseVal) + parseFloat(telemetryFluctuation)).toFixed(1);
                dynamicVelocity = `↓ ${displayVal}% discovery lag`;
            } else if (activeMapNodeKey === "chicago") {
                const baseVal = Math.round(80 + (automationPercent * 17));
                const displayVal = (parseFloat(baseVal) + parseFloat(telemetryFluctuation)).toFixed(1);
                dynamicVelocity = `↑ ${displayVal}% sprint readiness`;
            } else if (activeMapNodeKey === "austin") {
                const baseVal = Math.min(95, Math.round(15 + (automationPercent * 2.5)));
                const displayVal = (parseFloat(baseVal) + parseFloat(telemetryFluctuation)).toFixed(1);
                dynamicVelocity = `↓ ${displayVal}% code review lag`;
            }
            
            nodeStat1.textContent = dynamicVelocity;
            
            // 🔗 CROSS-TAB STATE SYNC: Read current roadmap status select box value from Strategy Matrix
            const statusSelect = document.querySelector(`.gantt-status-select[data-initiative="${activeMapNodeKey}"]`);
            const statusVal = statusSelect ? statusSelect.value : "live";
            const statusText = statusSelect ? statusSelect.options[statusSelect.selectedIndex].text : "Live / Active";
            
            // Format model integration label dynamically (e.g. Claude-3.5 (Testing))
            const cleanStatus = statusText.replace(/^\d+\.\s*/, ''); // Remove numbering (e.g. '1. Planning' -> 'Planning')
            nodeStat2.textContent = `${data.baseStats[1]} (${cleanStatus})`;
            
            // 💰 Calculate Dynamic ROI: Multiply total Net Savings by this node's weight
            const regionalROI = window.globalNetSavings > 0 ? Math.round(window.globalNetSavings * data.roiWeight) : 0;
            nodeStat3.textContent = `$${regionalROI.toLocaleString()} /mo`;
            
            // ⏳ Live Telemetry Anomaly + Roadmap Latency Sync: 
            // If project is in Planning or Development, simulated latency is much higher because it's not production cached!
            let latencyMultiplier = 1.0;
            if (statusVal === "planning") latencyMultiplier = 3.8;
            else if (statusVal === "development") latencyMultiplier = 2.4;
            else if (statusVal === "testing") latencyMultiplier = 1.5;
            
            const baseLatency = parseInt(data.baseStats[2]);
            const flicker = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
            const liveLatency = Math.max(1, Math.round(baseLatency * latencyMultiplier) + flicker);
            nodeStat4.textContent = `${liveLatency} Minutes`;
        }
    }

    mapNodes.forEach(node => {
        node.addEventListener("click", () => {
            // Remove active state from all nodes
            mapNodes.forEach(n => n.classList.remove("active"));
            
            // Add active state to clicked node
            node.classList.add("active");
            
            // Set active key and refresh display
            activeMapNodeKey = node.id.replace("node-", "");
            updateActiveNodeDisplay();
        });
    });

    // Share update function globally so calculateROI can trigger it dynamically!
    window.triggerMapUpdate = updateActiveNodeDisplay;

    // ⏳ Live Telemetry Auto-Updater: Periodically flicker latency and minor stats
    setInterval(() => {
        if (document.getElementById("operations-map").classList.contains("active")) {
            updateActiveNodeDisplay();
        }
    }, 3000);

    // ---------------------------------------------------------
    // 6. Interactive Roadmap & Gantt Chart Event Handlers
    // ---------------------------------------------------------
    const quarterBtns = document.querySelectorAll(".quarter-btn");
    const ganttRows = document.querySelectorAll(".gantt-row");
    const timelineColHeaders = document.querySelectorAll(".timeline-col-header");
    const milestoneTitle = document.getElementById("milestone-title");
    const milestoneDesc = document.getElementById("milestone-desc");
    const milestoneBox = document.getElementById("milestone-detail-box");
    const statusSelects = document.querySelectorAll(".gantt-status-select");

    const milestoneBriefs = {
        "all": {
            title: "<i class='fa-solid fa-flag-checkered'></i> Active Roadmap Milestone View",
            desc: "Click on a quarter header (Q1-Q4 buttons above) or modify status selectors to audit specific target dates, core milestones, and downstream engineering deliverables."
        },
        "q1": {
            title: "<i class='fa-solid fa-compass'></i> Q1 Milestone: Infrastructure & Architecture Setup",
            desc: "<strong>Target Focus:</strong> Establishing enterprise AI framework foundations, setting up secure API gateway tokens, and validating PII anonymization pipelines.<br/>• <strong>Seattle (Supply Chain):</strong> Complete integration of custom port congestion APIs and local safety stock buffers.<br/>• <strong>SF (Product Strategy):</strong> Set up feedback data parsers and semantic scoring logic."
        },
        "q2": {
            title: "<i class='fa-solid fa-gears'></i> Q2 Milestone: Dynamic Model Processing & Integrations",
            desc: "<strong>Target Focus:</strong> Establishing LLM execution streams, sandbox terminal integrations, and connecting database query models.<br/>• <strong>Seattle Hub:</strong> Launch live route mitigation trials & automated buffer recalculations.<br/>• <strong>SF Hub:</strong> Deploy sentiment anomaly logs and RICE prioritization matrices.<br/>• <strong>Chicago Node:</strong> Configure story mapping and backlog story generation scripts."
        },
        "q3": {
            title: "<i class='fa-solid fa-vial'></i> Q3 Milestone: Stress-Testing & Staging Audits",
            desc: "<strong>Target Focus:</strong> High-volume load testing, SOC-2 compliance verification, and staging deployments across agile teams.<br/>• <strong>SF Hub:</strong> Finalize UAT testing for executive briefings.<br/>• <strong>Chicago Node:</strong> Complete automated story-point capacity checks.<br/>• <strong>Austin Node:</strong> Audit schema index logic and query execution runtimes."
        },
        "q4": {
            title: "<i class='fa-solid fa-rocket'></i> Q4 Milestone: Enterprise Rollout & Dynamic Governance",
            desc: "<strong>Target Focus:</strong> Complete production release, load balancing across model gateways (Claude/Llama/GPT), and executive dashboard handoff.<br/>• <strong>Chicago Node:</strong> Roll out automated backlog story generator to 25 cross-functional squads.<br/>• <strong>Austin Node:</strong> Live SQL runtime optimizations on live production warehouse databases."
        }
    };

    // Status dropdown change triggers progress bar adjustments
    statusSelects.forEach(select => {
        select.addEventListener("change", function() {
            const status = this.value;
            const bar = this.closest('.gantt-row').querySelector('.gantt-bar-progress');
            const outerBar = this.closest('.gantt-row').querySelector('.gantt-bar');
            
            // Remove previous glows
            outerBar.classList.remove("planning-glow", "dev-glow", "testing-glow", "live-glow");
            
            let progressWidth = "10%";
            if (status === "planning") {
                progressWidth = "10%";
                outerBar.classList.add("planning-glow");
            } else if (status === "development") {
                progressWidth = "40%";
                outerBar.classList.add("dev-glow");
            } else if (status === "testing") {
                progressWidth = "75%";
                outerBar.classList.add("testing-glow");
            } else if (status === "live") {
                progressWidth = "100%";
                outerBar.classList.add("live-glow");
            }
            bar.style.width = progressWidth;
            
            // Cross tab refresh trigger: update map dashboard immediately if active!
            if (window.triggerMapUpdate) {
                window.triggerMapUpdate();
            }
            
            // Highlight row briefly to confirm state change
            const row = this.closest('.gantt-row');
            row.style.backgroundColor = "rgba(57, 255, 20, 0.04)";
            setTimeout(() => {
                row.style.backgroundColor = "transparent";
            }, 600);
        });
        
        // Trigger initial paint
        select.dispatchEvent(new Event("change"));
    });

    // Quarter Buttons Click Handler
    quarterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            quarterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const selectedQ = btn.getAttribute("data-quarter");
            
            // 1. Highlight relevant column headers
            timelineColHeaders.forEach(header => {
                const headerQ = header.getAttribute("data-q");
                if (selectedQ === "all" || headerQ === selectedQ) {
                    header.classList.add("active-col");
                } else {
                    header.classList.remove("active-col");
                }
            });
            
            // 2. Dim irrelevant Gantt rows
            ganttRows.forEach(row => {
                const activeQs = row.getAttribute("data-active-quarters").split(",");
                if (selectedQ === "all" || activeQs.includes(selectedQ)) {
                    row.classList.remove("dimmed");
                } else {
                    row.classList.add("dimmed");
                }
            });
            
            // 3. Update Milestone display details
            const brief = milestoneBriefs[selectedQ];
            if (brief && milestoneTitle) {
                // Smooth fade transition
                milestoneBox.style.opacity = "0";
                milestoneBox.style.transform = "scale(0.98)";
                
                setTimeout(() => {
                    milestoneTitle.innerHTML = brief.title;
                    milestoneDesc.innerHTML = brief.desc;
                    milestoneBox.style.opacity = "1";
                    milestoneBox.style.transform = "scale(1)";
                }, 200);
            }
        });
    });

    // ---------------------------------------------------------
    // 7. Executive AI Business Case PDF Exporter (v1.3 Upgrade)
    // ---------------------------------------------------------
    const btnExportPdf = document.getElementById("btn-export-pdf");
    if (btnExportPdf) {
        btnExportPdf.addEventListener("click", () => {
            // Retrieve dynamic simulator values
            const teamSize = document.getElementById("team-size").value;
            const hourlyRate = document.getElementById("hourly-rate").value;
            const automationRate = document.getElementById("automation-rate").value;
            
            const hoursSaved = document.getElementById("kpi-hours-saved").textContent;
            const netSavings = document.getElementById("kpi-net-savings").textContent;
            const productivity = document.getElementById("kpi-productivity").textContent;
            const breakeven = document.getElementById("kpi-breakeven").textContent;
            
            // Generate reps capacity equivalent
            const monthlyWorkHours = 160;
            const hoursSavedNum = parseInt(hoursSaved.replace(/,/g, '')) || 0;
            const repsEquivalent = Math.round(hoursSavedNum / monthlyWorkHours);
            
            // Retrieve dynamic roadmap statuses
            const seattleStatusSelect = document.querySelector('.gantt-status-select[data-initiative="seattle"]');
            const sfStatusSelect = document.querySelector('.gantt-status-select[data-initiative="sf"]');
            const chicagoStatusSelect = document.querySelector('.gantt-status-select[data-initiative="chicago"]');
            const austinStatusSelect = document.querySelector('.gantt-status-select[data-initiative="austin"]');
            
            const seattleStatus = seattleStatusSelect ? seattleStatusSelect.options[seattleStatusSelect.selectedIndex].text : "Live / Active";
            const sfStatus = sfStatusSelect ? sfStatusSelect.options[sfStatusSelect.selectedIndex].text : "Testing";
            const chicagoStatus = chicagoStatusSelect ? chicagoStatusSelect.options[chicagoStatusSelect.selectedIndex].text : "Development";
            const austinStatus = austinStatusSelect ? austinStatusSelect.options[austinStatusSelect.selectedIndex].text : "Planning";

            const seattleRaw = seattleStatusSelect ? seattleStatusSelect.value : "live";
            const sfRaw = sfStatusSelect ? sfStatusSelect.value : "testing";
            const chicagoRaw = chicagoStatusSelect ? chicagoStatusSelect.value : "development";
            const austinRaw = austinStatusSelect ? austinStatusSelect.value : "planning";
            
            // Calculate active map velocities based on slider
            const autoPercent = parseInt(automationRate) || 10;
            const seattleVel = Math.min(95, Math.round(8 + autoPercent)).toFixed(1);
            const sfVel = Math.min(98, Math.round(30 + autoPercent * 3)).toFixed(1);
            const chicagoVel = Math.round(80 + autoPercent * 17).toFixed(1);
            const austinVel = Math.min(95, Math.round(15 + autoPercent * 2.5)).toFixed(1);
            
            const isNegative = parseInt(netSavings.replace(/[^0-9-]/g, '')) < 0;
            
            const timestamp = new Date().toLocaleString("en-US", {
                timeZoneName: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
            
            const reportHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Executive Briefing - AItools Enterprise AI Adoption & ROI Scorecard</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #1e293b;
            background: #ffffff;
            margin: 0;
            padding: 40px;
            font-size: 11.5px;
            line-height: 1.5;
        }
        .header-container {
            border-bottom: 3px solid #1b365d;
            padding-bottom: 20px;
            margin-bottom: 24px;
        }
        .logo-block {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo-title {
            color: #1b365d;
            font-size: 22px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -0.5px;
        }
        .logo-tag {
            color: #4a777a;
            font-size: 11px;
            font-weight: 600;
            margin: 2px 0 0 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .meta-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-top: 16px;
            font-size: 10px;
            color: #64748b;
            background: #f8fafc;
            padding: 10px 16px;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
        }
        .meta-item strong {
            color: #0f172a;
        }
        h2 {
            color: #1b365d;
            font-size: 13px;
            font-weight: 700;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            margin: 24px 0 12px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 20px;
        }
        .kpi-box {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 14px;
            background: #f8fafc;
            text-align: center;
        }
        .kpi-box h3 {
            margin: 0;
            font-size: 18px;
            color: #1b365d;
            font-weight: 800;
        }
        .kpi-box span {
            font-size: 9px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 700;
            display: block;
            margin-top: 4px;
        }
        .narrative-box {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 12px 16px;
            color: #166534;
            font-size: 11.5px;
            margin-bottom: 24px;
            line-height: 1.6;
        }
        .narrative-box.negative {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #991b1b;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }
        th {
            background: #f1f5f9;
            color: #475569;
            text-align: left;
            padding: 8px 10px;
            font-weight: 700;
            border-bottom: 2px solid #cbd5e1;
            text-transform: uppercase;
            font-size: 9px;
        }
        td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
            font-size: 11px;
        }
        tr:nth-child(even) td {
            background: #fafafa;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            font-size: 9px;
            font-weight: 700;
            border-radius: 4px;
            text-transform: uppercase;
        }
        .badge-planning { background: #e2e8f0; color: #475569; }
        .badge-development { background: #dbeafe; color: #1e40af; }
        .badge-testing { background: #fef9c3; color: #854d0e; }
        .badge-live { background: #dcfce7; color: #166534; }
        
        .footer-note {
            margin-top: 40px;
            border-top: 1px solid #cbd5e1;
            padding-top: 12px;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #94a3b8;
        }
        .sig-block {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 60px;
            margin-top: 40px;
            page-break-inside: avoid;
        }
        .sig-line {
            border-top: 1px solid #475569;
            margin-top: 40px;
            padding-top: 6px;
            font-size: 10px;
            color: #475569;
        }
        @media print {
            body { padding: 0; }
            .no-print { display: none; }
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="header-container">
        <div class="logo-block">
            <div>
                <h1 class="logo-title"><i class="fa-solid fa-brain"></i> AItools</h1>
                <p class="logo-tag">Enterprise AI Strategy Brief & ROI Scorecard</p>
            </div>
            <div style="text-align: right;">
                <span class="badge badge-live" style="font-size: 10px; padding: 4px 8px;">CONFIDENTIAL - EXECUTIVE DIRECTIVE</span>
            </div>
        </div>
        
        <div class="meta-grid">
            <div class="meta-item">
                Prepared By: <strong>Saurabh Shidhore</strong><br/>
                Role: <strong>AI & BI Operations Lead</strong>
            </div>
            <div class="meta-item">
                Date: <strong>${timestamp}</strong><br/>
                Framework Version: <strong>v1.3</strong>
            </div>
            <div class="meta-item" style="text-align: right;">
                Enterprise Sandbox: <strong>ZDR API Enabled</strong><br/>
                Model Gateways: <strong>Claude / Llama / GPT</strong>
            </div>
        </div>
    </div>

    <h2>1. Executive Summary & Financial Analysis</h2>
    <div class="kpi-grid">
        <div class="kpi-box">
            <h3>${hoursSaved} hrs</h3>
            <span>Hours Automated /mo</span>
        </div>
        <div class="kpi-box">
            <h3 style="color: ${isNegative ? '#991b1b' : '#166534'};">${netSavings}</h3>
            <span>Net Monthly Savings</span>
        </div>
        <div class="kpi-box">
            <h3>${productivity}</h3>
            <span>Productivity Gain</span>
        </div>
        <div class="kpi-box">
            <h3>${breakeven}</h3>
            <span>Payback Horizon</span>
        </div>
    </div>

    <div class="narrative-box ${isNegative ? 'negative' : ''}">
        <strong>Operational Assessment:</strong> 
        ${isNegative 
            ? `Your subscription tool costs currently exceed estimated labor savings. To achieve positive operational ROI, recommend targeting tasks with higher complexity or reducing subscription fees.`
            : `Implementing AI prompts across a team of <strong>${teamSize} reps</strong> (at an average blended rate of <strong>$${hourlyRate}/hr</strong> and an automation rate of <strong>${automationRate}%</strong>) generates a labor capacity equivalent to adding <strong>${repsEquivalent} full-time operator(s)</strong> to your squad—fully paid off in <strong>${breakeven}</strong>.`
        }
    </div>

    <h2>2. Regional AI Node Telemetry & Deployment Map</h2>
    <table style="width: 100%;">
        <thead>
            <tr>
                <th>Active Hub</th>
                <th>Specialized Focus</th>
                <th>Model Integration</th>
                <th>Operational Velocity</th>
                <th>Allocated ROI Weight</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Seattle Hub</strong></td>
                <td>Supply Chain & Port Rerouting</td>
                <td>Llama-3-Agent (${seattleStatus.replace(/^\d+\.\s*/, '')})</td>
                <td>↓ ${seattleVel}% shipping delay</td>
                <td>20% ($${window.globalNetSavings > 0 ? Math.round(window.globalNetSavings * 0.20).toLocaleString() : 0} /mo)</td>
            </tr>
            <tr>
                <td><strong>San Francisco</strong></td>
                <td>Product Strategy & JTBD Synthesizer</td>
                <td>Claude-3.5-Sonnet (${sfStatus.replace(/^\d+\.\s*/, '')})</td>
                <td>↓ ${sfVel}% discovery lag</td>
                <td>40% ($${window.globalNetSavings > 0 ? Math.round(window.globalNetSavings * 0.40).toLocaleString() : 0} /mo)</td>
            </tr>
            <tr>
                <td><strong>Chicago Node</strong></td>
                <td>Agile Backlog Story splitting</td>
                <td>Llama-3-70B (${chicagoStatus.replace(/^\d+\.\s*/, '')})</td>
                <td>↑ ${chicagoVel}% sprint readiness</td>
                <td>25% ($${window.globalNetSavings > 0 ? Math.round(window.globalNetSavings * 0.25).toLocaleString() : 0} /mo)</td>
            </tr>
            <tr>
                <td><strong>Austin Node</strong></td>
                <td>Software Refactoring & Scaling</td>
                <td>GPT-4o-Coder (${austinStatus.replace(/^\d+\.\s*/, '')})</td>
                <td>↓ ${austinVel}% code review lag</td>
                <td>15% ($${window.globalNetSavings > 0 ? Math.round(window.globalNetSavings * 0.15).toLocaleString() : 0} /mo)</td>
            </tr>
        </tbody>
    </table>

    <h2>3. Implementation Roadmap & Milestones</h2>
    <table style="width: 100%;">
        <thead>
            <tr>
                <th>Initiative</th>
                <th>Geographic Node</th>
                <th>Assigned Owner</th>
                <th>Project Status</th>
                <th>Target Timeline</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Automated Port Rerouting Engine</strong></td>
                <td>Seattle Gateway</td>
                <td>Supply Chain Analyst</td>
                <td><span class="badge badge-${seattleRaw}">${seattleStatus.replace(/^\d+\.\s*/, '')}</span></td>
                <td>Q1 (Planning) - Q2 (Live)</td>
            </tr>
            <tr>
                <td><strong>JTBD Feature Intelligence Portal</strong></td>
                <td>San Francisco</td>
                <td>Product Owner</td>
                <td><span class="badge badge-${sfRaw}">${sfStatus.replace(/^\d+\.\s*/, '')}</span></td>
                <td>Q1 (Infra) - Q3 (Testing)</td>
            </tr>
            <tr>
                <td><strong>Agile Backlog & Story Splitter</strong></td>
                <td>Chicago Node</td>
                <td>Project Manager</td>
                <td><span class="badge badge-${chicagoRaw}">${chicagoStatus.replace(/^\d+\.\s*/, '')}</span></td>
                <td>Q2 (Dev) - Q3 (Testing)</td>
            </tr>
            <tr>
                <td><strong>Database Query Complexity Auditor</strong></td>
                <td>Austin Node</td>
                <td>Software Engineer</td>
                <td><span class="badge badge-${austinRaw}">${austinStatus.replace(/^\d+\.\s*/, '')}</span></td>
                <td>Q3 (Dev) - Q4 (Launch)</td>
            </tr>
        </tbody>
    </table>

    <h2>4. Enterprise AI Governance Guidelines</h2>
    <div style="font-size: 10px; color: #475569; border-left: 2px dashed #1b365d; padding-left: 14px; margin-bottom: 24px;">
        <strong>Zero Data Retention (ZDR) Directive:</strong> All unmasked corporate records must execute unmasked PII filters locally before API ingestion.
        Enterprise models are subject to strict SOC-2 Type II evaluations. Regional outputs are audited periodically to suppress hallucination rates below a 0.05% threshold.
    </div>

    <div class="sig-block">
        <div>
            <div class="sig-line">Prepared & Audited By:</div>
            <strong>Saurabh Shidhore</strong><br/>
            AI & BI Operations Lead, AItools
        </div>
        <div>
            <div class="sig-line">Authorization & VP Approval:</div>
            Operations Handoff Committee Sign-off
        </div>
    </div>

    <div class="footer-note">
        <span>Report Generated: ${new Date().toLocaleDateString()}</span>
        <span>AItools-guru © 2026</span>
    </div>

    <script>
        // Auto trigger window print dialog immediately on render
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 300);
        }
    </script>
</body>
</html>
            `;
            
            // Create print window and write the compiled report
            const printWindow = window.open("", "_blank");
            if (printWindow) {
                printWindow.document.write(reportHTML);
                printWindow.document.close();
            } else {
                alert("Popup blocker active! Please allow popups to export the AI Business Case Brief.");
            }
        });
    }

    // Initialize with default role (Supply Chain)
    updatePromptView("supply-chain");
});
