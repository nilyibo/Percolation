/**
* @file infectionStep.cpp
* @author Yibo G (https://github.com/nilyibo)
* This function is used to calcualte N(n = 6, r, p) for percolation on regualr lattice
*/

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <iostream>
#include <cmath>
#include <vector>
using namespace std;

// Parameters
#define	n	6	// side per face
#define	r	3	// infection threhold
#define	pmin	0.0
#define	pmax	1.0
#define	pstep	0.01

#define rows 10
#define columns 10
#define simulations 1000

int countInfectedNeighbor(bool grid[rows][columns], int x, int y)
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
void buildGrid(bool grid[rows][columns], double p)
{
	for (int i = 0; i < rows; ++i)
		for (int j = 0; j < columns; ++j)
			if ((double)rand() / RAND_MAX < p)
				grid[i][j] = true;
			else
				grid[i][j] = false;
}

// Run one round of spread on the grid and set grid changed flag
void oneRound(bool grid[rows][columns], bool & gridChanged)
{
	gridChanged = false;
	bool newGrid[rows][columns];

	for (int i = 0; i < rows; ++i)
		for (int j = 0; j < columns; ++j)
		{
			newGrid[i][j] = grid[i][j];
			if (!grid[i][j] && countInfectedNeighbor(grid, i, j) >= r)
			{
				gridChanged = true;
				newGrid[i][j] = true;
			}
		}

	for (int i = 0; i < rows; ++i)
		for (int j = 0; j < columns; ++j)
			grid[i][j] = newGrid[i][j];
}


// Run one simulation with the given probability
// Returns number of steps
int oneSimulation(double p)
{
	bool grid[rows][columns];
	bool gridChanged = true;
	int count = -1; // Counter is added once even if steps is 0

	buildGrid(grid, p);
	while (gridChanged)
	{
		oneRound(grid, gridChanged);
		++count;
	}

	return count;
}

int main()
{
	// Initialize random seed
	srand(static_cast<unsigned int>(time(NULL)));

	printf("This function calculates N(%d, %d, p).\n\n", n, r);
	printf("Parameters:\nrows = %d, columns = %d, #simulations = %d.\n", rows, columns, simulations);
	printf("p from %f to %f step %f.\n", pmin, pmax, pstep);
	printf("\np, N(%d, %d, p), SD.\n", n, r);

	clock_t t = clock();
	for (double p = pmin; p < pmax; p += pstep)
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
		printf("%f, %f, %f\n", p, avg, sd);
	}

	t = clock() - t;
	printf("\nProcessor time: %f.\n", t / (double)CLOCKS_PER_SEC);

	system("pause");
	return 0;
}