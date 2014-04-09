/**
* @file infectionStep.cpp
* @author Yibo G (https://github.com/nilyibo)
* This function is used to calcualte N(n = 6, r, p) for percolation on regualr lattice
*/

#include <stdio.h>
#include <stdlib.h>
#include <iostream>
#include <fstream>
#include <time.h>
#include <cmath>
#include <omp.h>
using namespace std;

#define outputfile "output.txt"

// Parameters
#define	n	6	// side per face
#define	r	3	// infection threhold
#define	pmin	0.05
#define	pmax	0.35
#define	pstep	0.01
#define simulations 100

#define sizemin 10
#define sizemax 100
#define sizestep 10

int countInfectedNeighbor(bool ** grid, int x, int y, int size)
{
	int count = 0;
#if n == 4
	if (x > 0)
		count += (grid[x - 1][y]) ? 1 : 0;
	if (y > 0)
		count += (grid[x][y - 1]) ? 1 : 0;
	if (x + 1 < size)
		count += (grid[x + 1][y]) ? 1 : 0;
	if (y + 1 < size)
		count += (grid[x][y + 1]) ? 1 : 0;
#elif n == 6
	// Assume in hexagon grid,
	// odd size are half above even size

	// Same for both odd and even
	if (x > 0)
		count += (grid[x - 1][y]) ? 1 : 0;
	if (x + 1 < size)
		count += (grid[x + 1][y]) ? 1 : 0;

	if (y % 2 == 0) // Odd column
	{
		if (y > 0)
		{
			count += (grid[x][y - 1]) ? 1 : 0;
			if (x > 0)
				count += (grid[x - 1][y - 1]) ? 1 : 0;
		}
		if (y + 1 < size)
		{
			count += (grid[x][y + 1]) ? 1 : 0;
			if (x > 0)
				count += (grid[x - 1][y + 1]) ? 1 : 0;
		}
	}
	else	// Even column
	{
		if (y > 0)
		{
			count += (grid[x][y - 1]) ? 1 : 0;
			if (x + 1 < size)
				count += (grid[x + 1][y - 1]) ? 1 : 0;
		}
		if (y + 1 < size)
		{
			count += (grid[x][y + 1]) ? 1 : 0;
			if (x + 1 < size)
				count += (grid[x + 1][y + 1]) ? 1 : 0;
		}
	}
#endif
	return count;
}

// Random initial seed
void buildGrid(bool ** grid, double p, int size)
{
	for (int i = 0; i < size; ++i)
		for (int j = 0; j < size; ++j)
		{
			if ((double)rand() / RAND_MAX < p)
			{
				grid[i][j] = true;
			}
			else
				grid[i][j] = false;
		}
}

// Run one round of spread on the grid and set grid changed flag
void oneRound(bool ** grid, bool ** newGrid, bool & gridChanged, int size)
{
	gridChanged = false;

	for (int i = 0; i < size; ++i)
		for (int j = 0; j < size; ++j)
		{
			if (!grid[i][j] && countInfectedNeighbor(grid, i, j, size) >= r)
			{
				gridChanged = true;
				newGrid[i][j] = true;
			}
			else
				newGrid[i][j] = grid[i][j];
		}

	for (int i = 0; i < size; ++i)
		for (int j = 0; j < size; ++j)
			grid[i][j] = newGrid[i][j];
}


// Run one simulation with the given probability
// Returns number of steps
int oneSimulation(bool ** grid, bool ** newGrid, double p, int size)
{
	bool gridChanged = true;
	int count = -1; // Counter is added once even if steps is 0

	buildGrid(grid, p, size);
	while (gridChanged)
	{
		oneRound(grid, newGrid, gridChanged, size);
		++count;
	}

	return count;
}

int main()
{
	ofstream output(outputfile, ios::out | ios::app);

	if (!output.is_open())
	{
		printf("Failed to open file %s.\nProgram will exit...", outputfile);
		return -1;
	}

	// Initialize random seed
	srand(static_cast<unsigned int>(time(NULL)));

	output << "This function calculates N(" << n << ", "
		<< r << ", p).\n\n"
		<< "Parameters: #simulations = " << simulations
		<< ".\n" << "p from " << pmin << " to "
		<< pmax << " step " << pstep << ".\n" << endl;

	output << "p, N(p), SD, size.\n" << endl;

#pragma omp parallel for num_threads(8)
	for (int size = sizemin; size <= sizemax; size += sizestep)
	{
		cout << "size = " << size << endl;
		clock_t t = clock();

		bool ** grid = new bool*[size];
		for (int i = 0; i < size; ++i)
			grid[i] = new bool[size];
		bool ** newGrid = new bool*[size];
		for (int i = 0; i < size; ++i)
			newGrid[i] = new bool[size];

		for (double p = pmin; p <= pmax; p += pstep)
		{
			int steps = 0, steps2 = 0; // sum of x and sum of x^2
			for (int i = 0; i < simulations; ++i)
			{
				int count = oneSimulation(grid, newGrid, p, size);
				steps += count;
				steps2 += count * count;
			}
			double avg = (double)steps / simulations;
			double sd = sqrt((double)steps2 / simulations - avg * avg);
#pragma omp critical
			{
				output << p << ", " << avg << ", " << sd << ", " << size << endl;
			}
		}

		for (int i = 0; i < size; ++i)
			delete[] grid[i];
		delete[] grid;
		grid = NULL;
		for (int i = 0; i < size; ++i)
			delete[] newGrid[i];
		delete[] newGrid;
		newGrid = NULL;

		t = clock() - t;
#pragma omp critical
		{
			output << "\nProcessor time (" << size << "): "
				<< t / (double)CLOCKS_PER_SEC << ".\n" << endl;
			cout << "\nProcessor time (" << size << "): "
				<< t / (double)CLOCKS_PER_SEC << ".\n" << endl;
		}
	}

	system("pause");
	return 0;
}
