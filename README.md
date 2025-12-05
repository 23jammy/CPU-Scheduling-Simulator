# 🚀 CPU Scheduling Simulator

A responsive, web-based simulation tool designed to visualize various CPU scheduling algorithms.  
Built with **HTML**, **jQuery**, and **Tailwind CSS**, this tool provides real-time Gantt charts, detailed process metrics, and CPU utilization statistics.

---

## 📋 Table of Contents
- [Features](#-features)
- [Supported Algorithms](#-supported-algorithms)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
  - [Manual Input](#manual-input)
  - [CSV Import](#csv-import)
- [System Limits](#️-system-limits)
- [Tech Stack](#-tech-stack)
- [Theme Palette](#-theme-palette)

---

## ✨ Features
- **Interactive UI:** Pastel-themed interface with dark navy contrast for readability.  
- **Animated Gantt Chart:** Visualizes process execution flow with time markers.  
- **Comprehensive Metrics:** Calculates TAT, WT, CT, and CPU utilization.  
- **Dual Input Methods:** Manual input and CSV file upload supported.  
- **Responsive Design:** Optimized for desktop, tablet, and mobile (with horizontal timeline scrolling).  
- **Error Handling:** Validates negative numbers, invalid file formats, and respects system limits.

---

## 🧮 Supported Algorithms
### **First-Come, First-Served (FCFS)**
- Processes execute in arrival order.  
- Non-preemptive.

### **Shortest Job First (SJF)**
- Selects the process with the smallest burst time.  
- Non-preemptive.

### **Priority Scheduling (Non-Preemptive)**
- Selects the process with the highest priority  
  *(Lower number = Higher priority)*.

### **Priority Scheduling (Preemptive)**
- CPU switches if a new process arrives with a higher priority.

---

## 🚀 Getting Started
Since this project uses CDN-based libraries, **no installation or build process** is required.

### **Clone the repository**
```bash
git clone https://github.com/your-username/cpu-scheduler-sim.git
