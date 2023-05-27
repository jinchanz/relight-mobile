import React from 'react'
import { useEffect, useRef } from 'react'
import { BackHandler, StatusBar, StyleSheet, View, Text, Button, ActivityIndicator } from 'react-native'
import { WebView } from 'react-native-webview'
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system'
import MyLoader from './loader';

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


export default function App() {
  const webviewRef = useRef<WebView>()
  let lastBackPressed = 0

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      if (lastBackPressed && lastBackPressed + 2000 >= +new Date()) {
        BackHandler.exitApp()
        return false
      }
      lastBackPressed = +new Date()
      webviewRef.current.goBack()
      return true
    })
    return () => {
      BackHandler.removeEventListener('hardwareBackPress')
    }
  }, [])

  // save image
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
    webviewRef.current?.injectJavaScript(
      `window.getMessageComponent ? window.getMessageComponent().success('save image successfully.') : window.alert('save image successfully.')`
    )
  }

  return (
    <View style={styles.container}>
      <WebView
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
        source={{ uri: `https://jinchan.space/relight?t=121`}}
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
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data)
          if (data.type === 'download') {
            SaveToPhone(data)
          }
        }}
      ></WebView>
      <StatusBar hidden />
    </View>
  )
}
