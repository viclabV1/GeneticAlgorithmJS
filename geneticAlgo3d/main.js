import './style.css'

import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 300 );
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector("#mainCanvas")});
const controls = new OrbitControls(camera, renderer.domElement);

camera.position.set(30,20,30);
camera.lookAt(scene.position);

renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(window.devicePixelRation);


const goalGeo = new THREE.BoxGeometry(1,1,1);
const goalMat = new THREE.MeshStandardMaterial({color: 0XFF0000});
const goal = new THREE.Mesh(goalGeo, goalMat);
goal.position.set(10,10,10);
scene.add(goal);

controls.autoRotate=true;

const agents = [];
function addAgent(){
  const agentGeometry = new THREE.SphereGeometry(0.2,10,10);
  const agentMaterial = new THREE.MeshStandardMaterial({color: 0XFFFFFF});
  const agent = new THREE.Mesh(agentGeometry, agentMaterial);
  agent.position.set(0,0,0);
  const genes = [];
  scene.add(agent);
  agents.push(agent);
}

for(let i = 0; i<50; i ++ ){
  addAgent();
}

function survivalOfTheFittest(){
  for(let i = 0; i<50; i ++ ){

  }
}

const light = new THREE.AmbientLight(0XFFFFFF);
scene.add(light);

function animate(){
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.aspect=(window.innerWidth/window.innerWidth);
  camera.updateProjectionMatrix();
  renderer.render(scene,camera);
  camera.lookAt(scene.position);
  controls.update();
  requestAnimationFrame(animate);
}

animate();
