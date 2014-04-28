#include <iostream>
#include <fstream>
#include <string>
#include <map>
#include <cmath>
using namespace std;

#define PMIN 0.0
#define PMAX 1.0
#define SIMULATIONS 10000

// 1.96 is the 95% confidence interval multiplier

#define loBound(x, sd) (x - 1.96 * sd / sqrt(SIMULATIONS))
#define hiBound(x, sd) (x + 1.96 * sd / sqrt(SIMULATIONS))

void calcPMinMax(map<double, double> & data, double loBound, double & pmin, double & pmax)
{
	pmin = PMAX;
	pmax = PMIN;

	for (auto it = data.begin(); it != data.end(); ++it)
	{
		double p = it->first, hi = it->second;
		if (hi > loBound)
		{
			if (p < pmin)
				pmin = p;
			if (p > pmax)
				pmax = p;
		}
	}
}

int main()
{
	string inputfile = "N(6,3,p)-hexagon-10k.txt";
	string outputfile = "output.txt";
	ifstream input(inputfile);
	ofstream output(outputfile);

	if (!input.is_open())
	{
		cout << "Cannot open file\"" << inputfile << "\"." << endl;
		return -1;
	}

	if (!output.is_open())
	{
		cout << "Cannot open file\"" << outputfile << "\"." << endl;
		return -1;
	}

	double p = 0, N = 0;
	double maxP = 0, maxN = 0, maxSD = 0;
	double sd, countPerc;
	int size, currSize = 0;

	map<double, double> pToHi;

	output << "size, max p, max N, 95% pmin, 95% pmax" << endl;

	while (!input.eof())
	{
		input >> p >> N >> sd >> countPerc >> size;

		if (size != currSize)
		{
			// Calculate pmin and pmax
			double pmin, pmax;
			calcPMinMax(pToHi, loBound(maxN, maxSD), pmin, pmax);

			output << currSize << ", " << maxP << ", " << maxN << ", " << pmin << ", " << pmax << endl;
			// Clear
			maxP = 0;
			maxN = 0;
			maxSD = 0;
			currSize = size;
			pToHi.clear();
		}

		pToHi[p] = hiBound(N, sd);

		if (N > maxN)
		{
			maxN = N;
			maxP = p;
			maxSD = sd;
		}
	}

	system("pause");
}