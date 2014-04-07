/**
* @file infectionStep.cpp
* @author Yibo G (https://github.com/nilyibo)
* This function is used to calcualte N(n = 6, r, p) for percolation on regualr lattice
*/

#include <stdio.h>
#include <iostream>

// Parameters
#define	n	6	// side per face
#define	r	3	// infection threhold
#define	pmin	0.0
#define	pmax	1.0
#define	pstep	0.01

#define rows 10
#define columns 10
#define simulations 1000



int main()
{
	printf("This function calculates N(%d, %d, p).\n\n", n, r);
	printf("p, N(%d, %d, p).\n", n, r);
	for (double p = pmin; p < pmax; p += pstep)
	{
		int steps = 0;
		for (int i = 0; i < simulations; ++i)
			steps += 0;
		printf("%f, %f\n", p, (double)steps/simulations);
	}

	system("pause");
	return 0;
}