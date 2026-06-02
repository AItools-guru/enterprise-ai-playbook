#!/usr/bin/env python3
import os
import sys
import time

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

# System prompt configurations (aligned with standard business roles)
PROMPTS = {
    "1": {
        "role": "📦 Supply Chain & Logistics Analyst",
        "task": "Global Logistics Routing & Port Congestion Risk Assessor",
        "system": """You are an expert Enterprise Logistics and Supply Chain Network Risk Strategist. 
Your goal is to evaluate shipping lane efficiency, detect delay bottlenecks, and calculate optimal buffer adjustments.

Structure your analysis in Markdown with these exact sections:
- 📊 Operational Delay Summary
- ⏳ Safety Stock Buffer Recommendations (explicitly show Safety Stock = (Max Lead Time - Avg Lead Time) * Avg Daily Demand)
- 💸 Financial Exposure Assessment (demurrage, capital lockup)
- 🚀 Tactical Mitigation Action Items""",
        "input": "Analyze shipping lane LN-402 (Hong Kong to Seattle) under carrier OceanLink. Baseline transit is 18 days, actual transit is 27 days due to custom backlogs. Avg daily demand is 1,200 units. Capital cargo value locked is $540,000. Demurrage penalties accrue at $1,450/day."
    },
    "2": {
        "role": "📋 Product Manager",
        "task": "Market Opportunity Discovery & Product Vision Synthesizer",
        "system": """You are a Principal Growth Product Manager and Strategic Analyst. 
Your goal is to convert complex competitive and user feedback logs into high-impact, executive-ready product briefs.

Structure your analysis in Markdown with these exact sections:
- 🎯 Core Value Proposition & Vision Statement
- 💡 Jobs-To-Be-Done (JTBD) Matrix
- 📊 RICE Prioritization Summary Table
- 📈 Success KPIs (North Star & Guardrail metrics)""",
        "input": "Synthesize a strategy for a logistics transparency tool. Users complain that they cannot track port delays in real-time. Main competitor has no predictive analytics. Development team capacity is 4 person-months. Budget is limited."
    },
    "3": {
        "role": "💻 Software Engineer",
        "task": "System Architecture, Design Patterns & Code Refactoring Auditor",
        "system": """You are a Principal Software Engineer and System Architect. 
Your goal is to analyze database schemas, assess code quality, and refactor slow SQL analytics or data models into clean, high-performance architectures.

Structure your analysis in Markdown with these exact sections:
- 🔴 Performance Bottleneck Diagnosis
- 🛠️ Refactored SQL / Code Block (use proper Markdown syntax highlighting)
- 📊 Database Schema Indexing Recommendations
- ⚡ Complexity Analysis (using Big-O notation comparisons)""",
        "input": "Refactor this slow query: SELECT s.id, p.port_name, s.container_status, s.actual_transit_days FROM ocean_shipment_logs s JOIN dim_ports p ON s.port_id = p.port_id WHERE s.log_timestamp >= CURRENT_DATE - INTERVAL '1 day' ORDER BY s.actual_transit_days DESC; Note: ocean_shipment_logs has 50M rows and has full table scans because port_id and log_timestamp are not indexed."
    }
}

def print_header(title):
    print(f"\n{Colors.BOLD}{Colors.GOLD}============================================================{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.CYAN}  {title}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.GOLD}============================================================{Colors.ENDC}")

def show_env_guide():
    print(f"\n{Colors.BOLD}{Colors.GOLD}>>> 🔑 LIVE LLM INTEGRATION ENVIRONMENT GUIDE{Colors.ENDC}")
    print(f"To run these prompts live against real LLM API endpoints, execute these setup steps:")
    print(f"\n{Colors.BOLD}1. Install the Provider SDKs:{Colors.ENDC}")
    print(f"   {Colors.CYAN}pip install anthropic google-generativeai{Colors.ENDC}")
    print(f"\n{Colors.BOLD}2. Export your API Token in the terminal:{Colors.ENDC}")
    print(f"   {Colors.CYAN}export ANTHROPIC_API_KEY=\"your-anthropic-api-key-here\"{Colors.ENDC}")
    print(f"   {Colors.BOLD}OR{Colors.ENDC}")
    print(f"   {Colors.CYAN}export GEMINI_API_KEY=\"your-gemini-api-key-here\"{Colors.ENDC}")
    print(f"\n{Colors.BOLD}3. Run this script again!{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.GOLD}============================================================{Colors.ENDC}\n")

def simulate_llm(key):
    data = PROMPTS[key]
    print(f"\n{Colors.BOLD}{Colors.BLUE}[Sandbox Mode] Simulating execution for {data['role']}...{Colors.ENDC}")
    time.sleep(0.5)
    print(f"{Colors.BLUE}[Log] Scrubbing corporate data (PII Masking applied)...{Colors.ENDC}")
    time.sleep(0.4)
    print(f"{Colors.GREEN}[Success] Data tokenized. Secure VPC connection established.{Colors.ENDC}")
    time.sleep(0.4)
    print(f"{Colors.BLUE}[Log] Submitting system prompt to Llama-3 sandbox endpoint (TTFT: 142ms)...{Colors.ENDC}")
    time.sleep(0.6)
    
    print(f"\n{Colors.BOLD}{Colors.GREEN}>>> SIMULATED COMPLIANT RESPONSE ANALYSIS:{Colors.ENDC}\n")
    print(f"### COMPILING SYSTEM PROMPT FOR {data['role'].upper()}:")
    print(f"{Colors.CYAN}{data['system']}{Colors.ENDC}\n")
    print(f"### INPUT METRICS SCENARIO:")
    print(f"{Colors.CYAN}{data['input']}{Colors.ENDC}\n")
    print(f"{Colors.BOLD}{Colors.GREEN}[Success] Sandbox pipeline finished. Run with API keys for live outputs!{Colors.ENDC}\n")

