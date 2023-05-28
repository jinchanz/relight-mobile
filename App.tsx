import React, { useEffect, useState } from 'react'
import { useRef } from 'react'
import { StatusBar, StyleSheet, View, Text, Button, Platform } from 'react-native'
import { WebView } from 'react-native-webview'
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system'
import * as Network from 'expo-network';

import { Camera } from 'expo-camera';
import MyLoader from './loader';
import { default as appInfo } from './app.config';

const { expo } = appInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
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
      {/* <ActivityIndicator size="large" /> */}
      <MyLoader />
    </View>
  );
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

export default function App() {
  Camera.requestCameraPermissionsAsync();
  const webviewRef = useRef<WebView>()

  const [updateFlag, setUpdateFlag] = useState(1);
  const [isNetworkConnected, setIsNetworkConnected] = useState(false);

  useEffect(() => {
    async function checkNetwork() {
      const state = await Network.getNetworkStateAsync();
      setIsNetworkConnected(!!state.isConnected);
    }
    checkNetwork();
  }, [updateFlag]);

  if (!isNetworkConnected) {
    return <View style={styles.error}>
      <Text>Network is not reachable, check the network and try again.</Text>
      <Button title="Reload" onPress={() => { 
        setUpdateFlag(updateFlag + 1);
       }} />
    </View>
  }

  return (
    <View style={styles.container}>
      {
        Platform.OS === "web" 
          ? <iframe ref={webviewRef} style={{border: 0, padding: 0, margin: 0}} src="https://jinchan.space/relight" height={'100%'} width={'100%'} />
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
              source={{ uri: `https://jinchan.space/relight`}}
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
      <StatusBar hidden />
      <View style={
        {
          position: 'absolute',
          alignItems: 'center',
          width: '100%',
          bottom: 12,
        }
      }>
        <Text style={{ color: '#66666666' }}>
          { `v${expo?.version}${Platform.OS === 'ios' ? ('-' + expo.ios.buildNumber) : ''}-${expo.hotVersion}` }
        </Text>
      </View>
    </View>
  )
}
