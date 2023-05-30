import React from "react"
import ContentLoader, { Rect, Circle, Path } from "react-content-loader/native"
import { Dimensions } from "react-native"

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const contentWidth = windowWidth - 16;
const contentHeight = windowHeight - 118;

const MyLoader = (props) => (
  <ContentLoader 
    speed={2}
    width={'100%'}
    height={'100%'}
    backgroundColor="#cfe8f7"
    foregroundColor="#ecebeb"
    {...props}
  >
    <Rect x="28" y="28" rx="2" ry="2" width="100" height="25" /> 
    <Rect x="28" y="72" rx="2" ry="2" width="150" height="15" /> 
    <Rect x="8" y="102" rx="2" ry="2" width={contentWidth} height={contentHeight} /> 
  </ContentLoader>
)

export default MyLoader
