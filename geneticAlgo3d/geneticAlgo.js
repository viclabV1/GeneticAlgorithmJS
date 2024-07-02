//
//IMPORTING
//
import './geneticAlgoStyles.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { MathUtils } from 'three';
import { Clock } from 'three';
import { Vector3 } from 'three';
import {GUI} from 'lil-gui';

//
// UI
//
const gui = new GUI();
const guiControlPanel = gui.add(document, "Hyperparameters");
const simHyperParams = {
  entityCount: 5,
  mutRate: 1,
  geneCount: 50
};
gui.add(simHyperParams, 'entityCount', 5, 2000, 1);
gui.add(simHyperParams, 'mutRate', 1, 15, 1);
gui.add(simHyperParams, 'geneCount', 50, 1000, 1);
//
//SETTING UP SCENE
//
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 300);
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector("#geneCanvas")});
const controls = new OrbitControls(camera, renderer.domElement);
const light = new THREE.AmbientLight(0XFFFFFF);
const clock = new THREE.Clock(true);

camera.position.set(40,20,30);
camera.lookAt(new THREE.Vector3(10,10,10));

renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

controls.autoRotate=true;
controls.autoRotateSpeed=1.0;
controls.target.set(10,10,10);

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
//CONTROLLABLE VARIABLES
//
let agentNumber = 5;
let rateOfMutation=0.9;
let geneSize=100;
let simulationSpeed=0.08;

//
//GOAL
//
const goalGeo = new THREE.BoxGeometry(1,1,1);
const goalEdges = new THREE.EdgesGeometry(goalGeo);
const goalEdgeLines = new THREE.LineSegments(goalEdges, new THREE.LineBasicMaterial( { color: 0xffffff } ) ); 
const goalMat = new THREE.MeshStandardMaterial({color: 0XFF0000});
const goal = new THREE.Mesh(goalGeo, goalMat);
goalEdgeLines.position.set(20,20,20);
goal.position.set(20,20,20);
scene.add(goal);
scene.add(goalEdgeLines)
var generationDisplay=document.getElementById("domGenerationCount");

//
//GENERATIONS
//
let motherGenes=[];
let fatherGenes=[];
let generation=0;
let agents = [];

