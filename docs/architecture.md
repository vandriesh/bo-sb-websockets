# Application Architecture

## System Overview

```mermaid
graph TB
    subgraph Socket["Socket Layer (socket.ts)"]
        S[Socket.io Client]
        ES[Enhanced Socket]
    end

    subgraph CommonSocket["Common Socket Handlers"]
        BO_SOCKET["bo-socket.ts<br/>Back Office Socket"]
        SB_SOCKET["sb-socket.ts<br/>Sportsbook Socket"]
    end

    subgraph StateManagement["State Management"]
        subgraph CommonStore["Common Store"]
            ES_SLICE["createEventsSlice.ts<br/>Events Slice Creator"]
        end
        
        subgraph BackOfficeStore["Back Office Store"]
            BO_STORE["events.ts<br/>Back Office Events Store"]
        end
        
        subgraph SportsbookStore["Sportsbook Store"]
            SB_STORE["index.ts<br/>Sportsbook Store"]
            BETSLIP["betslip.ts<br/>Betslip Store"]
        end
    end

    subgraph Applications["Applications"]
        subgraph BackOffice["Back Office (src/backoffice)"]
            BO_APP["App.tsx"]
            BO_COMP["components/<br/>- BackOffice.tsx<br/>- EventItem.tsx"]
        end
        
        subgraph Sportsbook["Sportsbook (src/sportsbook)"]
            SB_APP["App.tsx"]
            SB_COMP["components/<br/>- EventList.tsx<br/>- EventDetails.tsx<br/>- Betslip.tsx"]
        end
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
    BO_STORE --> BO_COMP
    SB_STORE --> SB_COMP
    BETSLIP --> SB_COMP
    
    %% Component Hierarchy
    BO_APP --> BO_COMP
    SB_APP --> SB_COMP

    classDef socket fill:#f9f,stroke:#333,stroke-width:2px
    classDef store fill:#bbf,stroke:#333,stroke-width:2px
    classDef component fill:#bfb,stroke:#333,stroke-width:2px
    
    class Socket socket
    class StateManagement store
    class Applications component
```

## Data Flow

1. Socket Layer
   - `socket.ts`: Establishes WebSocket connection
   - Enhanced Socket wrapper provides type-safe event handling

2. Common Socket Handlers
   - `bo-socket.ts`: Manages Back Office specific socket events
   - `sb-socket.ts`: Manages Sportsbook specific socket events

3. State Management
   - Common Store
     - `createEventsSlice.ts`: Reusable events state logic
   - Back Office Store
     - `events.ts`: Manages event data and UI state
   - Sportsbook Store
     - `index.ts`: Combines events and betslip state
     - `betslip.ts`: Manages betting selections and stakes

4. Applications
   - Back Office
     - Single page application for odds management
     - Real-time event suspension and price updates
   - Sportsbook
     - Multi-page application with routing
     - Event list, details, and betslip functionality

## Key Features

- Real-time updates using WebSocket
- Shared state management logic
- Separate concerns between Back Office and Sportsbook
- Persistent betslip state
- Price change animations
- Event suspension handling