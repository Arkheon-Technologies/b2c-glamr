# GLAMR — Product Requirements Document (PRD)

> **Document Version**: 1.0
> **Platform Name**: GLAMR
> **Tagline**: *The Operating System for Beauty Professionals*

---

## 1. Executive Summary

**GLAMR** is a multi-sided appointment and booking marketplace purpose-built for the beauty and aesthetics industry. It is designed to be the complete operating system for beauty professionals and studios of all sizes — from a solo lash artist working from a home studio to a multi-location salon chain with 50+ technicians.

Unlike generic scheduling tools (Calendly, Acuity) or horizontally-positioned competitors (Fresha, Booksy) that treat beauty as one of many categories, GLAMR is architecturally engineered around the operational reality of beauty businesses. Every scheduling algorithm, data model, and UX flow accounts for what makes beauty services fundamentally different: split-phase appointments with processing time, patch test prerequisites, technician portfolio-driven bookings, session-based package selling, resource-constrained multi-booking, and the deep personal relationship between client and artist.

---

## 2. Problem & Opportunity Statement

### 2.1 The Problem — Beauty Business Side
- **Fragmented Scheduling**: A hair colorist's appointment isn't a simple 60-minute block — it's 20 min application + 35 min processing (client waits, stylist is free) + 15 min rinse and style.
- **No-Show Economics**: Average no-show rate in beauty services sits at 18–22%. No tools gracefully handle deposits without high friction.
- **Client Retention**: 72% of independent beauty professionals still manage bookings via WhatsApp, Instagram DMs, or paper diaries.
- **Intake Burden**: Medical aesthetics (Botox, fillers), laser treatment require legally mandated intake forms and signed consent documents. Most businesses manage this on paper.

### 2.2 The Problem — Customer Side
- **Discovery by portfolio, not by name**: A customer looking for a specific balayage style wants to book an artist based on an Instagram-style portfolio.
- **Package confusion**: Customers buy 6-session laser packages but have no visibility into how many sessions remain.
- **Unified bookings**: A bride who needs hair, makeup, lashes, and nails has to book with 4 different businesses via different channels.

---

## 3. Top Features (MVP Scope)
1. **Split-Phase Scheduling Engine**: Active / Processing / Finish support calculated natively.
2. **Technician Portfolio as Booking Surface**: Images tagged with a service link directly into a booking funnel.
3. **Walk-in Queue**: For barbershops and nail studios.
4. **Stripe Payments**: For automatic deposits and no-show protection.
5. **Business/Consumer Dual App Access**: Modular web app serving both consumers and platform administrators natively.

*See full epic scope in the company feature matrices for Phases 2 and 3.*
