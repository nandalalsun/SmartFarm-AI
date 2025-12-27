# FarmSmart AI - Authentication Flow Diagrams

## Component Architecture

```mermaid
graph TD
    Client[React Frontend]
    
    subgraph "Backend (Spring Boot)"
        Filter[JwtAuthenticationFilter]
        Config[SecurityConfig]
        
        subgraph "Controllers"
            AuthCtrl[AuthController]
            InvCtrl[InvitationController]
        end
        
        subgraph "Services"
            AuthSvc[AuthService]
            InvSvc[InvitationService]
            UserSvc[CustomUserDetailsService]
        end
        
        subgraph "Security Components"
            JwtProv[JwtTokenProvider]
            OAuthHdlr[CustomOAuth2SuccessHandler]
        end
    end
    
    subgraph "External"
        Google[Google OAuth2 Service]
    end
    
    subgraph "Data Persistence"
        DB[(PostgreSQL)]
    end

    Client -- "1. Login / API Req" --> Filter
    Filter -- "2. Validate Token" --> JwtProv
    Client -- "3. Google Login" --> Config
    Config -- "4. Redirect" --> Google
    Google -- "5. Callback" --> OAuthHdlr
    OAuthHdlr -- "6. Link/Create User" --> DB
    AuthCtrl -- "7. Local Login" --> AuthSvc
    AuthSvc -- "8. Verify Creds" --> DB
```

## Flow 1: Google OAuth Login (Invitation Required)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Backend as Spring Security
    participant Handler as OAuth2SuccessHandler
    participant DB as PostgreSQL
    participant Google

    User->>Browser: Clicks "Sign in with Google"
    Browser->>Backend: GET /oauth2/authorize/google
    Backend->>Google: Redirect to Google
    User->>Google: Authenticates & Consents
    Google->>Backend: Callback (Auth Code)
    Backend->>Google: Exchange Code for Access Token
    Google->>Backend: Returns User Info (Email, Name, Sub)
    Backend->>Handler: onAuthenticationSuccess()
    
    Handler->>DB: Find User by Email
    alt User Exists
        Handler->>DB: Update Google Sub (Link Account)
    else User Not Found
        Handler->>DB: Check for PENDING Invitation
        alt Invitation Valid
            Handler->>DB: Create User, Mark Invite Accepted
        else No Invitation
            Handler->>Browser: Redirect /login?error="No valid invitation"
            Note right of Handler: Flow Terminates
        end
    end

    Handler->>Handler: Generate JWT Access & Refresh Token
    Handler->>Browser: Redirect /oauth2/redirect?accessToken=...&refreshToken=...
    Browser->>Browser: Store Tokens & Redirect to Dashboard
```

## Flow 2: Email + Password Login

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant API as AuthController
    participant Svc as AuthService
    participant DB as PostgreSQL
    participant JWT as JwtTokenProvider

    User->>Browser: Enters Email/Password
    Browser->>API: POST /api/auth/login
    API->>Svc: login(request)
    Svc->>DB: Find User by Email
    Svc->>Svc: Validate Password (BCrypt)
    
    alt Invalid Credentials
        Svc-->>API: Throw Exception
        API-->>Browser: 401 Unauthorized
    else Valid Credentials
        Svc->>DB: Check 2FA Enabled?
        alt 2FA Enabled
            Svc-->>API: Return { "mfaRequired": true }
            API-->>Browser: Redirect to 2FA Page
        else 2FA Disabled
            Svc->>JWT: Generate Tokens
            Svc-->>API: Return { accessToken, refreshToken }
            API-->>Browser: 200 OK
        end
    end
```

## Flow 3: Two-Factor Authentication (TOTP)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant API as AuthController
    participant Svc as AuthService
    participant TOTP as TotpService
    participant DB as PostgreSQL

    User->>Browser: Enters 6-digit Code
    Browser->>API: POST /api/auth/verify-2fa
    API->>Svc: verify2fa(request)
    Svc->>DB: Fetch User & Secret Key
    Svc->>TOTP: verifyCode(secret, code)
    
    alt Invalid Code
        TOTP-->>Svc: false
        Svc-->>API: Throw Exception
        API-->>Browser: 400 Bad Request
    else Valid Code
        TOTP-->>Svc: true
        Svc->>Svc: Generate Tokens (Full Access)
        Svc-->>API: Return { accessToken, refreshToken }
        API-->>Browser: 200 OK + Tokens
    end
```

## Flow 4: Invitation Creation (Admin)

```mermaid
sequenceDiagram
    actor Admin
    participant Browser
    participant API as InvitationController
    participant Svc as InvitationService
    participant DB as PostgreSQL

    Admin->>Browser: Fills Invitation Form (Email, Role)
    Browser->>API: POST /api/invitations
    Note right of API: @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    API->>Svc: createInvitation(request)
    Svc->>DB: Check if User Already Exists
    
    alt User Exists
        Svc-->>API: Throw Exception
        API-->>Browser: 400 Bad Request
    else User Not Found
        Svc->>Svc: Generate UUID Token
        Svc->>Svc: Set Expiry (48 hours)
        Svc->>DB: Save UserInvitation (PENDING)
        Svc-->>API: Return Invitation Details
        API-->>Browser: 200 OK + Invitation Link
    end
