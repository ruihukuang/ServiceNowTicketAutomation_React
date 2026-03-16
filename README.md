# ServiceNowTicketAutomation_React


This website has three pages. 

The initial interface facilitates record creation. While the system is designed to support automated retrieval via the ServiceNow API, the current implementation focuses on manual data entry.

![Alt text](/React/data_entry_management.png)

The second page invokes a .NET service to process pending records using either rule-based automation or an Ollama-hosted LLM. The interface enables manual validation of AI-generated insights—specifically System, Root Cause, Short Summary, and Duplicate Identification—for each ServiceNow incident ticket. Once reviewed, the finalized data is persisted to the database via the .NET backend.

![Alt text](/React/Data_Process.png)

The final page is an analytics dashboard designed for Project Managers to monitor incident lifecycles across specific timeframes (months/years). Key metrics include SLA performance, system failure points, and duplicate ticket identification. The dashboard also visualizes responsibility mapping and resolution outcomes for assigned teams to optimize operational workflows. The provided screenshots demonstrate the dashboard interface populated with data from two sample database records.

![Alt text](/React/dashboard-1.png)

![Alt text](/React/dashboard-2.png)