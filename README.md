# SyncSport

SyncSport to nowoczesna aplikacja webowa służąca do zarządzania, przeglądania i rezerwowania obiektów sportowych. Zapewnia wygodny dostęp zarówno dla użytkowników chcących wynająć boisko lub kort, jak i dla administratorów do zarządzania infrastrukturą.

## Funkcjonalności

- **Dla użytkowników:**
  - Przeglądanie dostępnych obiektów sportowych i ich szczegółów
  - Kalendarz rezerwacji i wynajem na określone godziny
  - Obsługa płatności
  - Panel klienta (historia rezerwacji, edycja profilu)
  - Interfejs dostosowany do urządzeń mobilnych oraz obsługa trybu Dark Mode

- **Dla administratorów / zarządców:**
  - Zarządzanie obiektami i powiązanymi z nimi kortami/boiskami
  - Definiowanie godzin otwarcia obiektów i taryf cenowych
  - Zarządzanie rezerwacjami klientów
  - Obsługa ról i zarządzanie użytkownikami platformy

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Stylizacja:** Bootstrap, CSS
- **Stan zapytań API:** React Query (TanStack Query)
- **Routing:** React Router DOM

## Uruchomienie lokalne

1. Zainstaluj zależności:
   ```bash
   npm install
   ```

2. Skonfiguruj plik `.env` (wzorując się na potrzebach API dla środowiska).

3. Uruchom serwer deweloperski:
   ```bash
   npm run dev
   ```

## Backend i Demo

- [Repozytorium z backendem](https://github.com/JakubMalinowski378/SyncSport)
- [Demo](https://syncsport-czdxewevevbmbmb9.polandcentral-01.azurewebsites.net/)

## Konta Testowe

Hasło dla wszystkich kont to `Password123!`.

* **Użytkownik:** `user@syncsport.com` (Rola: User)
* **Manager:** `manager@syncsport.com` (Rola: Manager)
* **Administrator:** `admin@syncsport.com` (Rola: Admin)

## Płatności (Sandbox)

Moduł płatności podczas pracy w środowisku testowym wspiera fałszywą bramkę płatniczą. Do testowania skutecznych płatności użyj dowolnego kodu CVV, dowolnej przyszłej ważności karty oraz następującego numeru karty Sandbox:
* **Numer karty:** `4242 4242 4242 4242`
