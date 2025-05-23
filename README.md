# FullStackWebApp
 FYP Recommendation Web App for VGR.
 VGR is a video games recommendation app.

Supporting Documents Source Code Files </br>
backend - all backend Django files</br>
    - recommendations/views.py</br>
    - social/views.py</br>
    - users/views.py</br>
database - recommendation system database</br>
   - dataset.db</br>
frontend - all Next.js pages and route files</br>
  - app/AddRatings/page.tsx</br>
  - app/api/</br>
    - FetchGames/route.ts</br>
    - FetchImages/route.ts</br>
    - FetchSavedRecs/route.ts</br>
    - GameName/route.ts</br>
    - PopularImgs/route.ts</br>
    - Popularity/route.ts</br>
    - Wildcard/route.ts</br>
  - ForgotPassword/page.tsx</br>
  - Friends/page.tsx</br>
  - Home/page.tsx</br>
  - InitialRatings/page.tsx</br>
  - Login/page.tsx</br>
  - Logout/page.tsx</br>
  - Profile/page.tsx</br>
  - Recommendations/page.tsx</br>
  - SavedRecommendations/page.tsx</br>
  - SignUp/page.tsx</br>
  - Social/page.tsx</br>
helperFiles - CSV files used</br>
  -  FactorisedtoGameID.csv</br>
  -  gameGenres.csv</br>
 MLModels - trained machine learning model</br>
  - evaluateModel2lessbatch.keras </br>
  - training.py (training code for the model) </br>

Executable file of this project cannot be generated so it will need to be run locally. 

Instructions to set up and run the code

Should ideally be installed on a machine with Nvidia Graphics Card for CUDA support and use WSL (Windows Subsystem for Linux).
Minimum 8GB of VRAM on GPU, I used Nvidia RTX 2070 Super during development. 
Tensorflow with GPU support only supports Linux and for Windows requires WSL. 
Instructions are for using WSL with Ubuntu and Nvidia CUDA. 

The following needs to be installed on your machine:
- Python
- Node.js and NPM

Step 1: 
Paste folder into WSL Ubuntu

Step 2:
Ensure drivers for Nvidia graphics card are installed on WSL instance. 
CUDA and cuDNN toolkits shouldn't be required as Tensorflow CUDA should install everything but if not, download and install Nvidia CUDA Toolkit and Nvidia cuDNN in WSL instance.

Step 3:
Download the trained model from this link https://drive.google.com/drive/folders/1FNlq0MzwR_HsqZuA7tAZZddbmfIap9cK?usp=sharing
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
- django
- django-cors-headers
- djangorestframework
- djangorestframework-simplejwt
- dotenv
- scikit-learn
- tensorflow[and-cuda]
- pandas

Step 7:
Create a .env.local folder in the frontend folder and add these values. 
CLIENT_ID = ''
SECRET = '' 

You will need to generate values for these in order for the IGDB API to work. 
Instructions for getting these values can be found here https://api-docs.igdb.com/#getting-started

Step 8:
The following paths need updating in the following files to your exact path for the files in the given paths:
- backend/recommendations/views.py
    - lines for SQLite db path in folder database: 37, 273, 336
    - lines for trained model in MLModels folder: 64
    - lines for gameGenres file in folder helperFiles: 167, 206, 250, 260, 
    - file for FactorisedtoGameID file in folder helperFile: 86, 314, 333, 339, 466

Step 9:
Two terminal instances will be needed (one for frontend and one for backend).
In the terminal for the backend (the one with venv activated) cd to the backend directory and run the command

python manage.py runserver

This command will start the Django server

Step 10:
In the second terminal cd to the frontend directory (venv not required)

Run the command
npm install

npm run dev
This command will start the Next.js server

