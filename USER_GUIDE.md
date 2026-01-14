# AI Team Tracker - User Guide

## 📱 Overview

The **AI Team Tracker** is a comprehensive team management and skill tracking application designed to monitor team member activities, skills, and AI portfolio progress. It provides real-time visibility into team capacity, skills development, and project engagements.

**Live App:** https://ai-team-tracker.vercel.app/dashboard

---

## 🚀 Getting Started

### Accessing the App
1. Open the URL: https://ai-team-tracker.vercel.app/dashboard
2. You'll see the main dashboard with all team members
3. Click on any team member to view their detailed profile
4. No login required - the app is in supervisor mode

---

## 📊 Main Dashboard

The dashboard shows a grid of all team members with:
- **Member Name** - Full name of the team member
- **Role Title** - Current job title/position
- **Quick Stats** - Overview of their projects and engagements
- **Click to View** - Opens detailed member profile

---

## 👤 Team Member Profile

Each team member has a detailed profile with multiple tabs:

### 1. **Overview Tab**
The main snapshot of a team member including:
- **Basic Info** - Name, role, contact info
- **Current Engagements** - What clients/projects they're allocated to
- **Allocation %** - How much time they're spending on each engagement
- **Current Projects** - Active projects they're working on
- **Upcoming Events** - Meetings, conferences, training

### 2. **Skills Tab**
Tracks technical and professional skills:
- **Skill Name** - The skill (e.g., Python, Machine Learning, Project Management)
- **Proficiency Level** - Rated from 1-5 stars
- **Status** - Whether the skill is growing, stable, or declining
- **Last Updated** - When the rating was last reviewed

**How to Use:**
- Click "Edit Skills" to add or update skills
- Use stars to rate proficiency (1=Beginner, 5=Expert)
- Update regularly to track skill development

### 3. **Tools Tab**
Tracks AI tools and platforms the team uses:
- **Tool Name** - Name of the AI tool (e.g., ChatGPT, Claude, Midjourney)
- **Category** - Type of tool (Chat, Image Generation, Code, etc.)
- **Proficiency** - How well the member can use it (1-5 stars)
- **Frequency** - How often they use it

**Use Cases:**
- Track which AI tools your team is skilled with
- Identify training gaps
- Know who to ask for help with specific tools

### 4. **Portfolio Tab**
Shows how team members are involved in different AI portfolio categories:

**Portfolio Categories:**
- **EKA** - Emerging Knowledge Areas (exploring new technologies)
- **AGT** - Advanced GenAI Technologies (advanced AI/LLM work)
- **TQA** - Technology Quality Assurance (testing, validation, QA)
- **DMI** - Data Management & Integration (data pipelines, ETL)
- **PADS** - Platform Architecture & Design Systems (system design)

**Rating Scale:**
- **0** - No involvement
- **1** - Minimal/Beginner level
- **2** - Basic/Intermediate
- **3** - Competent/Advanced
- **4** - Expert/Lead
- **5** - Thought Leader

**Use This To:**
- Identify who are the experts in each technology area
- Plan team composition for projects
- Identify skill gaps
- Succession planning

### 5. **Awareness Tab**
Tracks awareness and knowledge in different AI areas:
- **Area** - Topic area (Machine Learning Fundamentals, Ethics, etc.)
- **Rating** - How aware/knowledgeable (1-5 scale)
- **Notes** - Additional context

**Use This To:**
- Ensure team has broad AI knowledge
- Plan training and development
- Track awareness improvements

### 6. **Projects Tab**
Lists all projects the team member is working on:
- **Project Name** - Name of the project
- **Type** - AI Use Case, Community Center, Initiative, etc.
- **Source** - Where the project comes from
- **Status** - Active or Completed
- **Reusable** - Can components be reused

**View Details:**
- Click a project to see more info
- Edit to update status or details
- Delete completed projects

### 7. **Engagements Tab**
Shows time allocations to different clients/departments:
- **Client Name** - Who they're working for
- **Allocation %** - Percentage of time allocated
- **Start Date** - When the engagement started
- **End Date** - When it ends (if applicable)

**Key Insight:** All percentages should add up to ~100% (100% = full time allocation)

**Use This To:**
- See current workload distribution
- Identify overallocation issues
- Plan team capacity

### 8. **Time Off Tab**
Tracks vacation, sick leave, and other time off:
- **Type** - Vacation, Sick Leave, Conference, Personal, Other
- **Dates** - When they'll be away
- **Notes** - Any additional details

