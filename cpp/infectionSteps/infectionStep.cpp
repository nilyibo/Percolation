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

#define sizemin 5
#define sizemax 200
#define sizestep 5

#define rows size
#define columns size

static int size;
static bool ** grid;		// Current infection status
static bool ** newGrid;	// temp: next round infection status

int countInfectedNeighbor(int x, int y)
{
	int count = 0;
#if n == 4
	if (x > 0)
		count += (grid[x - 1][y]) ? 1 : 0;
	if (y > 0)
		count += (grid[x][y - 1]) ? 1 : 0;
	if (x + 1 < rows)
		count += (grid[x + 1][y]) ? 1 : 0;
	if (y + 1 < columns)
		count += (grid[x][y + 1]) ? 1 : 0;
#elif n == 6
	// Assume in hexagon grid,
	// odd columns are half above even columns

	// Same for both odd and even
	if (x > 0)
		count += (grid[x - 1][y]) ? 1 : 0;
	if (x + 1 < rows)
		count += (grid[x + 1][y]) ? 1 : 0;

	if (y % 2 == 0) // Odd column
	{
		if (y > 0)
		{
			count += (grid[x][y - 1]) ? 1 : 0;
			if (x > 0)
				count += (grid[x - 1][y - 1]) ? 1 : 0;
		}
		if (y + 1 < columns)
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
			if (x + 1 < rows)
				count += (grid[x + 1][y - 1]) ? 1 : 0;
		}
		if (y + 1 < columns)
		{
			count += (grid[x][y + 1]) ? 1 : 0;
			if (x + 1 < rows)
				count += (grid[x + 1][y + 1]) ? 1 : 0;
		}
	}
#endif
	return count;
}

// Random initial seed
void buildGrid(double p)
{
	for (int i = 0; i < rows; ++i)
		for (int j = 0; j < columns; ++j)
			if ((double)rand() / RAND_MAX < p)
				grid[i][j] = true;
			else
				grid[i][j] = false;
}

// Run one round of spread on the grid and set grid changed flag
void oneRound(bool & gridChanged)
{
	gridChanged = false;

	for (int i = 0; i < rows; ++i)
		for (int j = 0; j < columns; ++j)
		{
			if (!grid[i][j] && countInfectedNeighbor(i, j) >= r)
			{
				gridChanged = true;
				newGrid[i][j] = true;
			}
			else
				newGrid[i][j] = grid[i][j];
		}

	for (int i = 0; i < rows; ++i)
		for (int j = 0; j < columns; ++j)
			grid[i][j] = newGrid[i][j];
}


// Run one simulation with the given probability
// Returns number of steps
int oneSimulation(double p)
{
	bool gridChanged = true;
	int count = -1; // Counter is added once even if steps is 0

	buildGrid(p);
	while (gridChanged)
	{
		oneRound(gridChanged);
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

	for (size = sizemin; size <= sizemax; size += sizestep)
	{
		cout << "size = " << size << endl;
		clock_t t = clock();

		grid = new bool*[rows];
		for (int i = 0; i < rows; ++i)
			grid[i] = new bool[columns];
		newGrid = new bool*[rows];
		for (int i = 0; i < rows; ++i)
			newGrid[i] = new bool[columns];

		for (double p = pmin; p <= pmax; p += pstep)
		{
			int steps = 0, steps2 = 0; // sum of x and sum of x^2
			for (int i = 0; i < simulations; ++i)
			{
				int count = oneSimulation(p);
				steps += count;
				steps2 += count * count;
			}
			double avg = (double)steps / simulations;
			double sd = sqrt((double)steps2 / simulations - avg * avg);
			output << p << ", " << avg << ", " << sd << ", " << size << endl;
		}

		for (int i = 0; i < rows; ++i)
			delete[] grid[i];
		delete[] grid;
		grid = NULL;
		for (int i = 0; i < rows; ++i)
			delete[] newGrid[i];
		delete[] newGrid;
		newGrid = NULL;

		t = clock() - t;

		output << "\nProcessor time (" << size << "): "
			<< t / (double)CLOCKS_PER_SEC << ".\n" << endl;
		cout << "\nProcessor time (" << size << "): "
			<< t / (double)CLOCKS_PER_SEC << ".\n" << endl;
	}

	system("pause");
	return 0;
}
