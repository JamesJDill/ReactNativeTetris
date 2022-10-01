import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

let deviceHeight = Dimensions.get('window').height;
let deviceWidth = Dimensions.get('window').width;

import { Audio, Constants } from 'expo-av';

async function playMusic() {
  await Audio.setIsEnabledAsync(true);
  let sound = new Audio.Sound();
  await sound.loadAsync(
    require('../assets/StartScreenMusic.mp3'),
    { shouldPlay: true },
    { downloadFirst: true }
  );
  sound.setIsLoopingAsync(true);
  sound.setVolumeAsync(0.1);
  await sound.playAsync();
}

export default function StartScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onPress={() => {
          playMusic()
          navigation.navigate('GameScreen');
        }}>
        <View style={styles.screen}>
          <Image
            style={styles.logo}
            source={require('../assets/228898-tetris-tetris-wallpaper.png')}
          />
          <Text style={styles.paragraph}>Tap To Play</Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#070707',
  },
  paragraph: {
    fontSize: deviceHeight / 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  screen: {
    height: deviceHeight,
    width: deviceWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: deviceHeight / 3,
    width: deviceWidth,
  },
});
