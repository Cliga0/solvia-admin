# SOLVIA_ADMIN_SPEC.md

# Solvia Administration Centrale

Version: 1.0

Status: Official Development Specification

# GENERATION RULES

Generate only what is explicitly requested.

Do not generate future modules.

Do not generate additional features.

Do not use starter templates that differ from the Solvia stack.

If a requested phase does not mention a module, do not generate it.

---

# 1. PROJECT OVERVIEW

## Mission

L'Administration Centrale Solvia est le centre opérationnel principal de l'écosystème Solvia.

Elle permet aux équipes internes de :

- Superviser
- Administrer
- Contrôler
- Sécuriser
- Développer

l'ensemble des produits Solvia.

---

## Produits concernés

### Solvia Market

Marketplace multi-vendeurs.

### Solvia Business

Plateforme de gestion d'entreprise.

### Produits futurs

Tous les futurs services Solvia devront pouvoir être intégrés dans cette administration centrale sans modification majeure de l'architecture.

---

# 2. ARCHITECTURE PRINCIPLES

## Priorités absolues

1. Scalabilité
2. Sécurité
3. Maintenabilité
4. Lisibilité
5. Performance
6. Modularité
7. Testabilité
8. Extensibilité

---

## Interdictions

Ne jamais :

- Mettre de logique métier dans les contrôleurs
- Faire des requêtes SQL directes
- Utiliser des rôles codés en dur
- Utiliser des permissions codées en dur
- Utiliser des valeurs magiques
- Dupliquer du code

---

## Obligations

Toujours :

- Utiliser des services
- Utiliser Prisma
- Utiliser DTO
- Utiliser Validation Pipes
- Utiliser RBAC
- Utiliser Audit Logs
- Utiliser Pagination
- Utiliser Transactions Prisma si nécessaire

---

# 3. TECHNOLOGY STACK

## Frontend

- Next.js App Router
- TypeScript
- TailwindCSS
- Shadcn/ui
- React Query
- Zustand
- React Hook Form
- Zod

---

## Backend

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Redis

---

## Authentication

- JWT Access Token
- JWT Refresh Token
- RBAC
- Two Factor Authentication

---

## Database

PostgreSQL

Toutes les données métier doivent être stockées dans PostgreSQL.

---

## Cache

Redis

Utilisé pour :

- Sessions
- Refresh Tokens
- Rate Limiting
- Cache Dashboard
- Cache Statistiques

---

# 4. PROJECT STRUCTURE

## Frontend

src/

├── app/
├── components/
├── services/
├── hooks/
├── store/
├── lib/
├── types/
├── constants/
└── providers/

---

## Backend

src/

├── common/
├── config/
├── prisma/
├── modules/
└── main.ts

---

# 5. NAMING CONVENTIONS

## Files

Toujours :

user.service.ts

user.controller.ts

user.repository.ts

user.module.ts

---

## Components

Toujours :

UserTable.tsx

CreateUserDialog.tsx

RoleBadge.tsx

AuditLogTable.tsx

---

## Variables

camelCase

Exemple :

currentUser

isActive

createdAt

---

## Classes

PascalCase

Exemple :

UserService

RoleGuard

AuditInterceptor

---

# 6. DATABASE STANDARDS

## IDs

Toujours UUID

Exemple :

id String @id @default(uuid())

---

## Dates

Tous les modèles doivent contenir :

createdAt DateTime @default(now())

updatedAt DateTime @updatedAt

---

## Soft Delete

Utiliser :

deletedAt DateTime?

Jamais de suppression physique sauf nécessité absolue.

---

## Index

Indexer :

- emails
- statuts
- foreign keys
- dates importantes

---

# 7. AUTHENTICATION MODULE

Module : auth

---

Fonctionnalités :

- Login
- Logout
- Refresh Token
- Password Reset
- Session Management
- 2FA

---

## JWT

Access Token

15 minutes

Refresh Token

30 jours

---

## Passwords

Utiliser :

Argon2

Jamais bcrypt pour un nouveau développement.

---

## Sessions

