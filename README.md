# Team Website

This team project involved creating a website with the goal of allowing SFSU students to sell items and services to each other locally. Through this process we learned how to work as a team, held weekly team meetings, divided the work, learned full stack development, and learned the different stages of development. 

The server may not be currently up.
Production Server address: http://ec2-3-21-104-38.us-east-2.compute.amazonaws.com/html/index.html

************************************************************************************

### Instructions for Running Locally

If the server is not currently active, the website can be run locally.

Create a local MySQL database by running clear_db.sql then populate_db.sql found in ./scripts/ folder.

Change the database credentials in application/backend/app/sql_db/database.py

Load the application through Pycharm to install all the requirements
or manually install all the dependencies by typing `pip3 install -r requirements.txt` or `pip install -r requirements.txt` in a terminal 

Run the application/backend/main.py file either from pycharm or by opening a terminal and typing `python main.py` or `python3 main.py` depending on your python installation

Open a web browser and navigate to http://127.0.0.1:8000/

************************************************************************************

### Team Members

| Student Name | Student Email | GitHub Username |
|    :---:     |     :---:     |     :---:       |
| Niall Healy  | nhealy@mail.sfsu.edu | niall-healy                 |
| Dale Armstrong     |   darmstrong1@mail.sfsu.edu            | DaleArmstrong                 |
| Joseph Babel     |  jbabel@mail.sfsu.edu           |  JosephBabel             |
| Aaron Lander   | alander@mail.sfsu.edu            |  aaronlander93             |
| Lukas Pettersson     |  lpettersson@mail.sfsu.edu         | LukasPettersson            |
| Vern Saeteurn | vsaeteurn@mail.sfsu.edu           |  vdiz510               |