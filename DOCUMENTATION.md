# Travel Mate Documentation

## Abstract

Travel Mate is an innovative application designed to enhance the travel experience by providing users with a real-time, interactive map of their surroundings.
This project serves as an initial implementation for an application intended to operate in both a standard mobile mode and a specialized automotive mode.
The application automatically identifies and displays nearby points of interest (POIs), offering dynamic filtering, comparative analysis for hotels and restaurants, AI-generated descriptions, and text-to-speech (TTS) functionality to act as a personal tour guide.
It is built with a modern microservices architecture, ensuring scalability and maintainability, with a clear path toward deployment on the container orchestration platform Kubernetes.

## Introduction

In an age of information overload, travelers often struggle to find relevant and concise information about their immediate surroundings.
Travel Mate aims to solve this problem by offering a streamlined and intuitive interface that delivers contextually relevant information on the go.
This initial implementation focuses on the core functionalities for a web-based application, preparing for a future version designed for automotive environments.
By using the user's geolocation, the application provides a dynamic map populated with curated POIs such as restaurants, hotels, and attractions. Users can filter these POIs to tailor the display to their interests. A key feature is the comparative analysis, which offers dynamically generated text comparing the price and rating of hotels and restaurants to others in the vicinity. The core of the experience is the AI-powered overview, which gives users a unique, descriptive summary of the area, bringing the location to life. The system is designed to be dependent on a server hosted externally, which manages the backend logic and data processing.

<div style="page-break-after: always;"></div>

## Aims and Scope

The primary aim of the Travel Mate project is to develop a smart, interactive travel assistant that enriches the user's exploration of new places.
This serves as a foundational study for a dual-mode application.

The scope of the project includes:

- **Real-time Geolocation**: Tracking the user's position accurately.
- **Interactive Map**: Displaying the user's location and nearby POIs on a dynamic map.
- **POI Integration**: Fetching and categorizing data from external services like Google and TripAdvisor.
- **Dynamic Filtering**: Allowing users to filter POIs by category for a more focused view.
- **Comparative Analysis**: Providing users with insightful, dynamically generated text that compares hotels and restaurants based on their price and rating relative to other nearby options.
- **AI-Powered Descriptions**: Utilizing a Large Language Model (LLM) to generate descriptive summaries of the user's location.
- **Text-to-Speech (TTS)**: Providing an audio option for the AI descriptions for a hands-free experience.
- **Microservices Architecture**: Building the system with independent, containerized services for robustness and scalability.
- **Premium Features**: Showing premium features through a dedicated service, which currently utilizes a mocked database for demonstration purposes.
- **Future Automotive Mode**: Designing the architecture to be extensible for a future automotive application variant.
- **Cloud-Native Deployment**: Preparing the application for distribution and scaling via Kubernetes.

## System Description and Highlight

### Components and How It Works

Travel Mate is architected as a multi-component system, with a clear separation between the frontend client and various backend microservices, which are expected to run on an external server.

**Components:**

1. **Frontend**: A Next.js application built with React and TypeScript. It provides the user interface, including the interactive map powered by React Leaflet.
2. **Backend-for-Frontend (BFF)**: The Next.js application also serves as a BFF, with API routes (`/src/pages/api`) that mediate communication between the client and the backend services.
3. **Ollama Service**: A dedicated container running a Large Language Model (LLM) to handle requests for AI-generated content.
4. **Piper Service**: A containerized TTS engine that converts text descriptions into natural-sounding speech.
5. **Premium Service**: A PostgreSQL database service intended to support future premium features. In this initial implementation, this service is mocked and does not persist data, serving as a placeholder for a full-fledged premium tier.

**Workflow:**

1. The user accesses the Travel Mate web application in their browser (App in the future).
2. The frontend requests the user's location using the browser's Geolocation API, with IP-based location as a fallback.
3. Once the location is obtained, the frontend sends a request to its BFF API, which in turn communicates with the main backend server.
4. The backend server then queries external APIs (e.g., Google, TripAdvisor) for nearby POIs and the internal Ollama service for an AI-generated description of the area.
5. The collected data is sent back to the frontend, which updates the map with markers and displays the AI overview.
6. If the user enables audio, the AI description text is sent to the Piper TTS service, and the resulting audio is streamed to the user.

