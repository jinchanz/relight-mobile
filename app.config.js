export default {
  "expo": {
    "name": "AI照片打光",
    "slug": "RelightMobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.jinchan.RelightMobile",
      "buildNumber": "8",
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera to take photos for relighting."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "sourceExts": [
      "js",
      "jsx",
      "css",
      "ts",
      "tsx"
    ],
    "extra": {
      "eas": {
        "projectId": "107c8614-f762-425a-adba-da8397647fec"
      }
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    },
    "updates": {
      "url": "https://u.expo.dev/107c8614-f762-425a-adba-da8397647fec"
    },
    "plugins": [
      [
        "expo-media-library",
        {
          "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
          "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos."
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera."
        }
      ]
    ],
    hotVersion: '1'
  }
};
