# GeneticAlgorithmJS

## Note: The most up to date version of this demonstration is on my personal website.

Genetic algorithm demonstration made in JS.

Every generation spawns a number of agents. The first generation is random, the later ones are genetic desendants of 
two most fit of the last generation, with mutations.
Fitness is inversely correlated with distance from the red cube (the goal) after 10 seconds.

Currently just uses single point crossover. The first half of genes of the most fit are crossedover with the second half of the genes
with the second most fit.

The genes themselves are vectors of 3d vectors. Over the 10 seconds that the simulation is run for each generation, the genes are iterated 
over, which determine the direction of the agent at that time. More genes per agent mean that each vector determines the direction for
a shorter amount of time. 

The number of genes, number of agents (called entities on the site), and mutation rate can be adjusted.

https://www.viclab.cc/geneticalgo

Inspired by https://dev.to/lukegarrigan/genetic-algorithms-in-javascript-mc3 and https://youtu.be/_Vxjh1QxApA
