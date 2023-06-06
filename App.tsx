import React, { useEffect, useState, useRef } from 'react'
import { StatusBar, StyleSheet, View, Text, Button, Platform, AppState, SafeAreaView } from 'react-native'
import { WebView } from 'react-native-webview'
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system'
import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import * as Application from 'expo-application';
import { Camera } from 'expo-camera';
import MyLoader from './loader';

const MAX_HOLD_TIME = 5 * 60 * 1000;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#171717'
  },
  loading: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: '#000000cc'
  },
  error: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  }
});

function displaySpinner() {
  return (
    <View style={styles.loading}>
      <MyLoader />
      <StatusBar animated barStyle="light-content"  />
    </View>
  );
}

async function sleep(second) {
  return new Promise((resolve) => {
    setTimeout(resolve, second);
  });
}

const SaveToPhone = async ({
  url: data,
  filename,
}) => {
  const base64Code = data.split("data:image/png;base64,")[1];
  const _filename = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(
    _filename,
    base64Code,
    {
      encoding: FileSystem.EncodingType.Base64,
    }
  ).catch((e) =>
    console.log('instagram share failed', e)
  )
  await MediaLibrary.saveToLibraryAsync(_filename);
}

const getDeviceId = async (): Promise<string> => {
  if (Platform.OS === 'android') {
    return Application.androidId || uuidv4();
  } else {
    let deviceId = await SecureStore.getItemAsync('deviceId');

    if (!deviceId) {
      deviceId = uuidv4(); //or generate uuid
      await SecureStore.setItemAsync('deviceId', deviceId as string);
    }
    return deviceId as string;
  }
}


let backgroundTime;
let appState = AppState.currentState;
let retryLimit = 60;
let retryCount = 0;

export default function App() {
  Camera.requestCameraPermissionsAsync();
  const webviewRef = useRef<WebView>()

  const [deviceId, setDeviceId] = useState<string>();
  const [updateFlag, setUpdateFlag] = useState(1);
  const [isNetworkConnected, setIsNetworkConnected] = useState(false);

  const handleAppStateChange = (nextAppState) => {
    if (
      (appState || '').match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // 应用程序从后台恢复到前台，检查运行时间
      const currentTime = new Date().getTime();
      if (backgroundTime && (currentTime - backgroundTime) > MAX_HOLD_TIME) {
        // 后台运行时间超过5分钟，重新加载页面
        if (webviewRef?.current) {
          webviewRef?.current?.reload?.()
        }
      }
    } else {
      // 应用程序进入后台，记录时间戳
      backgroundTime = new Date().getTime();
    }
    appState = nextAppState
  };
  useEffect(() => {
    async function checkNetwork() {
      let state = await Network.getNetworkStateAsync();

      while (!state.isConnected && retryCount < retryLimit) {
        retryCount++;
        await sleep(1000);
        state = await Network.getNetworkStateAsync();
      }

      setIsNetworkConnected(!!state.isConnected);
    }
    checkNetwork();
  }, [updateFlag]);

  useEffect(() => {
    // 添加状态变化监听器
    const handler = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // 清除状态变化监听器
      handler.remove();
    };
  }, []);

  useEffect(() => {
    getDeviceId().then(setDeviceId)
  }, []);

  if (!isNetworkConnected) {

    if (retryCount < retryLimit) {
      return displaySpinner();
    }

    return <View style={styles.error}>
      <Text>Network is not reachable, check the network and try again.</Text>
      <Button title="Reload" onPress={() => { 
        setUpdateFlag(updateFlag + 1);
       }} />
    </View>
  }

  return (
    <SafeAreaView style={styles.container}>
      {
        Platform.OS === "web" 
          ? <iframe ref={webviewRef} style={{border: 0, padding: 0, margin: 0}} src={`https://jinchan.space/relight${deviceId}`} height={'100%'} width={'100%'} />
          : <WebView
              bounces={false}
              scalesPageToFit={false}
              startInLoadingState={true}
              renderLoading={displaySpinner}
              ref={webviewRef}
              allowFileAccess={true}
              allowFileAccessFromFileURLs={true}
              allowUniversalAccessFromFileURLs={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              mixedContentMode={'always'}
              originWhitelist={['*']}
              useWebkit
              source={{ uri: `https://jinchan.space/relight?deviceId=${deviceId}`}}
              onError={(e) => {
                if ([-1100, -1009].includes(e.nativeEvent.code)) {
                  return <Button title="reload" onPress={() => { webviewRef?.current?.reload?.(); }} />
                } else {
                  return(<View>
                    <Text>Error occurred while loading the page.</Text>
                  </View>);
                }
              }}
              renderError={(errorDomain: string | undefined, errorCode: number, errorDesc: string) => {
                if ([-1100, -1009].includes(errorCode)) {
                  return <View style={styles.error}>
                    <Text>{errorDesc}</Text>
                    <Button title="reload" onPress={() => { webviewRef?.current?.reload?.(); }} />
                  </View>
                } else {
                  return(<View style={styles.error}>
                    <Text>Error occurred while loading the page.</Text>
                    <Button title="reload" onPress={() => { webviewRef?.current?.reload?.(); }} />
                  </View>);
                }
              }}
              onMessage={async (event) => {
                const data = JSON.parse(event.nativeEvent.data)
                if (data.type === 'download') {
                  SaveToPhone(data);
                  webviewRef.current?.injectJavaScript(
                    `window.getMessageComponent ? window.getMessageComponent().success('save image successfully.') : window.alert('save image successfully.')`
                  )
                }
              }}
            />
      }
      <StatusBar animated barStyle="light-content"  />
    </SafeAreaView>
  )
}
