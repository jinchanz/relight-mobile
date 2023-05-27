import React from "react"
import ContentLoader, { Rect, Circle, Path } from "react-content-loader/native"
import { Dimensions } from "react-native"

const windowWidth = Dimensions.get('window').width
const contentWidth = windowWidth - 64;

const MyLoader = (props) => (
  <ContentLoader 
    speed={2}
    width={'100%'}
    height={'100%'}
    backgroundColor="#cfe8f7"
    foregroundColor="#ecebeb"
    {...props}
  >
    <Circle cx="47" cy="28" r="15" /> 
    <Rect x="32" y="50" rx="2" ry="2" width="140" height="10" /> 
    <Rect x="32" y="100" rx="2" ry="2" width={contentWidth} height={contentWidth * 3 / 4} /> 
    <Rect x="32" y={100 + (contentWidth * 3 / 4) + 16} rx="0" ry="0" width={contentWidth} height="100" /> 
  </ContentLoader>
)

export default MyLoader
