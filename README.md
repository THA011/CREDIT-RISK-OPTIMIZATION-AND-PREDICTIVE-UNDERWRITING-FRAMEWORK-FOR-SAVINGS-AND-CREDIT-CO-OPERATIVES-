# Credit Risk Analytics Engine — Mwatha Maina  
> **Repository ID:** `Freelance.Analytics.Statistics_011`  
> **Core Focus:** Credit Risk Modeling, Statistical Automation, and Portfolio Exposure Analytics (Python, SPSS, R)

---

## 📌 Project Overview

This repository contains a complete **end‑to‑end credit risk analytics engine** designed for SACCOs, microfinance institutions, and retail lending environments.  
It automates:

- Data cleaning  
- Risk scoring  
- Probability of Default (PD) estimation  
- SASRA classification  
- Underwriting rule comparison  
- Portfolio exposure visualization  
- Executive dashboard generation  

All components run **locally**, with **no cloud dependencies**, ensuring full data privacy and offline operability.

---

## 🧠 System Architecture

[ Raw Loan Ledger / SPSS Outputs ]
│
▼
┌───────────────────────────────────────────────┐
│  credit_analytics_pipeline.py (Python Engine) │
└───────────────────────────┬───────────────────┘
│
▼
[ final_credit_risk_matrix.csv ]
│
▼
┌───────────────────────────────────────────────┐
│        dashboard.html + dashboard.js          │
│   (Local Interactive Credit Risk Dashboard)   │
└───────────────────────────────────────────────┘



---

## 📁 Repository Structure

| File | Purpose |
|------|---------|
| **dashboard.html** | Local interactive dashboard for visualizing credit risk outputs. |
| **dashboard.js** | Chart.js + PapaParse logic for rendering risk tiers, PD distribution, SASRA vs Underwriting, and Top‑Risk tables. |
| **credit_analytics_pipeline.py** | Core Python engine generating cleaned datasets, PD scores, and risk classifications. |
| **cleaned_credit_matrix.csv** | Standardized dataset after preprocessing. |
| **final_credit_risk_matrix.csv** | Final merged dataset consumed by the dashboard. |
| **portfolio_risk_exposure.png** | High‑resolution visualization of portfolio exposure. |
| **run_analysis.bat** | One‑click execution script for running the full analytics pipeline. |
| **index.html** | Portfolio homepage (optional). |
| **viewer.html** | Legacy file (not used in local‑only mode). |

---

## ⚙️ Running the Analytics Engine

### **1. Run the Python Pipeline**
This generates all required datasets and plots:

```bash
run_analysis.bat
