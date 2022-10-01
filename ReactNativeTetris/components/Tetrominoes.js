import React, { Component } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

let deviceHeight = Dimensions.get('window').height;
let deviceWidth = Dimensions.get('window').width;

export function createTetrominoGrid(type, color, rotation) {
  var grid_2x2 = [
    [col, col],
    [col, col],
  ];
  var grid_4x4 = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  var grid_3x3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  var col = 0;
  if (color == 'red') {
    col = 1;
  } else if (color == 'blue') {
    col = 2;
  } else if (color == 'orange') {
    col = 3;
  } else if (color == 'green') {
    col = 4;
  } else if (color == 'yellow') {
    col = 5;
  } else if (color == 'skyblue') {
    col = 6;
  } else {
    col = 7;
  }
  // x - a square or filled cell
  // * - an empty cell
  //                        * * x *
  //                        * * x *
  //                        * * x *
  //                        * * x *
  if (type == 'I' && rotation == 0) {
    grid_4x4[0][2] = col;
    grid_4x4[1][2] = col;
    grid_4x4[2][2] = col;
    grid_4x4[3][2] = col;
    return grid_4x4;
    //                      * * * *
    //                      * * * *
    //                      x x x x
    //                      * * * * 
  } else if(type == 'I' && rotation == 1) {
    grid_4x4[2][0] = col;
    grid_4x4[2][1] = col;
    grid_4x4[2][2] = col;
    grid_4x4[2][3] = col;
    return grid_4x4;
    //                      * x * *
    //                      * x * *
    //                      * x * *
    //                      * x * *
  } else if(type == 'I' && rotation == 2) {
    grid_4x4[0][1] = col;
    grid_4x4[1][1] = col;
    grid_4x4[2][1] = col;
    grid_4x4[3][1] = col;
    return grid_4x4;
    //                      * * * *
    //                      x x x x
    //                      * * * *
    //                      * * * *
  } else if(type == 'I' && rotation == 3) {
    grid_4x4[1][0] = col;
    grid_4x4[1][1] = col;
    grid_4x4[1][2] = col;
    grid_4x4[1][3] = col;
    return grid_4x4;
    //                      * * * *
    //                      * x x *
    //                      * x x *
    //                      * * * *
  } else if (type == 'O') {
    grid_2x2 = [
      [col, col],
      [col, col],
    ];
    return grid_2x2;
    //                      * x *
    //                      x x x
    //                      * * *
  } else if (type == 'T' && rotation == 0) {
    grid_3x3[0][1] = col;
    grid_3x3[1][0] = col;
    grid_3x3[1][1] = col;
    grid_3x3[1][2] = col;
    return grid_3x3;
    //                      * x * 
    //                      * x x 
    //                      * x * 
  } else if(type == 'T' && rotation == 1) {
    grid_3x3[0][1] = col;
    grid_3x3[1][1] = col;
    grid_3x3[1][2] = col;
    grid_3x3[2][1] = col;
    return grid_3x3;
    //                      * * * 
    //                      x x x 
    //                      * x * 
  } else if(type == 'T' && rotation == 2) {
    grid_3x3[1][0] = col;
    grid_3x3[1][1] = col;
    grid_3x3[1][2] = col;
    grid_3x3[2][1] = col;
    return grid_3x3;
    //                      * x * 
    //                      x x * 
    //                      * x * 
  } else if(type == 'T' && rotation == 3) {
    grid_3x3[0][1] = col;
    grid_3x3[1][0] = col;
    grid_3x3[1][1] = col;
    grid_3x3[2][1] = col;
    return grid_3x3;
    //                      * x x
    //                      x x *
    //                      * * *
  } else if (type == 'S' && rotation == 0) {
    grid_3x3[0][1] = col;
    grid_3x3[0][2] = col;
    grid_3x3[1][0] = col;
    grid_3x3[1][1] = col;
    return grid_3x3;
    //                      * x * 
    //                      * x x 
    //                      * * x 
  } else if(type == 'S' && rotation == 1) {
    grid_3x3[0][1] = col;
    grid_3x3[1][1] = col;
    grid_3x3[1][2] = col;
    grid_3x3[2][2] = col;
    return grid_3x3;
    //                      * * * 
    //                      * x x 
    //                      x x * 
  } else if(type == 'S' && rotation == 2) {
    grid_3x3[1][1] = col;
    grid_3x3[1][2] = col;
    grid_3x3[2][0] = col;
    grid_3x3[2][1] = col;
    return grid_3x3;
    //                      x * * 
    //                      x x * 
    //                      * x * 
  } else if(type == 'S' && rotation == 3) {
    grid_3x3[0][0] = col;
    grid_3x3[1][0] = col;
    grid_3x3[1][1] = col;
    grid_3x3[2][1] = col;
    return grid_3x3;
    //                      x x *
    //                      * x x
    //                      * * *
  } else if (type == 'Z' && rotation == 0) {
    grid_3x3[0][0] = col;
    grid_3x3[0][1] = col;
    grid_3x3[1][1] = col;
    grid_3x3[1][2] = col;
    return grid_3x3;
    //                      * * x 
    //                      * x x 
    //                      * x * 
  } else if(type == 'Z' && rotation == 1) {
    grid_3x3[0][2] = col;
    grid_3x3[1][1] = col;
    grid_3x3[1][2] = col;
    grid_3x3[2][1] = col;
    return grid_3x3;
    //                      * * * 
    //                      x x * 
    //                      * x x 
  } else if(type == 'Z' && rotation == 2) {
    grid_3x3[1][0] = col;
    grid_3x3[1][1] = col;
    grid_3x3[2][1] = col;
    grid_3x3[2][2] = col;
    return grid_3x3;
    //                      * x * 
    //                      x x * 
    //                      x * * 
  } else if(type == 'Z' && rotation == 3) {
    grid_3x3[0][1] = col;
    grid_3x3[1][0] = col;
    grid_3x3[1][1] = col;
    grid_3x3[2][0] = col;
    return grid_3x3;
    //                      x * *
    //                      x x x
    //                      * * *
  } else if (type == 'J' && rotation == 0) {
    grid_3x3[0][0] = col;
    grid_3x3[1][0] = col;
    grid_3x3[1][1] = col;
    grid_3x3[1][2] = col;
    return grid_3x3;
    //                      * x x 
    //                      * x * 
    //                      * x * 
  } else if(type == 'J' && rotation == 1) {
    grid_3x3[0][1] = col;
    grid_3x3[0][2] = col;
    grid_3x3[1][1] = col;
    grid_3x3[2][1] = col;
    return grid_3x3;
    //                      * * * 
    //                      x x x 
    //                      * * x 
  } else if(type == 'J' && rotation == 2) {
    grid_3x3[1][0] = col;
    grid_3x3[1][1] = col;
    grid_3x3[1][2] = col;
    grid_3x3[2][2] = col;
    return grid_3x3;
    //                      * x * 
    //                      * x * 
    //                      x x * 
  } else if(type == 'J' && rotation == 3) {
    grid_3x3[0][1] = col;
    grid_3x3[1][1] = col;
    grid_3x3[2][0] = col;
    grid_3x3[2][1] = col;
    return grid_3x3;
    //                      * * x
    //                      x x x
    //                      * * *
  } else if (type == 'L' && rotation == 0) {
    grid_3x3[0][2] = col;
    grid_3x3[1][0] = col;
    grid_3x3[1][1] = col;
    grid_3x3[1][2] = col;
    return grid_3x3;
    //                      * x * 
    //                      * x * 
    //                      * x x 
  } else if(type == 'L' && rotation == 1) {
    grid_3x3[0][1] = col;
    grid_3x3[1][1] = col;
    grid_3x3[2][1] = col;
    grid_3x3[2][2] = col;
    return grid_3x3;
    //                      * * * 
    //                      x x x 
    //                      x * * 
  } else if(type == 'L' && rotation == 2) {
    grid_3x3[1][0] = col;
    grid_3x3[1][1] = col;
    grid_3x3[1][2] = col;
    grid_3x3[2][0] = col;
    return grid_3x3;
    //                      x x * 
    //                      * x * 
    //                      * x * 
  } else if(type == 'L' && rotation == 3) {
    grid_3x3[0][0] = col;
    grid_3x3[0][1] = col;
    grid_3x3[1][1] = col;
    grid_3x3[2][1] = col;
    return grid_3x3;
  }
}

export function getTetrominoCords(arr) {
  var size = arr.length;
  var xcords = [];
  var ycords = [];

  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      if (arr[i][j] != 0) {
        xcords.push(j);
        ycords.push(i);
      }
    }
  }
  return [xcords, ycords];
}

export default class Tetrominoes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: props.type,
      color: props.color,
      rotation: props.rotation,
      grid: [],
    };
  }
}
