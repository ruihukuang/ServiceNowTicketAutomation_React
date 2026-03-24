# ServiceNowTicketAutomation_React


This website has four pages. 

The initial page manages ServiceNow record entry and updates. Although the ServiceNow API can retrieve all fields except for Team Fixed Issue, the current implementation relies entirely on manual data entry.

![Alt text](/React/data_entry_management.png)

The second page invokes a .NET service to process pending records using either rule-based automation or an Ollama-hosted LLM. The interface enables manual validation of AI-generated insights—specifically System, Root Cause, Short Summary, and Duplicate Identification—for each new ServiceNow incident ticket. Once reviewed, the finalized data is sent to the database via the .NET backend.

This interface follows a strictly sequential workflow. Each stage requires manual oversight to ensure data integrity. Users must confirm the outputs of each step (such as reviewing AI-generated summaries or identifying duplicates) before the system permits progression to the subsequent stage.

![Alt text](/React/Data_Process.png)

The third page invokes a .NET service to reprocess existing records using either rule-based automation or an Ollama-hosted LLM. The interface enables manual validation of AI-generated insights—specifically System, Root Cause, Short Summary, and Duplicate Identification—for each existing processed ServiceNow incident ticket. Once reviewed, the finalized data is sent to the database via the .NET backend.

![Alt text](/React/Old_Data_Process.png)

The final page is an analytics dashboard designed for Project Managers who are usually service owners of multiple systems/platforms to monitor incident lifecycles across specific timeframes (months/years). Key metrics include SLA performance, system failure points, and duplicate ticket identification. The dashboard also visualizes responsibility mapping and resolution outcomes for assigned teams to optimize operational workflows. The provided screenshots demonstrate the dashboard interface populated with data from two sample database records.

![Alt text](/React/dashboard-1.png)

![Alt text](/React/dashboard-2.png)
