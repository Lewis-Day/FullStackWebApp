# FullStackWebApp
 FYP Recommendation Web App

 Supporting Documents Source Code
 - backend - all backend Django files
 - database - recommendation system database 
 - frontend - all Next.js pages and route files
 - helperFiles - CSV files used
 - MLModels - trained machine learning model

Executable file of this project cannot be generated so it will need to be run locally. 

Instructions to set up and run the code

Should ideally be installed on a machine with Nvidia Graphics Card for CUDA support and use WSL (Windows Subsystem for Linux).
Tensorflow with GPU support only supports Linux and for Windows requires WSL. 
Instructions are for using WSL with Ubuntu and Nvidia CUDA. 

The following needs to be installed on your machine:
- Python
- Node.js and NPM

Step 1: 
Paste folder into WSL Ubuntu

Step 2:
Download and install Nvidia CUDA Toolkit and Nvidia cuDNN in WSL instance

Step 3:
Download the model from this link
Add to the MLModels folder

Step 4:
Create a Python environment for Django to run on by running the command 

python -m venv *path to env*

*path to env* should be the root of the project folder (FullStackWebApp)

Step 5:
Activate the python environment by running the command in the directory with venv in

source venv/bin/activate

Step 6:
Install the following with pip (pip install):
- Django
- django-cors-headers
- djangorestframework
- djangorestframework-simplejwt
- dotenv
- scikit-learn
- tensorflow[and-cuda]

Step 7:
Create a .env.local folder in the frontend folder and add these values. 
CLIENT_ID = ''
SECRET = '' 

You will need to generate values for these in order for the IGDB API to work. 
Instructions for getting these values can be found here https://api-docs.igdb.com/#getting-started

Step 8:
The following paths need updating in the following files to your exact path:
- backend/recommendations/views.py
    - lines: 32, 59, 81, 162, 201, 245, 255, 268, 309, 328, 331, 334, 461

Step 9:
Two terminal instances will be needed (one for frontend and one for backend).
In the terminal for the backend cd to the backend directory and run the command

python manage.py runserver

This command will start the Django server

Step 10:
In the second terminal cd to the frontend directory

Run the command
npm install

npm run dev
This command will start the Next.js server

