# FoodRMS Employee TOTP App

A mobile application built with **Expo** and **React Native** to provide secure, 10-character alphanumeric TOTP codes for restaurant employees.

## Features
- **Neo-Brutalist Design**: Consistent with the FoodRMS web dashboard (Bold borders, hard shadows, vibrant colors).
- **QR Scanner**: Scan your unique setup code from the FoodRMS dashboard to activate your device.
- **Custom Alphanumeric TOTP**: Generates secure 10-character codes (letters + numbers) every hour.
- **Persistent Session**: Remembers your account after the first scan.
- **RTL Support**: Built with Arabic first-class support.

## Tech Stack
- **Expo SDK**
- **React Native**
- **Lucide React Native** (Icons)
- **AsyncStorage** (Persistence)
- **Custom HMAC-SHA1 Algorithm** (Mirroring the .NET backend)

## Getting Started

### Prerequisites
- Node.js installed.
- Expo Go app on your mobile device (iOS/Android).

### Installation
```bash
cd TOTP
npm install
```

### Running the App
```bash
npx expo start
```
Scan the QR code in your terminal with your phone's camera or the Expo Go app.

## Security Note
This app uses a custom alphanumeric algorithm specifically designed for the FoodRMS ecosystem. Standard apps like FoodRMS TOTP or Authy will **not** work with these 10-character codes.
