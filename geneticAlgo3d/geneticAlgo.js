import './geneticAlgoStyles.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GUI} from 'lil-gui';

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
controls.autoRotateSpeed=0.5;
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
const simHyperParams = {
  entityCount: 10,
  mutRate: 0.5,
  geneCount: 100};
let simulationSpeed=0.02;   

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

//
//GENERATIONS
//
let motherGenes=[];
let fatherGenes=[];
let generation=0;
let agents = [];

//function for creating generation
function newGeneration(){
  for(let i = 0; i<simHyperParams.entityCount; i ++ ){
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
  let mutationRate=simHyperParams.mutRate;
  if(generation<1){
    for(let i = 0; i<simHyperParams.geneCount; i++){
      genes.push(new THREE.Vector3(THREE.MathUtils.randFloat(-mutationRate,mutationRate),THREE.MathUtils.randFloat(-mutationRate,mutationRate),THREE.MathUtils.randFloat(-mutationRate,mutationRate)));
    }
  }
  else{
    for(let i = 0; i<simHyperParams.geneCount; i++){
      if(i<(simHyperParams.geneCount/2)){
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

//calculates which agents were the first and second most fit, makes them mother and father
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
  for(let i = 0; i<simHyperParams.entityCount; i ++ ){
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
  currentVector = Math.floor((clock.elapsedTime/10) * simHyperParams.geneCount);
  for(let i=0; i<simHyperParams.entityCount; i++){
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

function resetSimulation(){
  clock.stop();
  startSim=false;
  generation=0;
  for(let i = 0; i < agents.length; i++){
    scene.remove(agents[i].mesh)
  }
  agents=[];
  currentVector=0;
  newGeneration();
}

function animate(){
  controls.autoRotate = simControls.autoRotate
  if(startSim){
    if(clock.getElapsedTime()<=10 && currentVector<simHyperParams.geneCount){
      runSimulation();
    }
    else if(clock.getElapsedTime()<=15 && !fittestDone){
      survivalOfTheFittest();
      fittestDone=true;
      cleared=false;
    }
    else if(clock.getElapsedTime()>=15 && !cleared){
      fittestDone=false;
      for(let i = 0; i < simHyperParams.entityCount; i++){
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

//
// UI
//
const gui = new GUI();
let simControls = {
  Start: function(){
    onStartClick();
  },
  Reset: function(){
    onResetClick();
  },
  autoRotate:  true
};
const startButton = gui.add(simControls, 'Start');
const resetButton = gui.add(simControls, 'Reset');
const orbitCheckBox = gui.add(simControls, 'autoRotate')
const hyperParamsFolder = gui.addFolder("Hyper Parameters");
const entitySlider = hyperParamsFolder.add(simHyperParams, 'entityCount', 5, 2000, 1);
const mutSlider = hyperParamsFolder.add(simHyperParams, 'mutRate', 0.1, 1, 0.1);
const geneSlider = hyperParamsFolder.add(simHyperParams, 'geneCount', 50, 1000, 1);

function onStartClick(){
  startButton.disable();
  entitySlider.disable();
  mutSlider.disable();
  geneSlider.disable();
  resetButton.enable();
  startSimulation();
}

function onResetClick(){
  startButton.enable();
  entitySlider.enable();
  mutSlider.enable();
  geneSlider.enable();
  resetButton.disable();
  resetSimulation();
}
animate();
