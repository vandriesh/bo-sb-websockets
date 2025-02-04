# Application Architecture

## System Overview

```mermaid
graph TB
    subgraph Socket["Socket Layer (socket.ts)"]
        S[Socket.io Client]
        ES[Enhanced Socket]
    end

    subgraph BackOffice["Back Office (src/backoffice)"]
        subgraph BOEvents["Events Feature"]
            BO_EVENT_LIST["EventList.tsx"]
            BO_EVENT_ITEM["EventItem.tsx"]
            BO_HOOKS["hooks/useEvents.ts"]
            BO_SOCKET["socket/eventsSocket.ts"]
            BO_STORE["store/eventsStore.ts"]
        end
    end

    subgraph CommonSocket["Common Socket Handlers"]
        SB_SOCKET["sb-socket.ts<br/>Sportsbook Socket"]
    end

    subgraph StateManagement["State Management"]
        subgraph CommonStore["Common Store"]
            ES_SLICE["createEventsSlice.ts<br/>Events Slice Creator"]
        end
        
        subgraph SportsbookStore["Sportsbook Store"]
            SB_STORE["index.ts<br/>Sportsbook Store"]
            BETSLIP["betslip.ts<br/>Betslip Store"]
        end
    end

    subgraph Sportsbook["Sportsbook (src/sportsbook)"]
        SB_APP["App.tsx"]
        SB_COMP["components/<br/>- EventList.tsx<br/>- EventDetails.tsx<br/>- Betslip.tsx"]
    end

    %% Socket Connections
    S --> ES
    ES --> BO_SOCKET
    ES --> SB_SOCKET
    
    %% State Management Connections
    ES_SLICE --> BO_STORE
    ES_SLICE --> SB_STORE
    
    %% Socket to Store Connections
    BO_SOCKET --> BO_STORE
    SB_SOCKET --> SB_STORE
    
    %% Store to Components Connections
    BO_STORE --> BO_EVENT_LIST
    BO_EVENT_LIST --> BO_EVENT_ITEM
    SB_STORE --> SB_COMP
    BETSLIP --> SB_COMP

    classDef socket fill:#f9f,stroke:#333,stroke-width:2px
    classDef store fill:#bbf,stroke:#333,stroke-width:2px
    classDef component fill:#bfb,stroke:#333,stroke-width:2px
    
    class Socket socket
    class StateManagement store
    class BackOffice,Sportsbook component
```

## Data Flow

1. Socket Layer
   - `socket.ts`: Establishes WebSocket connection
   - Enhanced Socket wrapper provides type-safe event handling

2. Back Office Application
   - Events Feature (`src/backoffice/events/`)
     - `EventList.tsx`: Main events management interface
     - `EventItem.tsx`: Individual event row with price controls
     - `hooks/useEvents.ts`: Data fetching logic
     - `socket/eventsSocket.ts`: Event-specific socket handlers
     - `store/eventsStore.ts`: Events state management

3. Common Socket Handlers
   - `sb-socket.ts`: Manages Sportsbook specific socket events

4. State Management
   - Common Store
     - `createEventsSlice.ts`: Reusable events state logic
   - Sportsbook Store
     - `index.ts`: Combines events and betslip state
     - `betslip.ts`: Manages betting selections and stakes

5. Sportsbook Application
   - Multi-page application with routing
   - Event list, details, and betslip functionality

## Key Features

- Real-time updates using WebSocket
- Shared state management logic
- Screaming architecture organization
  - Features organized by domain/purpose
  - Clear separation of concerns
  - Cohesive feature modules
- Price change animations
- Event suspension handling
- Persistent betslip state

## Back Office Architecture Details

The Back Office follows a screaming architecture pattern, organizing code by feature rather than technical type:

1. Events Feature Module (`/events`)
   - Complete ownership of events management
   - Self-contained with its own:
     - Components (EventList, EventItem)
     - Hooks (useEvents)
     - Store (eventsStore)
     - Socket handlers (eventsSocket)

2. State Management
   - Uses Zustand for state
   - Extends common events slice
   - Manages:
     - Event data
     - Price updates
     - Suspension states
     - UI states (loading, updating)

3. Real-time Updates
   - Debounced price updates
   - Immediate UI feedback
   - Websocket communication
   - Visual indicators for changes

4. Data Flow
   - Initial load via HTTP
   - Real-time updates via WebSocket
   - Bidirectional communication for:
     - Price changes
     - Event suspension