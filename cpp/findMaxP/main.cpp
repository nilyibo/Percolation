#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int main()
{
	string inputfile = "N(6,3,p)-5~300.csv";
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
	double maxP = 0, maxN = 0;
	double temp;
	int size, currSize = 0;

	output << "max p, max N, size" << endl;

	while (!input.eof())
	{
		input >> p >> N >> temp >> size;
		if (size != currSize)
		{
			output << maxP << ", " << maxN << ", " << currSize << endl;
			maxP = 0;
			maxN = 0;
			currSize = size;
		}
		if (N > maxN)
		{
			maxN = N;
			maxP = p;
		}
	}

	system("pause");
}