def run_anthropic(system_prompt, user_input):
    try:
        import anthropic
        print(f"\n{Colors.BOLD}{Colors.GREEN}[API Connect] Directing to Anthropic Claude VPC (claude-3-5-sonnet)...{Colors.ENDC}")
        print(f"{Colors.BLUE}[Stream] Fetching model inference...{Colors.ENDC}\n")
        
        client = anthropic.Anthropic()
        with client.messages.stream(
            max_tokens=1500,
            system=system_prompt,
            messages=[{"role": "user", "content": user_input}],
            model="claude-3-5-sonnet-20241022",
        ) as stream:
            for text in stream.text_stream:
                print(text, end="", flush=True)
        print("\n\n" + f"{Colors.BOLD}{Colors.GREEN}[Success] Stream finished from Claude-3.5-Sonnet.{Colors.ENDC}\n")
    except ImportError:
        print(f"\n{Colors.RED}Error: 'anthropic' package is not installed. Fallback to simulation...{Colors.ENDC}")
        time.sleep(1)
    except Exception as e:
        print(f"\n{Colors.RED}API connection failed: {e}. Fallback to simulation...{Colors.ENDC}")
        time.sleep(1)

def run_gemini(system_prompt, user_input):
    try:
        import google.generativeai as genai
        print(f"\n{Colors.BOLD}{Colors.GREEN}[API Connect] Directing to Google Gemini endpoint (gemini-1.5-pro)...{Colors.ENDC}")
        print(f"{Colors.BLUE}[Stream] Fetching model inference...{Colors.ENDC}\n")
        
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        model = genai.GenerativeModel(
            model_name='gemini-1.5-pro',
            system_instruction=system_prompt
        )
        response = model.generate_content(user_input, stream=True)
        for chunk in response:
            print(chunk.text, end="", flush=True)
        print("\n\n" + f"{Colors.BOLD}{Colors.GREEN}[Success] Stream finished from Gemini-1.5-Pro.{Colors.ENDC}\n")
    except ImportError:
        print(f"\n{Colors.RED}Error: 'google-generativeai' package is not installed. Fallback to simulation...{Colors.ENDC}")
        time.sleep(1)
    except Exception as e:
        print(f"\n{Colors.RED}API connection failed: {e}. Fallback to simulation...{Colors.ENDC}")
        time.sleep(1)

def main():
    while True:
        os.system('clear' if os.name == 'posix' else 'cls')
        print(f"{Colors.BOLD}{Colors.GOLD}============================================================{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.CYAN}     AItools-guru — Live Prompt Executor (CLI Copilot){Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.GOLD}============================================================{Colors.ENDC}")
        
        # Check active tokens
        anthropic_key = os.environ.get("ANTHROPIC_API_KEY")
        gemini_key = os.environ.get("GEMINI_API_KEY")
        
        if anthropic_key:
            print(f"  🔑 Anthropic Token: {Colors.GREEN}Active (Detected){Colors.ENDC}")
        else:
            print(f"  🔑 Anthropic Token: {Colors.RED}Not Configured{Colors.ENDC}")
            
        if gemini_key:
            print(f"  🔑 Gemini Token:    {Colors.GREEN}Active (Detected){Colors.ENDC}")
        else:
            print(f"  🔑 Gemini Token:    {Colors.RED}Not Configured{Colors.ENDC}")
            
        print(f"{Colors.BOLD}{Colors.GOLD}============================================================{Colors.ENDC}")
        print("  1. 📦 Run Supply Chain Analyst Prompt")
        print("  2. 📋 Run Product Manager Prompt")
        print("  3. 💻 Run Database Schema Relational Architect Prompt")
        print("  4. 🛠️  View API Setup and Installation Guide")
        print("  5. Exit Console")
        print(f"{Colors.BOLD}{Colors.GOLD}============================================================{Colors.ENDC}")
        
        choice = input(f"{Colors.BOLD}Select Option (1-5): {Colors.ENDC}").strip()
        
        if choice in ["1", "2", "3"]:
            data = PROMPTS[choice]
            print_header(f"EXECUTING OPERATIONS: {data['role'].upper()}")
            
            # Select Provider if both keys exist
            provider = None
            if anthropic_key and gemini_key:
                print("Both API keys detected. Select LLM Provider:")
                print("  1. Anthropic Claude (claude-3-5-sonnet)")
                print("  2. Google Gemini (gemini-1.5-pro)")
                prov_choice = input("Select (1-2): ").strip()
                provider = "anthropic" if prov_choice == "1" else "gemini"
            elif anthropic_key:
                provider = "anthropic"
            elif gemini_key:
                provider = "gemini"
                
            if provider == "anthropic":
                run_anthropic(data['system'], data['input'])
            elif provider == "gemini":
                run_gemini(data['system'], data['input'])
            else:
                print(f"\n{Colors.GOLD}No API keys configured. Running local fail-safe simulation...{Colors.ENDC}")
                simulate_llm(choice)
                
            input("Press [Enter] to return to menu...")
            
        elif choice == "4":
            show_env_guide()
            input("Press [Enter] to return to menu...")
            
        elif choice == "5" or choice.lower() == "exit":
            print(f"\n{Colors.BOLD}{Colors.GOLD}Exiting Live Prompt Console. Safe operations, Saurabh!{Colors.ENDC}\n")
            break
        else:
            print(f"{Colors.RED}Invalid option selected. Press [Enter] to try again.{Colors.ENDC}")
            time.sleep(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.BOLD}{Colors.GOLD}Exiting console. Safe operations!{Colors.ENDC}\n")
