/**
* @file infectionStep.cpp
* @author Yibo G (https://github.com/nilyibo)
* This function is used to calcualte N(n = 6, r, p) for percolation on regular lattice
*/

#include <stdio.h>
#include <stdlib.h>
#include <iostream>
#include <fstream>
#include <time.h>
using namespace std;

#define outputfile "output.txt"

// Parameters
#define	N	6	// Hexagon
#define	R	3	// infection threhold
#define	pmin	0.0
#define	pmax	0.5
#define	pstep	0.01
#define simulations 1000

#define sizemin 10
#define sizemax 100
#define sizestep 10

//#define DEBUG

#define max(a, b) ((a > b) ? a : b)
#define min(a, b) ((a < b) ? a : b)
#define minx(row, size) (max(size - 1 - row, 0))
#define maxx(row, size) (-2 + 2  * size + min(size - 1 - row, 0))

// rowDiff, colDiff
static int neighbors[6][2] = {
	{-1, 0}, {-1, +1},
	{0, -1}, {0, +1},
	{+1, -1}, {+1, 0}
};

int countInfectedNeighbor(bool ** grid, int row, int col, int size)
{
	int a = max(1, 2);
	int count = 0;
	for (int n = 0; n < 6; ++n)
	{
		int row0 = row + neighbors[n][0];
		int col0 = col + neighbors[n][1];
		if (row0 >= 0 && row0 < 2 * size - 1
			&& col0 >= minx(row0, size) && col0 <= maxx(row0, size))
			if (grid[row0][col0])
				++count;
	}
	return count;
}

// Random initial seed
void buildGrid(bool ** grid, double p, int size)
{
	for (int i = 0; i < 2 * size - 1; ++i)
		for (int j = 0; j < 2 * size - 1; ++j)
		{
			if (static_cast<double>(rand()) / RAND_MAX <= p)
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

	for (int i = 0; i < 2 * size - 1; ++i)
	{
		for (int j = minx(i, size); j <= maxx(i, size); ++j)
		{
#ifdef DEBUG
			cerr << i << ", " << j << "\t";
#else
			if (!grid[i][j] && countInfectedNeighbor(grid, i, j, size) >= R)
			{
				gridChanged = true;
				newGrid[i][j] = true;
			}
			else
				newGrid[i][j] = grid[i][j];
#endif
		}
#ifdef DEBUG
		cerr << endl;
#endif
	}
#ifndef DEBUG
	for (int i = 0; i < 2 * size - 1; ++i)
		for (int j = 0; j < 2 * size - 1; ++j)
			grid[i][j] = newGrid[i][j];
#endif
}


// Run one simulation with the given probability
// Returns number of steps
int oneSimulation(bool ** grid, bool ** newGrid, double p, int size, bool & percolated)
{
	bool gridChanged = true;
	percolated = true;
	int steps = -1; // Counter is added once even if steps is 0

	buildGrid(grid, p, size);
	while (gridChanged)
	{
		oneRound(grid, newGrid, gridChanged, size);
		++steps;
	}

	for (int i = 0; i < 2 * size - 1; ++i)
		for (int j = minx(i, size); j < maxx(i, size); ++j)
			if (!grid[i][j])
			{
				percolated = false;
				return steps;	// No need to check further
			}

	return steps;
}

int main()
{
#ifndef DEBUG
	ofstream output(outputfile, ios::out | ios::app);

	if (!output.is_open())
	{
		printf("Failed to open file %s.\nProgram will exit...", outputfile);
		return -1;
	}

	output << "This function calculates N(" << N << ", "
		<< R << ", p).\n\n"
		<< "Parameters: #simulations = " << simulations
		<< ".\n" << "p from " << pmin << " to "
		<< pmax << " step " << pstep << ".\n" << endl;

	output << "p, N(p), SD, #percolation, size.\n" << endl;

	srand(static_cast<unsigned int>(time(NULL)));
	double startTime = static_cast<double>(time(NULL));
	clock_t t = clock();

	for (int size = sizemin; size <= sizemax; size += sizestep)
	{
		cout << "size = " << size << endl;

		bool ** grid = new bool*[2 * size - 1];
		for (int i = 0; i < 2 * size - 1; ++i)
			grid[i] = new bool[2 * size - 1];
		bool ** newGrid = new bool*[2 * size - 1];
		for (int i = 0; i < 2 * size - 1; ++i)
			newGrid[i] = new bool[2 * size - 1];

		for (double p = pmin; p <= pmax; p += pstep)
		{
			int steps = 0, steps2 = 0; // sum of x and sum of x^2
			bool percolated;
			int pCount = 0; // count of percolation times
			for (int i = 0; i < simulations; ++i)
			{
				long count = oneSimulation(grid, newGrid, p, size, percolated);
				steps += count;
				steps2 += count * count;
				if (percolated)
					++pCount;
			}
			double avg = (double)steps / simulations;
			double sd = sqrt((double)steps2 / simulations - avg * avg);
			output << p << ", " << avg << ", " << sd << ", " << pCount << ", " << size << endl;
		}

		for (int i = 0; i < 2 * size - 1; ++i)
			delete[] grid[i];
		delete[] grid;
		grid = NULL;
		for (int i = 0; i < 2 * size - 1; ++i)
			delete[] newGrid[i];
		delete[] newGrid;
		newGrid = NULL;
	}

	t = clock() - t;
	double seconds = difftime(time(NULL), static_cast<time_t>(startTime));
	output << "\nProcessor time: "
		<< t / (double)CLOCKS_PER_SEC << ".\n" << endl;
	output << "Wall time: " << seconds << "s." << endl;
	cout << "\nProcessor time: "
		<< t / (double)CLOCKS_PER_SEC << ".\n" << endl;
	cout << "Wall time: " << seconds << "s." << endl;
#else
	bool test;
	oneRound(NULL, NULL, test, sizemin);
#endif
	system("pause");
	return 0;
}