Toutes les sessions doivent être traçables.

Informations :

- IP
- User Agent
- Last Activity
- Device

---

# 8. INTERNAL USERS MODULE

Module : users

---

Gestion des employés Solvia.

Types :

- Employee
- Manager
- Administrator

---

Fonctionnalités :

- Création
- Modification
- Suspension
- Réactivation
- Attribution de rôles

---

Aucune suppression définitive.

---

# 9. ROLES MODULE

Module : roles

---

Architecture :

User
↓
Role
↓
Permission

---

Exemples :

Super Administrator

Market Administrator

Business Administrator

Finance

Support

Marketing

Moderator

---

# 10. PERMISSIONS MODULE

Module : permissions

---

Convention :

resource.action

---

Exemples :

users.create

users.read

users.update

users.suspend

roles.create

roles.read

roles.update

roles.delete

audit.read

dashboard.read

market.manage

business.manage

finance.manage

support.manage

notifications.manage

settings.manage

---

Les permissions sont toujours prioritaires sur les rôles.

---

# 11. RBAC RULES

Ne jamais vérifier :

if role == admin

Interdit.

Toujours vérifier :

Permission

---

Exemple :

@Permissions('users.create')

---

Tous les endpoints protégés doivent passer par :

PermissionsGuard

---

# 12. AUDIT LOG MODULE

Module : audit

---

Toutes les actions critiques doivent être journalisées.

---

Actions concernées :

- Création
- Modification
- Suppression logique
- Validation
- Suspension
- Réactivation
- Changement permissions
- Changement rôles
- Connexions

---

Données enregistrées :

- Utilisateur
- Action
- Module
- Ancienne valeur
- Nouvelle valeur
- IP
- User Agent
- Date

---

Audit obligatoire.

Aucune exception.

---

# 13. DASHBOARD MODULE

Module : dashboard

---

Objectif :

Vue globale de l'écosystème Solvia.

---

Widgets :

Utilisateurs internes

Comptes Solvia Market

Comptes Solvia Business

Abonnements

Revenus

Tickets support

Activité récente

---

Les données doivent être agrégées via services dédiés.

Jamais de logique lourde dans les contrôleurs.

---

# 14. API DESIGN RULES

Versionnement obligatoire.

Exemple :

/api/v1/users

/api/v1/roles

/api/v1/audit

---

Pagination obligatoire.

Exemple :

?page=1&limit=20

---

Réponse standard :

{
"success": true,
"message": "Operation successful",
"data": {}
}

---

Réponse erreur :

{
"success": false,
"message": "Access denied"
}

---

# 15. SECURITY RULES

Obligatoire :

- Helmet
- CORS
- Rate Limiting
- Validation Pipes
- JWT
- 2FA
- RBAC
- Audit Logs

---

Protection :

- XSS
- CSRF
- Brute Force
- Session Hijacking

---

# 16. FRONTEND UI RULES

Style :

Professionnel

Sobre

Entreprise

Administration SaaS

---

Interdictions :

- Couleurs agressives
- Animations excessives
- Design fantaisie

---

Priorités :

- Lisibilité
- Rapidité
- Cohérence

---

# 17. TABLE DESIGN RULES

Toutes les listes doivent supporter :

- Pagination
- Recherche
- Tri
- Filtres
- Sélection multiple

---

# 18. FORMS RULES

Toujours :

React Hook Form

-

Zod

---

Validation frontend et backend obligatoire.

---

# 19. LOGGING RULES

Utiliser Logger NestJS.

---

Ne jamais logger :

- mots de passe
- tokens
- secrets

---

# 20. TESTING RULES

Backend :

- Unit Tests
- Integration Tests

Frontend :

- Component Tests

---

Toute fonctionnalité critique doit être testable.

---

# 21. FUTURE MODULES

Architecture prévue pour :

- Solvia Market
- Solvia Business
- Finance
- Support
- Notifications
- Content Management
- Subscription Management
- Reporting
- Analytics
- Settings

---

Chaque nouveau module doit respecter intégralement ce document.

---

END OF SPECIFICATION