### Modules Description

- **`src/app/page.tsx`**: The main entry point of the React application. It manages the application's state, orchestrates data fetching, and renders the primary components.
- **`src/app/map.tsx`**: The interactive map component, responsible for rendering the Leaflet map, user location, accuracy circle, and POI markers.
- **`src/app/ai_overview.tsx`**: A component dedicated to displaying the loading state and content of the AI-generated description.
- **`src/pages/api/`**: Contains the server-side API routes that act as a gateway. These routes handle requests from the client and communicate with the various microservices and external APIs.
  - `describe.tsx`: Interfaces with the Ollama LLM service.
  - `google.tsx` / `tripadvisor.tsx`: Interface with external POI data providers.
  - `tts.tsx`: Interfaces with the Piper TTS service.
  - `premium.tsx`: Interfaces with the Premium (PostgreSQL) service.
- **`docker-compose.yml`**: The Docker Compose file that defines and configures the entire multi-container application, including development and production profiles.

<div style="page-break-after: always;"></div>

## System Architecture

The system is designed with a microservices architecture, containerized using Docker. This approach enhances modularity, scalability, and resilience, making it well-suited for a cloud-native deployment using an orchestrator like Kubernetes. The application is dependent on a server hosted outside of its immediate environment, which handles the core logic.

The architecture can be visualized as follows:

```text
+-------------------------------------------------------------------+
|                           User's Browser                          |
| +---------------------------------------------------------------+ |
| |                  Travel Mate (Next.js Frontend)               | |
| +---------------------------------------------------------------+ |
+----------------|--------------------------------------------------+
                 | (HTTPS Requests to External Server)
+----------------V--------------------------------------------------+
|                  Backend Server (e.g., running on Kubernetes)     |
|-------------------------------------------------------------------|
| +---------------------------------------------------------------+ |
| |             Travel Mate (Next.js BFF API Routes)              | |
| |---------------------------------------------------------------| |
| | -> (HTTP) to Ollama Service (LLM)                             | |
| | -> (HTTP) to Piper Service (TTS)                              | |
| | -> (TCP)  to Premium Service (Mocked PostgreSQL)              | |
| | -> (API)  to External Services (Google, TripAdvisor, etc.)    | |
| +---------------------------------------------------------------+ |
+-------------------------------------------------------------------+
```

Each service (`ollama`, `piper`, `premium`, `travelmate`) runs in its own Docker container, allowing them to be developed, deployed, and scaled independently. The entire stack is designed to be deployed and managed by Kubernetes for production environments.

<div style="page-break-after: always;"></div>

## Performance Evaluation and Optimization

Performance is a key consideration for a soft real-time application like Travel Mate.
As part of the project's scope, we have evaluated potential performance bottlenecks and designed corresponding optimization strategies.

### Caching

To ensure a responsive user experience and minimize redundant API calls, a heavy caching strategy is a core part of the design.
To validate this approach, we developed a `Cache-hit simulator.py` to analyze the effectiveness of our caching logic.
Caching is implemented at multiple levels:

- **Backend Caching**: This is the most critical level of caching. The architecture is designed to cache responses from external APIs (Google, TripAdvisor) and the computationally intensive Ollama service.
  - This dramatically reduces latency, lowers operational costs, and prevents rate-limiting issues.
  - The system is designed to integrate with a distributed cache like Redis for this purpose.
- **Client-side Caching**: The frontend caches POI data to avoid re-fetching when the user's location has not changed significantly, improving the perceived performance.

### Scaling

The microservices architecture was chosen for its inherent scalability.
The `docker-compose.yml` file defines separate services for each core functionality, which allows for targeted scaling.
For production, the application is designed for deployment on Kubernetes to leverage its scaling capabilities.

- The **Ollama service**, if experiencing high load, will be horizontally scaled by Kubernetes, which will automatically deploy more instances based on CPU or memory usage.
- Similarly, the main **Travelmate** application will be scaled out to handle a large number of concurrent users, with a load balancer distributing traffic among the instances.
- The **Piper service** can also be scaled independently to handle multiple TTS requests concurrently, ensuring that audio generation does not become a bottleneck.
