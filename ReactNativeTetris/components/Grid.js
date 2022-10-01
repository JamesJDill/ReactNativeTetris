import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';

import { Audio, Constants } from 'expo-av';

import Tetrominoes, {
  createTetrominoGrid,
  getTetrominoCords,
} from './Tetrominoes';

let deviceHeight = Dimensions.get('window').height;
let deviceWidth = Dimensions.get('window').width;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

async function playClearLine() {
  await Audio.setIsEnabledAsync(true);
  let sound = new Audio.Sound();
  await sound.loadAsync(
    require('../assets/clear.wav'),
    { shouldPlay: true },
    { downloadFirst: true }
  );
  sound.setIsLoopingAsync(false);
  sound.setVolumeAsync(0.1);
  await sound.playAsync();
}

async function nextBlock() {
  await Audio.setIsEnabledAsync(true);
  let sound = new Audio.Sound();
  await sound.loadAsync(
    require('../assets/fall.wav'),
    { shouldPlay: true },
    { downloadFirst: true }
  );
  sound.setIsLoopingAsync(false);
  sound.setVolumeAsync(0.2);
  await sound.playAsync();
}

export default class Grid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tetrominoes: this.generateTetrominoes(),
      cellColors: this.createCellColors(),
      cords: this.startCords(),
      text: 'Tap Here To Play',
      score: 0,
      currentTetromino: 0,
      dx: 0,
      dy: 0,
      gameOver: true,
    };
    this.speed = this.props.speed;
  }

  componentDidMount() {
    this.updateCurrentTetromino();
  }

  createCellColors() {
    var grid = [];

    for (var i = 0; i < 20; i++) {
      grid.push([
        'white',
        'white',
        'white',
        'white',
        'white',
        'white',
        'white',
        'white',
        'white',
        'white',
      ]);
    }
    return grid;
  }

  generateTetrominoes() {
    var tetrominoes = [<Tetrominoes type="L" color="red" rotation={0} />];
    for (var i = 0; i < 5; i++) {
      tetrominoes.push({ id: i, ...this.createRandomTetromino() });
    }
    return tetrominoes;
  }

  startCords() {
    var startTetro = <Tetrominoes type="L" color="red" rotation={0} />;

    var startTetroGrid = createTetrominoGrid(
      startTetro.props.type,
      startTetro.props.color,
      startTetro.props.rotation
    );
    var coords = getTetrominoCords(startTetroGrid);

    for (var i = 0; i < 4; i++) {
      coords[0][i] += 3;
    }
    return coords;
  }

  currCords() {
    var currTetro = this.state.tetrominoes[this.state.currentTetromino];
    var currTetroGrid = createTetrominoGrid(
      currTetro.props.type,
      currTetro.props.color,
      currTetro.props.rotation
    );
    var coords = getTetrominoCords(currTetroGrid);

    for (var i = 0; i < 4; i++) {
      coords[0][i] += 3;
    }

    if (currTetro.props.type == 'O') {
      for (i = 0; i < 4; i++) {
        coords[0][i] += 1;
      }
    }
    return coords;
  }

  createRandomTetromino() {
    var types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    var colors = [
      'yellow',
      'purple',
      'red',
      'blue',
      'orange',
      'green',
      'skyblue',
    ];
    var object = {
      type: types[getRandomInt(0, 7)],
      color: colors[getRandomInt(0, 7)],
    };
    return (
      <Tetrominoes
        type={object.type}
        color={object.color}
        rotation={getRandomInt(0, 4)}
      />
    );
  }

  startGame() {
    this.setState({
      gameOver: false,
      text: '',
      score: 0,
      currentTetromino: 0,
      dx: 0,
      dy: 0,
      cords: this.startCords(),
      cellColors: this.createCellColors(),
      tetrominoes: this.generateTetrominoes(),
    });

    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.update();
    }, this.speed);
  }

  update() {
    this.updateCurrentTetromino();
    if (!this.isGameOver()) {
      this.updateCurrentTetromino();
      this.moveDown();
      this.updateCurrentTetromino();
      this.loadNext();
    } else if (!this.canMoveDown() && !this.canLoad()) {
      this.gameOver();
    }
  }

  clearRows() {
    if (this.canClearRows()) {
      var tempCellColors = this.state.cellColors;
      var count = 0;

      for (var i = 19; i > 0; i--) {
        if (this.canClearRow(i)) {
          for (var j = 0; j < 10; j++) {
            tempCellColors[i][j] = 'white';
          }
          tempCellColors = this.shiftCellColors(tempCellColors, i);
          count += 1;
          i += 1;
        }
      }

      this.setState({ cellColors: tempCellColors });
      if (count == 4) {
        this.setState({ score: this.state.score + 1200 });
      } else if (count == 3) {
        this.setState({ score: this.state.score + 400 });
      } else if (count == 2) {
        this.setState({ score: this.state.score + 120 });
      } else {
        this.setState({ score: this.state.score + 40 });
      }
      playClearLine();
    }
  }

  shiftCellColors(cellColors, start) {
    var temp = cellColors;
    for (var x = 0; x < 10; x++) {
      for (var y = start; y > 0; y--) {
        if (temp[y][x] == 'white' && temp[y - 1][x] != 'white') {
          temp[y][x] = temp[y - 1][x];
          temp[y - 1][x] = 'white';
        }
      }
    }

    return temp;
  }

  canClearRow(row) {
    var temp = this.state.cellColors;
    for (var i = 0; i < 10; i++) {
      if (temp[row][i] == 'white') {
        return false;
      }
    }
    return true;
  }

  canClearRows() {
    var tempColors = this.state.cellColors;

    for (var i = 0; i < 20; i++) {
      var can = true;

      for (var j = 0; j < 10; j++) {
        if (tempColors[i][j] == 'white') {
          can = false;
        }
      }

      if (can) {
        return true;
      }
    }
    return false;
  }

  gameOver() {
    clearInterval(this.interval);
    this.setState({ gameOver: true, text: 'GAME OVER' });
    console.log('Game Over!');
  }

  isGameOver() {
    if (this.state.gameOver == true) {
      return true;
    }
    return false;
  }

  canLoad() {
    var nextTetro = this.state.tetrominoes[this.state.currentTetromino + 1];
    var nextTetroGrid = createTetrominoGrid(
      nextTetro.props.type,
      nextTetro.props.color,
      nextTetro.props.rotation
    );

    var coords = getTetrominoCords(nextTetroGrid);

    for (var i = 0; i < 4; i++) {
      coords[0][i] += 3;
    }

    if (nextTetro.props.type == 'O') {
      for (i = 0; i < 4; i++) {
        coords[0][i] += 1;
      }
    }

    for (i = 0; i < 4; i++) {
      var x = coords[0][i];
      var y = coords[1][i];

      if (this.state.cellColors[y][x] != 'white') {
        return false;
      }
    }
    return true;
  }

  loadNext() {
    if (!this.canMoveDown() && this.canLoad()) {
      this.clearRows();
      var newTetro = this.createRandomTetromino();
      var tempTetros = this.state.tetrominoes;
      tempTetros.push(newTetro);

      var currTetro = this.state.tetrominoes[this.state.currentTetromino + 1];
      var currTetroGrid = createTetrominoGrid(
        currTetro.props.type,
        currTetro.props.color,
        currTetro.props.rotation
      );
      var coords = getTetrominoCords(currTetroGrid);

      for (var i = 0; i < 4; i++) {
        coords[0][i] += 3;
      }

      if (currTetro.props.type == 'O') {
        for (i = 0; i < 4; i++) {
          coords[0][i] += 1;
        }
      }
      if (!this.canClearRows()) {
        nextBlock();
      }
      this.setState({
        currentTetromino: this.state.currentTetromino + 1,
        tetrominoes: tempTetros,
        score: this.state.score + 10,
        cords: coords,
        dx: 0,
        dy: 0,
      });

      clearInterval(this.interval);
      this.interval = setInterval(() => {
        this.update();
      }, this.speed);
    } else if (!this.canLoad() && !this.canMoveDown()) {
      this.gameOver();
    }
  }

  updateCurrentTetromino() {
    var coords = this.state.cords;
    var tempColorGrid = this.state.cellColors;
    //console.log(tempColorGrid[0]);
    //console.log(this.state.cords[0]);
    //console.log(this.state.cords[1]);

    for (var i = 0; i < 4; i++) {
      var x = coords[0][i];
      var y = coords[1][i];
      tempColorGrid[y][x] = this.state.tetrominoes[
        this.state.currentTetromino
      ].props.color;
    }

    this.setState({ cellColors: tempColorGrid });
  }

  isCurrentPoint(x, y) {
    for (var i = 0; i < 4; i++) {
      if (x == this.state.cords[0][i] && y == this.state.cords[1][i]) {
        return true;
      }
    }
    return false;
  }

  isNewPoint(x, y, arr) {
    for (var i = 0; i < 4; i++) {
      if (x == arr[0][i] && y == arr[1][i]) {
        return true;
      }
    }
    return false;
  }

  moveLeft() {
    if (this.canMoveLeft()) {
      var temp = this.state.cords;
      for (var i = 0; i < 4; i++) {
        temp[0][i] -= 1;
      }
      this.setState({ cords: temp, dx: this.state.dx - 1 });
      this.moveLeftUpdate();

      this.updateCurrentTetromino();
    }
  }

  canMoveLeft() {
    var can = true;

    for (var i = 0; i < 4; i++) {
      var x = this.state.cords[0][i];
      var y = this.state.cords[1][i];

      if (
        x == 0 ||
        (this.state.cellColors[y][x - 1] != 'white' &&
          !this.isCurrentPoint(x - 1, y))
      ) {
        can = false;
      }
    }
    return can;
  }

  moveLeftUpdate() {
    var cellColorsTemp = this.state.cellColors;
    for (var i = 0; i < 4; i++) {
      var x = this.state.cords[0][i];
      var y = this.state.cords[1][i];

      if (x >= 0 && this.isCurrentPoint(x + 1, y) == false) {
        cellColorsTemp[y][x + 1] = 'white';
      }
      cellColorsTemp[y][x] = this.state.tetrominoes[
        this.state.currentTetromino
      ].props.color;
    }
    this.setState({ cellColors: cellColorsTemp });
  }

  moveRight() {
    if (this.canMoveRight()) {
      var temp = this.state.cords;
      for (var i = 0; i < 4; i++) {
        temp[0][i] += 1;
      }
      this.setState({ cords: temp, dx: this.state.dx + 1 });
      this.moveRightUpdate();

      this.updateCurrentTetromino();
    }
  }

  canMoveRight() {
    var can = true;

    for (var i = 0; i < 4; i++) {
      var x = this.state.cords[0][i];
      var y = this.state.cords[1][i];

      if (
        x == 10 ||
        (this.state.cellColors[y][x + 1] != 'white' &&
          !this.isCurrentPoint(x + 1, y))
      ) {
        can = false;
      }
    }
    return can;
  }

  moveRightUpdate() {
    var cellColorsTemp = this.state.cellColors;
    for (var i = 0; i < 4; i++) {
      var x = this.state.cords[0][i];
      var y = this.state.cords[1][i];

      if (x < 10 && this.isCurrentPoint(x - 1, y) == false) {
        cellColorsTemp[y][x - 1] = 'white';
      }
      cellColorsTemp[y][x] = this.state.tetrominoes[
        this.state.currentTetromino
      ].props.color;
    }
    this.setState({ cellColors: cellColorsTemp });
  }

  moveDown() {
    if (this.canMoveDown()) {
      var temp = this.state.cords;
      for (var i = 0; i < 4; i++) {
        temp[1][i] += 1;
      }
      this.setState({ cords: temp, dy: this.state.dy + 1 });
      this.moveDownUpdate();
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        this.update();
      }, this.speed);
    }
  }

  canMoveDown() {
    var can = true;

    for (var i = 0; i < 4; i++) {
      var x = this.state.cords[0][i];
      var y = this.state.cords[1][i];

      if (
        y >= 19 ||
        (this.state.cellColors[y + 1][x] != 'white' &&
          this.isCurrentPoint(x, y + 1) == false)
      ) {
        can = false;
      }
    }
    return can;
  }

  moveDownUpdate() {
    var cellColorsTemp = this.state.cellColors;
    for (var i = 0; i < 4; i++) {
      var x = this.state.cords[0][i];
      var y = this.state.cords[1][i];

      if (y > 0 && this.isCurrentPoint(x, y - 1) == false) {
        cellColorsTemp[y - 1][x] = 'white';
      }
      cellColorsTemp[y][x] = this.state.tetrominoes[
        this.state.currentTetromino
      ].props.color;
    }
    this.setState({ cellColors: cellColorsTemp });
  }

  rotate() {
    var currCords = this.state.cords;
    var currTetro = this.state.tetrominoes[this.state.currentTetromino];

    var newRotation = currTetro.props.rotation;
    if (newRotation == 3) {
      newRotation = 0;
    } else {
      newRotation += 1;
    }

    var newTetroGrid = createTetrominoGrid(
      currTetro.props.type,
      currTetro.props.color,
      newRotation
    );

    var coords = getTetrominoCords(newTetroGrid);
    for (var i = 0; i < 4; i++) {
      coords[0][i] += 3;
      coords[0][i] += this.state.dx;
      coords[1][i] += this.state.dy;
    }

    var newTetro = (
      <Tetrominoes
        type={currTetro.props.type}
        color={currTetro.props.color}
        rotation={newRotation}
      />
    );
    var tempTetrominoes = this.state.tetrominoes;
    tempTetrominoes[this.state.currentTetromino] = newTetro;

    var tempCellColors = this.state.cellColors;
    for (i = 0; i < 4; i++) {
      var old_x = currCords[0][i];
      var old_y = currCords[1][i];
      if (!this.isNewPoint(old_x, old_y, coords)) {
        tempCellColors[old_y][old_x] = 'white';
      }
    }
    if (this.canRotate(coords)) {
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        this.setState({
          cords: coords,
          tetrominoes: tempTetrominoes,
          cellColors: tempCellColors,
        });
        this.update();
      }, this.speed);
    }
  }

  canRotate(coords) {
    if (this.state.tetrominoes[this.state.currentTetromino].props.type == 'O') {
      return false;
    }

    for (var i = 0; i < 4; i++) {
      var x = coords[0][i];
      var y = coords[1][i];

      if (x < 0 || x > 9) {
        return false;
      } else if (y < 0 || y > 19) {
        return false;
      } else if (
        this.state.cellColors[y][x] != 'white' &&
        !this.isCurrentPoint(x, y)
      ) {
        return false;
      }
    }
    return true;
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              this.startGame();
            }}>
            <Text style={styles.gameText}>{this.state.text}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.scoreBoard}>
          <Text style={styles.scoreText}>{this.state.score}</Text>
        </View>

        <View style={styles.container}>
          <TouchableOpacity
            style={styles.grid}
            activeOpacity={0.999}
            onPress={() => {
              if (!this.isGameOver()) {
                this.rotate();
              } else {
                this.startGame();
              }
            }}>
            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[0][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[0][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[0][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[0][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[0][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[0][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[0][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[0][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[0][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[0][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[1][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[1][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[1][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[1][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[1][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[1][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[1][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[1][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[1][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[1][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[2][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[2][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[2][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[2][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[2][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[2][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[2][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[2][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[2][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[2][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[3][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[3][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[3][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[3][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[3][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[3][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[3][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[3][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[3][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[3][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[4][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[4][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[4][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[4][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[4][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[4][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[4][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[4][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[4][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[4][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[5][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[5][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[5][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[5][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[5][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[5][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[5][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[5][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[5][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[5][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[6][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[6][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[6][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[6][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[6][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[6][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[6][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[6][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[6][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[6][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[7][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[7][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[7][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[7][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[7][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[7][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[7][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[7][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[7][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[7][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[8][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[8][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[8][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[8][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[8][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[8][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[8][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[8][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[8][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[8][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[9][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[9][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[9][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[9][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[9][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[9][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[9][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[9][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[9][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[9][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[10][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[10][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[10][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[10][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[10][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[10][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[10][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[10][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[10][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[10][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[11][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[11][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[11][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[11][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[11][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[11][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[11][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[11][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[11][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[11][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[12][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[12][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[12][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[12][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[12][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[12][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[12][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[12][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[12][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[12][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[13][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[13][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[13][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[13][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[13][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[13][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[13][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[13][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[13][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[13][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[14][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[14][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[14][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[14][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[14][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[14][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[14][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[14][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[14][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[14][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[15][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[15][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[15][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[15][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[15][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[15][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[15][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[15][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[15][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[15][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[16][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[16][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[16][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[16][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[16][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[16][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[16][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[16][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[16][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[16][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[17][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[17][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[17][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[17][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[17][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[17][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[17][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[17][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[17][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[17][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[18][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[18][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[18][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[18][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[18][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[18][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[18][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[18][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[18][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[18][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>

            <View style={styles.row}>
              <View
                style={{
                  backgroundColor: this.state.cellColors[19][0],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[19][1],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[19][2],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[19][3],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[19][4],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[19][5],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[19][6],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[19][7],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[19][8],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
              <View
                style={{
                  backgroundColor: this.state.cellColors[19][9],
                  height: deviceWidth * 0.085 * 0.9,
                  width: deviceWidth * 0.085 * 0.9,
                  borderColor: 'black',
                  borderWidth: 1,
                }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity
            onPress={() => {
              if (!this.isGameOver()) {
                this.moveLeft();
              }
            }}
            style={styles.button}>
            <Text style={styles.buttonText}>{'<'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (!this.isGameOver()) {
                this.moveRight();
              }
            }}
            style={styles.button}>
            <Text style={styles.buttonText}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#070707',
  },
  topBar: {
    alignItems: 'center',
    justifyContent: 'center',
    height: deviceHeight / 10,
    width: deviceWidth * 0.9,
  },
  scoreBoard: {
    alignItems: 'center',
    height: deviceHeight / 20,
  },
  scoreText: {
    textAlign: 'center',
    color: 'white',
    fontSize: deviceHeight / 25,
    alignItems: 'right',
    fontWeight: 'bold',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  grid: {
    width: deviceWidth * 0.85 * 0.9,
    height: deviceWidth * 1.7 * 0.9,
  },
  buttons: {
    width: deviceWidth,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
  },
  buttonText: {
    fontSize: deviceHeight / 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    justifyContent: 'center',
  },
  gameText: {
    paddingTop: deviceHeight / 20,
    fontSize: deviceHeight / 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
});
