# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Folder structure

your-app/
│
├── App.tsx                      # Root entry file Expo loads
├── app.json                     # App config (name, icons, splash)
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies + scripts
├── metro.config.js              # Metro bundler config
│
├── assets/                      # Static files bundled at build time
│   ├── fonts/                   # Custom fonts
│   ├── images/                  # App images
│   └── icons/                   # Icon files
│
├── src/                         # Main app source code
│   │
│   ├── components/              # Reusable UI pieces
│   │   ├── Button.tsx
│   │   └── Card.tsx
│   │
│   ├── screens/                 # Full screen views (routes)
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── ProfileScreen.tsx
│   │
│   ├── navigation/              # Navigation stacks/tabs logic
│   │   ├── AppNavigator.tsx
│   │   └── index.ts
│   │
│   ├── hooks/                   # Custom hooks (logic only)
│   │   ├── useAuth.ts
│   │   └── useFetch.ts
│   │
│   ├── context/                 # Global state via Context API
│   │   └── AuthContext.tsx
│   │
│   ├── services/                # API & backend communication
│   │   ├── api.ts
│   │   └── authService.ts
│   │
│   ├── utils/                   # Helper functions
│   │   ├── validators.ts
│   │   └── formatters.ts
│   │
│   ├── constants/               # Colors, configs, enums
│   │   ├── Colors.ts
│   │   └── Config.ts
│   │
│   ├── types/                   # Global TypeScript interfaces/types
│   │   ├── auth.ts
│   │   └── common.ts
│   │
│   └── theme/                   # Spacing, fonts, typography system
│       ├── spacing.ts
│       └── typography.ts
│
└── node_modules/                # All dependencies installed

