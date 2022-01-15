//
//IMPORTING
//
import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { MathUtils } from 'three';
import { Clock } from 'three';

//
//SETTING UP SCENE
//
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector("#mainCanvas")});
const controls = new OrbitControls(camera, renderer.domElement);
const light = new THREE.AmbientLight(0XFFFFFF);
const clock = new THREE.Clock(true);

camera.position.set(30,20,30);
camera.lookAt(scene.position);

renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(window.devicePixelRation);

controls.autoRotate=true;
controls.autoRotateSpeed=1.0;

scene.add(light);

//
//GOAL
//
const goalGeo = new THREE.BoxGeometry(1,1,1);
const goalMat = new THREE.MeshStandardMaterial({color: 0XFF0000});
const goal = new THREE.Mesh(goalGeo, goalMat);
goal.position.set(10,10,10);
scene.add(goal);

//
//GENERATIONS
//
let motherGenes=[];
let fatherGenes=[];
let generation=0;
const agents = [];

//function for creating generation
function newGeneration(){
  //agents = [];
  for(let i = 0; i<25; i ++ ){
    addAgent();
  }
}

class agent{
  constructor(mesh,genes){
    this.mesh=mesh;
    this.genes=genes;
  }
}

//function for creating individual agent
function addAgent(){
  const agentGeometry = new THREE.SphereGeometry(0.2,10,10);
  const agentMaterial = new THREE.MeshStandardMaterial({color: 0XFFFFFF});
  const agentMesh = new THREE.Mesh(agentGeometry, agentMaterial);
  agentMesh.position.set(0,0,0);
  const genes = [];
  
  for(let i = 0; i<20; i++){
    genes.push(new THREE.Vector3(THREE.MathUtils.randFloat(-1,1),THREE.MathUtils.randFloat(-1,1),THREE.MathUtils.randFloat(-1,1)));
  }
  
  const thisAgent=new agent(agentMesh, genes);

  scene.add(thisAgent.mesh);
  agents.push(thisAgent);
}


//called for every subsequent generation
function reproduction(){
  let reproducedGenes=[];
  let mutationRate=0.1;
  for(let i = 0; i < 20; i++){
    let mutation=THREE.MathUtils.randFloat(-mutationRate,mutationRate);
    if(i<10){
      reproducedGenes.push(motherGenes[i]+mutation);
    }
    else{
      reproducedGenes.push(fatherGenes[i]+mutation);
    }
  }
  return reproducedGenes;
}

//calculates which agents were
//the first and second most fit, makes them mother and father
function survivalOfTheFittest(){
  for(let i = 0; i<25; i ++ ){
    
  }
}

//
//SIMULATION
//
let simulationSpeed=0.08;
function runSimulation(){
  let currentVector = Math.floor((clock.elapsedTime/10) * 20);
  for(let i=0; i<25; i++){
    agents[i].mesh.position.x+=(agents[i].genes[currentVector].x*simulationSpeed);
    agents[i].mesh.position.y+=(agents[i].genes[currentVector].y*simulationSpeed);
    agents[i].mesh.position.z+=(agents[i].genes[currentVector].z*simulationSpeed);

  }
}

//
//ANIMAtION
//
newGeneration();
function animate(){
  if(clock.getElapsedTime()<=10){
    runSimulation();
  }
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.aspect=(window.innerWidth/window.innerHeight);
  camera.updateProjectionMatrix();
  renderer.render(scene,camera);
  camera.lookAt(scene.position);
  controls.update();
  requestAnimationFrame(animate);
}

animate();
