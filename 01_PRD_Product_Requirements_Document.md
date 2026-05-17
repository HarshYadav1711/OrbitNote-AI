# OrbitNote AI — Product Requirements Document (PRD)

## Overview
OrbitNote AI is a production-minded AI-powered notes workspace focused on helping users capture, organize, summarize, and share information efficiently.

The product combines a modern note-taking experience with integrated AI workflows including:
- AI summaries
- Action item extraction
- Suggested titles
- Smart tagging

The application is intentionally scoped to prioritize:
- Product cohesiveness
- Strong UX
- Reliable architecture
- Maintainable code quality
- Thoughtful AI integration

---

## Problem Statement

Most note-taking tools either:
- act as passive storage systems, or
- integrate AI in a superficial way.

Users often struggle to:
- summarize long notes,
- extract actionable tasks,
- organize information,
- quickly rediscover knowledge,
- share information cleanly.

OrbitNote AI addresses these issues by turning notes into structured, actionable knowledge.

---

## Product Goals

### Primary Goals
- Deliver a polished end-to-end full-stack application
- Integrate AI meaningfully into workflows
- Maintain fast and intuitive UX
- Demonstrate scalable engineering architecture
- Provide a clean review experience for evaluators

### Non-Goals
- Real-time collaboration
- Enterprise permission systems
- Mobile applications
- Complex social functionality
- AI chatbots unrelated to note workflows

---

## Target Users

### Primary Users
- Students
- Developers
- Researchers
- Productivity-focused users
- Knowledge workers

---

## Core Features

### Authentication
- Signup
- Login
- Logout
- Protected routes
- Persistent sessions

### Notes Workspace
- Create notes
- Edit notes
- Autosave
- Archive notes
- Tags and categories
- Markdown support

### AI Workflows
- AI summaries
- Action item extraction
- Suggested titles
- Smart tags

### Search & Filtering
- Keyword search
- Tag filtering
- Sort by recent activity

### Public Sharing
- Public share links
- Read-only note view
- Visibility control

### Dashboard
- Total notes
- Recently edited notes
- AI usage metrics
- Weekly activity summaries

---

## Success Metrics

### Product Metrics
- Smooth note creation workflow
- Fast autosave feedback
- Low UI latency
- Consistent AI output formatting
- Stable public sharing flow

### Engineering Metrics
- Clean modular architecture
- Reliable API responses
- Easy local setup
- Minimal runtime errors

---

## UX Principles
- Minimal friction
- Fast interactions
- Clear system feedback
- Predictable AI behavior
- Clean visual hierarchy

---

## Risks
- AI latency
- Inconsistent AI output
- Overengineering
- Scope creep

---

## Mitigation Strategy
- Use structured prompts
- Add deterministic fallbacks
- Keep architecture modular
- Maintain disciplined feature scope