**Why It Matters:**
- Plan project timelines knowing who's available
- Ensure adequate coverage
- Plan team events around availability

### 9. **Events Tab**
Team events, conferences, and training:
- **Event Name** - What's happening
- **Type** - Conference, Training, Team Meeting, etc.
- **Date** - When it happens
- **Topic** - What it's about

**Use Cases:**
- Track conference attendance
- Manage team training calendar
- Plan team development activities

### 10. **Calendar Tab**
Visual calendar view of:
- Time off
- Events
- Key dates

**Benefits:**
- Quick visual check of team availability
- Identify scheduling conflicts
- Plan around busy periods

---

## 🛠️ How to Edit Data

### Adding/Editing Information

1. **Click "Edit" or the pencil icon** on any section
2. **Fill in the details** in the modal dialog
3. **Click "Save"** to update
4. Changes are saved immediately to the database

### Common Editing Tasks

**Update Skills:**
- Overview Tab → Skills section → Click "Edit Skills"
- Add new skill or rate existing ones
- Save when done

**Add a Project:**
- Projects Tab → Click "Add Project"
- Fill in project details
- Save to add to the member's profile

**Record Time Off:**
- Time Off Tab → Click "Add Time Off"
- Select type (Vacation, Sick Leave, etc.)
- Enter dates and save

---

## 📈 Understanding the Metrics

### Star Ratings (1-5)
Used throughout the app:
- ⭐ 1 Star - Beginner / Just learning
- ⭐⭐ 2 Stars - Basic / Some experience
- ⭐⭐⭐ 3 Stars - Competent / Regular user
- ⭐⭐⭐⭐ 4 Stars - Advanced / Expert
- ⭐⭐⭐⭐⭐ 5 Stars - Master / Thought leader

### Allocation Percentages
- Shows how much time someone is spending on each engagement
- **Total should equal ~100%** for full-time team members
- Helps identify overallocation or underutilization

---

## 🎯 Common Use Cases

### 1. Planning a New Project
1. Go to Team Dashboard
2. Look at Skills Tab to find people with needed expertise
3. Check Portfolio ratings for specialists in required areas
4. Review Engagements to see current allocation
5. Check Calendar for availability
6. Assign team members with capacity

### 2. Training & Development
1. Review Awareness Tab to identify knowledge gaps
2. Look at Skills ratings to see proficiency levels
3. Identify who needs training in new AI tools
4. Schedule training events in Events Tab

### 3. Resource Planning
1. View Engagements Tab to see current allocations
2. Look at upcoming Time Off
3. Cross-reference with Calendar
4. Make informed decisions about capacity

### 4. Succession Planning
1. Review Portfolio ratings by area
2. Identify experts (4-5 stars)
3. Identify gaps (0-1 stars)
4. Plan knowledge transfer from experts to others

---

## 💾 Data Safety

- **No Login Required** - App is in supervisor mode for easy sharing
- **Automatic Saves** - All changes are saved immediately
- **Database Backed** - Data is stored securely in Supabase cloud
- **No Backups Needed** - Data persists across sessions

---

## 🔄 Maintaining Data Accuracy

### Regular Updates Recommended:
- **Monthly** - Update project status, time allocations
- **Quarterly** - Review and update skills ratings
- **As Needed** - Add new projects, time off, events
- **Quarterly** - Review awareness and portfolio ratings

---

## 📌 Tips & Tricks

1. **Use Filters** - Many sections have filters to show/hide data
2. **Export to CSV** - Projects and other lists can be exported
3. **Print Reports** - Use browser print function for reports
4. **Mobile Friendly** - Works on phones and tablets
5. **Real-time Updates** - Changes appear instantly for all viewers

---

## ❓ FAQ

**Q: Can I edit someone else's data?**
A: Yes, in supervisor mode everyone can edit everything. Consider password protection if you want to restrict access.

**Q: How do I add a new team member?**
A: Currently, you need to add them via the Team Dashboard "Add Member" button.

**Q: Can I export reports?**
A: Yes, most sections support CSV export. Look for the export button.

**Q: Is the app mobile-friendly?**
A: Yes, the app is fully responsive and works on phones, tablets, and desktops.

**Q: What happens if I delete something?**
A: Deletions are permanent. Be careful when deleting projects or team members.

---

## 📞 Support

For questions or issues with the app, contact the development team.

**Current Version:** 1.0  
**Last Updated:** January 2026

---

**Happy tracking! 🚀**
