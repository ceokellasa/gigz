# Gigz Platform - Technical Overview & Architecture

## 1. Executive Summary
**Gigz** is a modern, responsive freelance marketplace connecting Clients (Gig Posters) with Professionals. The platform utilizes a **Headless Architecture**, where a React-based frontend communicates directly with a Supabase (PostgreSQL) backend via secure APIs.

## 2. Technology Stack

### Frontend (Client-Side)
The user interface is built for performance and responsiveness.
*   **Framework:** **React.js** (v18) with **Vite** (Build Tool).
*   **Language:** JavaScript (ES6+).
*   **Styling:** **TailwindCSS** (Utility-first CSS) for rapid, responsive design with a custom color palette (Indigo/Slate).
*   **Icons:** `lucide-react` for consistent, lightweight SVG icons.
*   **Routing:** `react-router-dom` (v6) for Client-Side Routing (Single Page Application).
*   **State Management:** React Context API (`AuthContext`, `SettingsContext`) for global state like User Session and Theme.

### Backend (Serverless)
We utilize **Supabase** as a Backend-as-a-Service (BaaS), which provides enterprise-grade infrastructure without managing servers.
*   **Database:** **PostgreSQL** (The world's most advanced open-source relational database).
*   **Authentication:** Supabase Auth (JWT-based secure login/signup).
*   **API:** Auto-generated RESTful & Real-time APIs based on Database Schema.
*   **Real-time Engine:** Supabase Realtime (WebSockets) for Instant Messaging and Notifications.
*   **Edge Functions:** Deno-based Serverless functions for sensitive logic (e.g., Payment Verification).
*   **Storage:** Supabase Storage (AWS S3 wrapper) for User Avatars and Portfolio Images.

### Integrations
*   **Payments:** **Cashfree** (Indian Payment Gateway) for Subscription and One-time fees.
*   **Maps/Location:** (Architecture ready for Google Maps integration, currently text-based).

## 3. System Architecture

```mermaid
graph TD
    User[User Device] -->|HTTPS / JSON| CDN[Frontend Host (Vercel/Netlify)]
    User -->|REST API / Realtime| Supabase[Supabase Backend]
    
    subgraph Supabase Services
        Auth[Auth Service]
        DB[(PostgreSQL Database)]
        Realtime[Realtime Engine]
        Storage[File Storage]
        Edge[Edge Functions]
    end
    
    subgraph External
        Cashfree[Cashfree Payment Gateway]
    end

    Supabase -->|Payment Verification| Cashfree
    User -->|Checkout Flow| Cashfree
```

## 4. Database Structure (Core Schema)

A relational model ensures data integrity. Key tables include:

1.  **`auth.users`**: Managed by Supabase. Stores secure credentials (hashed passwords, emails).
2.  **`public.profiles`**: Extends user data.
    *   `id` (PK, ref auth.users), `full_name`, `avatar_url`, `has_paid_professional_fee`, `subscription_plan`.
3.  **`public.professional_profiles`**: specific data for workers.
    *   `user_id` (PK), `bio`, `profession`, `hourly_rate`, `skills` (Array), `previous_works` (JSONB).
4.  **`public.gigs`**: Jobs posted by clients.
    *   `id`, `title`, `description`, `budget`, `status` (open/closed), `location`.
5.  **`public.messages`**: Chat history.
    *   `sender_id`, `receiver_id`, `content`, `read_status`.
6.  **`public.notifications`**: User alerts.
    *   `user_id`, `type` (message/gig_interest), `content`.

## 5. Security & Data Flow

*   **Row Level Security (RLS):**
    *   We use PostgreSQL RLS policies to enforce security at the database engine level.
    *   *Example:* "Users can only edit their OWN profile." (`auth.uid() = id`).
    *   *Example:* "Messages are only visible to the Sender and Receiver."
*   **Environment Variables:** Sensitive keys (Cashfree Secrets, Service Roles) are stored in `.env` or Server-side Secrets, never exposed to the client.

## 6. Scalability Analysis

### User Capacity
This architecture is designed to scale horizontally.

*   **Database Limit:** PostgreSQL can store terabytes of data. Indexing ensures queries remain fast as you reach millions of rows.
*   **Concurrent Connections:** By using **Supabase Transaction Pooler (PgBouncer)**, the app can handle thousands of simultaneous active connections.
*   **Frontend Traffic:** Being a static Single Page Application (SPA), the frontend can be cached on a CDN (Content Delivery Network) and serve **millions of users** with virtually no bottleneck.

### Estimated Limits (Standard Launch)
*   **Concurrent Users:** ~10,000+ (Upgradeable).
*   **Monthly Active Users:** 50,000 - 100,000 (Based on free/pro tier limits).
*   **Real-time Connections:** 500 concurrent (Free Tier) -> 10,000+ (Pro Tier).

## 7. How It Works (User Journey)

1.  **Visitor**: Lands on Homepage. React loads instantly.
2.  **Sign Up**: Enters email. Supabase Auth creates a secure session/JWT.
3.  **Post Gig**: Authenticated User fills form -> `INSERT into public.gigs`.
4.  **Find Professional**: User searches -> React queries specific columns in `professional_profiles` using standard PostgreSQL filters.
5.  **Hire/Message**: User acts -> Realtime subscription updates the Professional's screen instantly (WebSocket push).
6.  **Payment**: User clicks "Unlock" -> Redirects to Cashfree -> Payment Success -> Redirect back -> Secure Verification -> Profile Updated.

This modern architecture ensures **Speed** (no page reloads), **Security** (RLS policies), and **Scalability** (Serverless backend).
