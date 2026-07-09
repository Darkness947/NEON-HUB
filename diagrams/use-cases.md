# System Use Cases

```mermaid
usecaseDiagram
    actor User
    actor Guest

    rectangle "Neon Hub System" {
        usecase "Browse Trending Media" as UC1
        usecase "Search Media" as UC2
        usecase "Register / Login" as UC3
        usecase "Add to Library" as UC4
        usecase "Rate & Review" as UC5
        usecase "Generate AI Recommendations" as UC6
        usecase "Generate AI Comparison" as UC7
        usecase "View Dashboard Stats" as UC8
        usecase "Change Language (EN/AR)" as UC9
    }

    Guest --> UC1
    Guest --> UC2
    Guest --> UC3
    Guest --> UC9

    User --> UC1
    User --> UC2
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
    User --> UC9
```
