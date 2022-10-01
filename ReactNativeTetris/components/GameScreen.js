import React, { useState, Component } from 'react';
import { Audio, Constants } from 'expo-av';
import GestureRecognizer, {
  swipeDirections,
} from 'react-native-swipe-gestures';
import {
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

import Tetrominoes, {nextTetromino} from './Tetrominoes';
import Grid from './Grid';

let deviceHeight = Dimensions.get('window').height;
let deviceWidth = Dimensions.get('window').width;

export default function GameScreen({ navigation }) {
  return (
    <View style={styles.container}>

      <Grid speed={250}/>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#070707',
  }
});