//function for creating generation
function newGeneration(){
  for(let i = 0; i<agentNumber; i ++ ){
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
  let mutationX=0;
  let mutationY=0;
  let mutationZ=0;
  let mutationVector=new THREE.Vector3(0,0,0);
  let mutatedVector=new THREE.Vector3(0,0,0);
  let mutationRate=rateOfMutation;
  if(generation<1){
    for(let i = 0; i<geneSize; i++){
      genes.push(new THREE.Vector3(THREE.MathUtils.randFloat(-mutationRate,mutationRate),THREE.MathUtils.randFloat(-mutationRate,mutationRate),THREE.MathUtils.randFloat(-mutationRate,mutationRate)));
    }
  }
  else{
    for(let i = 0; i<geneSize; i++){
      if(i<(geneSize/2)){
      mutationX=THREE.MathUtils.randFloat(-mutationRate,mutationRate);
      mutationY=THREE.MathUtils.randFloat(-mutationRate,mutationRate);
      mutationZ=THREE.MathUtils.randFloat(-mutationRate,mutationRate);
      mutationVector=new THREE.Vector3(mutationX,mutationY,mutationZ);
      mutatedVector=mutationVector.add(motherGenes[i]);
      genes.push(mutatedVector);
      }
      else{
      mutationX=THREE.MathUtils.randFloat(-mutationRate,mutationRate);
      mutationY=THREE.MathUtils.randFloat(-mutationRate,mutationRate);
      mutationZ=THREE.MathUtils.randFloat(-mutationRate,mutationRate);
      mutationVector=new THREE.Vector3(mutationX,mutationY,mutationZ);
      mutatedVector=mutationVector.add(fatherGenes[i]);
      genes.push(mutatedVector);
      }
      
    }
  }
  const thisAgent=new agent(agentMesh, genes);

  scene.add(thisAgent.mesh);
  agents.push(thisAgent);
}



//calculates which agents were
//the first and second most fit, makes them mother and father
let fittestDone=false;
function survivalOfTheFittest(){
  const zeroVector = new THREE.Vector3(0,0,0);
  const maxDistance=zeroVector.distanceTo(goal.position);
  let fitness=0;
  let fittest=0;
  let fittestIndex=0;
  let secondFittest=0;
  let secondFittestIndex=0;
  let thisDistance=0;
  for(let i = 0; i<agentNumber; i ++ ){
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
  }
  agents[fittestIndex].mesh.material.color.set(0X00FF00);
  agents[secondFittestIndex].mesh.material.color.set(0X00FF00);
  motherGenes=agents[fittestIndex].genes;
  fatherGenes=agents[secondFittestIndex].genes;
}

//
//SIMULATION
//
clock.stop();
let cleared=false;
let generationExists=true;
let currentVector=0;
function runSimulation(){
  currentVector = Math.floor((clock.elapsedTime/10) * geneSize);
  for(let i=0; i<agentNumber; i++){
    agents[i].mesh.position.x+=(agents[i].genes[currentVector].x*simulationSpeed);
    agents[i].mesh.position.y+=(agents[i].genes[currentVector].y*simulationSpeed);
    agents[i].mesh.position.z+=(agents[i].genes[currentVector].z*simulationSpeed);

  }
}

let startSim=false;
function startSimulation(){
  resetSimulation();
  clock.start();
  startSim=true;
}

// document.getElementById("startButton").addEventListener("click", startSimulation);

// function updateParameters(){
//   agentNumber = document.getElementById("agents").value;
//   rateOfMutation = document.getElementById("mutationRate").value/5;
//   geneSize = document.getElementById("numberGenes").value;
// }

function resetSimulation(){
  
  clock.stop();
  startSim=false;
  generation=0;
  generationDisplay.innerText = generation;

  for(let i = 0; i < agentNumber; i++){
    scene.remove(agents[i].mesh)
  }
  agents=[];
  currentVector=0;
  updateParameters();
  newGeneration();

}

//
//ANIMATION
//
// function changeAgentNumText(){
//   document.getElementById("agentsDisplay").innerText=document.getElementById("agents").value;
// }
// document.getElementById("agents").addEventListener("change", changeAgentNumText);

// function changeMutationNumText(){
//   document.getElementById("mutationDisplay").innerText=document.getElementById("mutationRate").value;
// }
// document.getElementById("mutationRate").addEventListener("change", changeMutationNumText);


// function changeGeneNumText(){
//   document.getElementById("genesDisplay").innerText=document.getElementById("numberGenes").value;
// }
// document.getElementById("numberGenes").addEventListener("change", changeGeneNumText);



newGeneration();

function animate(){
  if(startSim){
    if(clock.getElapsedTime()<=10 && currentVector<geneSize){
      runSimulation();
    }
    else if(clock.getElapsedTime()<=15 && !fittestDone){
      survivalOfTheFittest();
      fittestDone=true;
      cleared=false;
    }
    else if(clock.getElapsedTime()>=15 && !cleared){
      fittestDone=false;
      for(let i = 0; i < agentNumber; i++){
        scene.remove(agents[i].mesh)
      }
      agents = [];
      cleared=true;
      generationExists=false;
    }
  
    else if(!generationExists){
      clock.stop();
      clock.start();
      generation++;
      generationDisplay.innerText = generation;
      newGeneration();
      generationExists=true;
    }
  }
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.aspect=(window.innerWidth/window.innerHeight);
  camera.updateProjectionMatrix();
  renderer.render(scene,camera);
  camera.lookAt(10,10,10);
  controls.update();
  requestAnimationFrame(animate);
}

animate();