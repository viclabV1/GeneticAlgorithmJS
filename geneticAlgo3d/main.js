import './style.css'

import * as THREE from 'three'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 300 );
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector("#mainCanvas")});

renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(window.devicePixelRation);

function animate(){
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.aspect=(window.innerWidth/window.innerWidth);
  camera.updateProjectionMatrix();
  renderer.render(scene,camera);
  requestAnimationFrame(animate);
}
