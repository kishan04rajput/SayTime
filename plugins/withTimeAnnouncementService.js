const { withAndroidManifest, withMainApplication, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to add foreground service support for time announcements
 * This modifies the AndroidManifest.xml to include necessary permissions and service declarations
 * and copies the native module files
 */
const withTimeAnnouncementService = (config) => {
  // Step 1: Modify AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Add foreground service permission
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    const permissions = [
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_SPECIAL_USE',
      'android.permission.WAKE_LOCK',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.SCHEDULE_EXACT_ALARM',
      'android.permission.USE_EXACT_ALARM',
      'android.permission.POST_NOTIFICATIONS',
    ];

    permissions.forEach((permission) => {
      const exists = androidManifest['uses-permission'].some(
        (p) => p.$['android:name'] === permission
      );
      if (!exists) {
        androidManifest['uses-permission'].push({
          $: { 'android:name': permission },
        });
      }
    });

    // Add service and receiver to application
    const application = androidManifest.application[0];

    if (!application.service) {
      application.service = [];
    }

    if (!application.receiver) {
      application.receiver = [];
    }

    // Add TimeAnnouncementService
    const serviceExists = application.service.some(
      (s) => s.$['android:name'] === '.TimeAnnouncementService'
    );

    if (!serviceExists) {
      application.service.push({
        $: {
          'android:name': '.TimeAnnouncementService',
          'android:enabled': 'true',
          'android:exported': 'false',
          'android:foregroundServiceType': 'specialUse',
        },
        'property': [
          {
            $: {
              'android:name': 'android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE',
              'android:value': 'Time announcement service for accessibility',
            },
          },
        ],
      });
    }

    // Add TimeAnnouncementReceiver
    const receiverExists = application.receiver.some(
      (r) => r.$['android:name'] === '.TimeAnnouncementReceiver'
    );

    if (!receiverExists) {
      application.receiver.push({
        $: {
          'android:name': '.TimeAnnouncementReceiver',
          'android:enabled': 'true',
          'android:exported': 'false',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'com.android.sayTime.ANNOUNCE_TIME' } },
              { $: { 'android:name': 'android.intent.action.BOOT_COMPLETED' } },
            ],
          },
        ],
      });
    }

    return config;
  });

  // Step 2: Copy native module files to android folder
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidProjectRoot = config.modRequest.platformProjectRoot;
      
      // Source directory (in modules/)
      const sourceDir = path.join(
        projectRoot,
        'modules',
        'time-announcement',
        'android',
        'src',
        'main',
        'java',
        'com',
        'android',
        'sayTime'
      );
      
      // Destination directory (in android/)
      const destDir = path.join(
        androidProjectRoot,
        'app',
        'src',
        'main',
        'java',
        'com',
        'android',
        'sayTime'
      );
      
      // Create destination directory if it doesn't exist
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Copy all Kotlin files
      const filesToCopy = [
        'TimeAnnouncementService.kt',
        'TimeAnnouncementReceiver.kt',
        'TimeAnnouncementModule.kt',
        'TimeAnnouncementPackage.kt',
      ];
      
      filesToCopy.forEach((file) => {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);
        
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, destPath);
          console.log(`✅ Copied ${file} to android folder`);
        } else {
          console.warn(`⚠️  Source file not found: ${sourcePath}`);
        }
      });
      
      return config;
    },
  ]);

  // Step 3: Modify MainApplication to register the package
  config = withMainApplication(config, async (config) => {
    const { modResults } = config;
    let contents = modResults.contents;

    // Add import for TimeAnnouncementPackage
    if (!contents.includes('import com.android.sayTime.TimeAnnouncementPackage')) {
      // Find the package declaration and add import after it
      const packageMatch = contents.match(/package com\.android\.sayTime/);
      if (packageMatch) {
        const insertIndex = contents.indexOf('\n', packageMatch.index) + 1;
        contents = contents.slice(0, insertIndex) + 
                  '\nimport com.android.sayTime.TimeAnnouncementPackage\n' +
                  contents.slice(insertIndex);
      }
    }

    // Add package to getPackages() method
    if (!contents.includes('add(TimeAnnouncementPackage())')) {
      // Find the getPackages method and add our package
      const packagesMatch = contents.match(/override fun getPackages\(\): List<ReactPackage> =[\s\S]*?PackageList\(this\)\.packages\.apply \{/);
      if (packagesMatch) {
        const insertIndex = contents.indexOf('}', packagesMatch.index);
        const beforeClosing = contents.slice(0, insertIndex);
        const afterClosing = contents.slice(insertIndex);
        
        // Add our package before the closing brace
        contents = beforeClosing + 
                  '\n              add(TimeAnnouncementPackage())\n            ' +
                  afterClosing;
      }
    }

    modResults.contents = contents;
    return config;
  });

  return config;
};

module.exports = withTimeAnnouncementService;

