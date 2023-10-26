# KGH Dashboard
#### Hospital Dashboard artefact created as a prototype for use in the final year project titled _"Interoperability and Predictive Analytics in Digital Health Systems"_.
### Dashboard template based on: 
O. Tassinari's Material Kit React: Minimal Dashboard. Available: https://github.com/minimal-ui-kit/material-kit-react

## **Dashboard Setup**
### **Dashboard Initialisation**

Once you download the project, open the terminal and run `npm install`. Once complete, run `npm run start`. This will initialise the application on your localhost.
   
### **Login Details**

The dashboard can be accessed through inputting the following details in the login screen:

**Email**: 	`test@test.com`

**Password**: 	`test123`

These credentials will log you in as _“Joe Borg”_, designated as an _“Administrator”_. 

Due to time constraints, different views for the potential variety in the types of hospital users were not developed, and therefore only one set of credentials were created.

## Flask Application Initialisation (FlaskApp)

1.	To run the _‘Barthel ADL - Predictions on Length of Stay’_ in the _‘Predicted Analytics’_ page, download the _“FlaskApp”_ folder and open it through the IDE of your choice. 
2.	Install the necessary libraries by running `pip install -r requirements.txt` through the terminal, then run `flask run`. 
3.	Check if the application is running on `http://127.0.0.1:5000`. If not, you can change the link inside the ‘AnalyticsPage.js’ dashboard file to the displayed link, in the line below:

 `<iframe style={{ border: '0px' }} title="myFrame" height="1300px" width="100%" src="http://127.0.0.1:5000/" />`

## Diagrams

 ### Dashboard DFD

 ![image](https://github.com/NathanPortelli/KGHDashboard/assets/61872215/2a0e3c0c-d3b1-4907-9459-074bd55102f1)

### Activity Diagram for the management of patient data

![image](https://github.com/NathanPortelli/KGHDashboard/assets/61872215/e0f0c9a1-29e2-40a4-a7ab-b6df7e7ddf98)

### Use-case diagram of dashboard

![image](https://github.com/NathanPortelli/KGHDashboard/assets/61872215/3fb3d5da-3a80-41ec-b7fd-ac1caf48aafe)

 ## Firebase Setup

|Collection|Subcollection|Fields|Type|
|:----|:----|:----|:----|
|patients| |Age|Number|
| | |DOB|String|
| | |FirstName|String|
| | |LastName|String|
| | |Locality|String|
| | |Sex|String|
| | |PatientStatus|String|
| |admissiondetails|AdmissionThru|String|
| | |AdmissionWard|String|
| | |AdmitDate|String|
| | |Consultant|String|
| | |Expectation|String|
| | |HomeEnvironment|String|
| | |MainDiagnosis|String|
| | |OtherDiagnosis|String|
| | |Support|String|
| |bartheladm|Bathing|Number|
| | |Bladder|Number|
| | |Bowels|Number|
| | |Dressing|Number|
| | |Feeding|Number|
| | |Grooming|Number|
| | |Mobility|Number|
| | |Stairs|Number|
| | |Toilet|Number|
| | |Transfers|Number|
| |dischargedetails|DischDate|String|
| | |DischNotes|String|
| | |DischTo|String|
| |waterlow|Appetite|String|
| | |Continence|String|
| | |Medication|String|
| | |Neuro|String|
| | |Skin|String|
| | |Tissue|String|
| | |WaterMobility|String|
| | |WeightSize|String|
|recentpatients| |FirstName|String|
| | |IDNum|String|
| | |LastAccessed|Timestamp|
| | |LastName|String|
|users| |Designation|String|
| | |email|String|
| | |name|String|
|wards| |Available|Number|
| | |PatientNo|Number|
| | |WardNo|Number|
