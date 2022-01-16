//
//IMPORTING
//
import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { MathUtils } from 'three';
import { Clock } from 'three';
import { Vector3 } from 'three';

//
//SETTING UP SCENE
//
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 300);
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector("#mainCanvas")});
const controls = new OrbitControls(camera, renderer.domElement);
const light = new THREE.AmbientLight(0XFFFFFF);
const clock = new THREE.Clock(true);

camera.position.set(30,20,30);
camera.lookAt(new THREE.Vector3(10,10,10));

renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

controls.autoRotate=true;
controls.autoRotateSpeed=1.0;
controls.target.set(5,5,5);

scene.add(light);

//grid
const material = new THREE.LineBasicMaterial( { color: 0xffffff } );
const points = [];
points.push( new THREE.Vector3( 0, 0, 0 ) );
points.push( new THREE.Vector3( 0, 10, 0 ) );
points.push( new THREE.Vector3( 0, 0, 0 ) );
points.push( new THREE.Vector3( 10, 0, 0 ) );
points.push( new THREE.Vector3( 0, 0, 0 ) );
points.push( new THREE.Vector3( 0, 0, 10 ) );


const geometry = new THREE.BufferGeometry().setFromPoints( points );

const line = new THREE.Line( geometry, material );

scene.add(line);





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
let agents = [];

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
  let agentMesh = new THREE.Mesh(agentGeometry, agentMaterial);
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
let fittestDone=false;
function survivalOfTheFittest(){
  const fittestMaterial = new THREE.MeshStandardMaterial({color: 0X00FF00});
  const agentGeometry = new THREE.SphereGeometry(0.2,10,10);
  const zeroVector = new THREE.Vector3(0,0,0);
  const maxDistance=zeroVector.distanceTo(goal.position);
  let fitness=0;
  let fittest=0;
  let fittestIndex=0;
  let secondFittest=0;
  let secondFittestIndex=0;
  let thisDistance=0;
  for(let i = 0; i<25; i ++ ){
    thisDistance=agents[i].mesh.position.distanceTo(goal.position);
    fitness = 1-(thisDistance/maxDistance);
    if(fitness>secondFittest){
      secondFittest=fitness;
      secondFittestIndex=i;
    }
    if(fitness>fittest){
      secondFittest=fittest;
      secondFittestIndex=fittestIndex;
      fittest=fitness;
      fittestIndex=i;
    }
    console.log(fitness);
  }
  agents[fittestIndex].mesh.material.color.set(0X00FF00);
  agents[secondFittestIndex].mesh.material.color.set(0X00FF00);

  motherGenes=agents[fittestIndex].genes;
  fatherGenes=agents[secondFittestIndex].genes;

  console.log('fittest', fittestIndex, ' ', fittest );
  console.log('2ndfittest', secondFittestIndex, ' ', secondFittest );

}

//
//SIMULATION
//
let simulationSpeed=0.08;
let currentVector=0;
function runSimulation(){
  currentVector = Math.floor((clock.elapsedTime/10) * 20);
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
let cleared=false;

function animate(){
  if(clock.getElapsedTime()<=10 && currentVector<25){
    runSimulation();
  }
  else if(clock.getElapsedTime()<=15 && !fittestDone){
    survivalOfTheFittest();
    fittestDone=true;
    cleared=false;
  }
  else if(clock.getElapsedTime()>=15 && !cleared){
    //clock.stop();
    //clock.start();
    fittestDone=false;
    for(let i = 0; i < 25; i++){
      scene.remove(agents[i].mesh)
    }
    agents = [];
    cleared=true;

  }
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.aspect=(window.innerWidth/window.innerHeight);
  camera.updateProjectionMatrix();
  renderer.render(scene,camera);
  camera.lookAt(5,5,5);
  controls.update();
  requestAnimationFrame(animate);
}

animate();
