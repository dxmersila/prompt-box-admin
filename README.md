# Prompt Box Admin

Prompt Box Admin is the administrative interface for **Prompt Box**, a digital-product application built on the Armin Admin Template foundation.

It is a separate React application used by administrators to manage Prompt Box through the Prompt Box API.

## Role in the Prompt Box Ecosystem

Prompt Box consists of three independent applications:

* **Prompt Box API** — Laravel backend and source of truth for business rules, authorization, data, orders, payments, subscriptions, and protected content.
* **Prompt Box Admin** — React-based administrative interface for management workflows.
* **Prompt Box Web** — Next.js public-facing web application for the Prompt Box product experience.

The Admin application consumes the Prompt Box API and provides the administrative user interface. Authoritative business rules remain in the API.

## Tech Stack

* React 19
* TypeScript
* Vite 8
* Tailwind CSS 4
* React Router
* Axios
* i18next / react-i18next
* Lucide React
* SweetAlert2

## Requirements

* Node.js
* npm
* A running Prompt Box API instance

## Environment

Create a local environment file:

```bash
cp .env.example .env.local
```

Set the API base URL to the Prompt Box API:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

For production, configure the environment according to the target Prompt Box deployment.

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The Vite development server will display the local URL in the terminal.

## Validation

Run the production build:

```bash
npm run build
```

Run ESLint:

```bash
npm run lint
```

## Architecture

Prompt Box Admin follows the reusable architecture established by the **Armin Admin Template**.

The Admin application is responsible for:

* Administrative user interface and workflows
* Authentication and session handling
* Management screens for Prompt Box resources
* Form and interaction handling
* API communication
* Client-side presentation and navigation

Business rules, authorization decisions, validation enforced by the backend, pricing, payments, subscriptions, and access control remain the responsibility of the Prompt Box API.

## Armin Foundation

Prompt Box Admin was created from the stable **Armin Admin Template**.

The Template provides the reusable application foundation, while this repository contains Prompt Box-specific requirements, UI, content, and configuration.

Product-specific changes should remain in Prompt Box. Reusable architectural improvements should only be introduced into the Armin Admin Template when they represent a genuine requirement that benefits multiple product instances.

## Repository

GitHub:

`git@github.com:dxmersila/prompt-box-admin.git`

## Status

**Productionization in Progress**

Prompt Box Admin is the administrative application for the Prompt Box product instance and is being prepared for production use.