```

## Flow 5: Invitation Acceptance (Signup)

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant API as InvitationController
    participant AuthAPI as AuthController
    participant Svc as AuthService
    participant InvSvc as InvitationService
    participant DB as PostgreSQL

    User->>Browser: Clicks Invitation Link
    Browser->>API: GET /api/invitations/validate/{token}
    API->>InvSvc: validateToken(token)
    InvSvc->>DB: Find Invitation by Token
    
    alt Invalid/Expired
        InvSvc-->>API: Throw Exception
        API-->>Browser: 400 Bad Request
    else Valid
        InvSvc-->>API: Return Invitation Details
        API-->>Browser: 200 OK
    end

    User->>Browser: Fills Form (Name, Password)
    Browser->>AuthAPI: POST /api/auth/signup
    AuthAPI->>Svc: signup(request)
    Svc->>InvSvc: validateToken(token)
    Svc->>Svc: Hash Password (BCrypt)
    Svc->>DB: Create User with Role from Invitation
    Svc->>InvSvc: markAccepted(invitation)
    Svc->>DB: Update Invitation Status = ACCEPTED
    Svc-->>AuthAPI: Success
    AuthAPI-->>Browser: 200 OK
    Browser->>Browser: Redirect to Login
```

## Flow 6: Protected API Request (Authorization)

```mermaid
sequenceDiagram
    participant Browser
    participant Filter as JwtAuthenticationFilter
    participant Provider as JwtTokenProvider
    participant UserSvc as CustomUserDetailsService
    participant Ctx as SecurityContext
    participant API as ProtectedController

    Browser->>Filter: GET /api/dashboard/stats
    Note right of Browser: Header: Authorization: Bearer {token}
    
    Filter->>Filter: Extract JWT from Header
    Filter->>Provider: validateToken(jwt)
    
    alt Invalid/Expired Token
        Provider-->>Filter: false
        Filter->>Browser: 401 Unauthorized (JSON)
    else Valid Token
        Provider-->>Filter: true
        Filter->>Provider: getUsernameFromJWT(jwt)
        Provider-->>Filter: email
        Filter->>UserSvc: loadUserByUsername(email)
        UserSvc->>UserSvc: Load User + Roles from DB
        UserSvc-->>Filter: UserDetails (with authorities)
        Filter->>Ctx: setAuthentication(UserDetails)
        Filter->>API: Forward Request
        
        alt User Has Required Role
            API->>API: Process Request
            API-->>Browser: 200 OK (Data)
        else Insufficient Permissions
            API-->>Browser: 403 Forbidden
        end
    end
```

## Flow 7: Logout

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant AuthContext

    User->>Browser: Clicks "Logout"
    Browser->>AuthContext: logout()
    AuthContext->>AuthContext: Remove token from localStorage
    AuthContext->>AuthContext: Remove refreshToken from localStorage
    AuthContext->>AuthContext: Clear user state
    AuthContext->>Browser: Redirect to /login
    
    Note right of Browser: Backend is stateless.<br/>Token remains valid until expiry.
```

## Data Flow: Database Interactions

```mermaid
graph LR
    subgraph "User Operations"
        Login[Login/OAuth]
        Signup[Signup]
        API[API Request]
    end
    
    subgraph "Database Tables"
        Users[(users)]
        Invites[(user_invitations)]
        Audit[(login_audit)]
        TFA[(two_factor_auth)]
        Roles[(roles)]
    end
    
    Login -->|READ| Users
    Login -->|WRITE| Audit
    Login -->|READ| TFA
    
    Signup -->|WRITE| Users
    Signup -->|READ/UPDATE| Invites
    Signup -->|WRITE| Audit
    
    API -->|READ| Users
    API -->|READ| Roles
    
    Users -.->|Many-to-Many| Roles
```

## Security Decision Tree

```mermaid
graph TD
    Start[Incoming Request]
    Start --> Public{Public Endpoint?}
    
    Public -->|Yes /api/auth/**| Allow[Process Request]
    Public -->|No| CheckToken{JWT Token Present?}
    
    CheckToken -->|No| Reject401[Return 401 Unauthorized]
    CheckToken -->|Yes| ValidToken{Token Valid?}
    
    ValidToken -->|No| Reject401
    ValidToken -->|Yes| LoadUser[Load User + Roles]
    
    LoadUser --> CheckRole{Has Required Role?}
    CheckRole -->|No| Reject403[Return 403 Forbidden]
    CheckRole -->|Yes| Allow
```
