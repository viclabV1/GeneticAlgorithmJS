import './style.css'

import * as THREE from 'three'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 300 );
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector("#mainCanvas")});

renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(window.devicePixelRation);


const goalGeo = new THREE.BoxGeometry(10,10,10);
const goalMat = new THREE.MeshStandardMaterial({color: 0XFF0000});
const goal = new THREE.Mesh(goalGeo, goalMat);
goal.position.set(50,50,50);
scene.add(goal);

const agents = [];
function addAgent(){
  const agentGeometry = new THREE.SphereGeometry(0.05,10,10);
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
  requestAnimationFrame(animate);
}
