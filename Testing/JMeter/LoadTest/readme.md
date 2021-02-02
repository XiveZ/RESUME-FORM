# Example: 10 minute load testing of a site beta.anibel.net
----------


## Step one
### Go to the bin folder in "apache-jmeter*you-version" folder 
![alt](./screenshots/id_1.png)

## Step two
### Run the command "./jmeter"
![alt](./screenshots/id_2.png)

## Step three
### Click on the book icon
![alt](./screenshots/id_3.png)

## Step four
### Select the Recording parameter
![alt](./screenshots/id_4.png)

## Step five
### Enter data in input fields
![alt](./screenshots/id_5.png)

## Step six
### Go to gtmetrix.com. Log in to the site and in the "Enter URL .." field enter the name of your web page. Click the Analize and wait a few seconds.
![alt](screenshots/id_6.png)

## Step seven
### Download and open the document containing analysis data.
### Find the page as shown below. We are interested in the number of requests. In my case it is 42
![alt](./screenshots/id_7.png)

## Step eight
### Enter your details in the Thread Group and drag HTTP Request Defaults down.
![alt](./screenshots/id_8.png) 

## Step nine
### Click RBM on the Thread Group and select the HTTP Request
![alt](./screenshots/id_9.png)

## Step ten
### The structure of the fields should look something like this.
![alt](./screenshots/id_10.png)

## Step eleven
### Save the Test Plan
![alt](./screenshots/id_11.png)

## Step twelve
### Close JMeter. Start testing with the command

```
.\jmeter -n -t .\beta_anibel_net.jmx -l beta_anibel_net_log.txt
```
`-n - This specifies JMeter is to run in cli mode`

`-t - [name of JMX file that contains the Test Plan].`

`-l - [name of JTL file to log sample results to].` for writing data in the .txt file

![alt](./screenshots/id_12.png)
### or the command
```
.\jmeter -n -t .\beta_anibel_net.jmx -l beta_anibel_net_log.csv
``` 
### for writing data in the .csv file
![alt](./screenshots/id_12_1.png)

## Step thirteen
### Just wait
![alt](./screenshots/id_13.png)

## Step fourteen
### The file can be opened or ... can be edited in HTML format
```
.\jmeter -e -g .\beta_anibel_net_log.csv -o .\report\
```
`-e - generate report dashboard after load test`

`-g - [path to CSV file] generate report dashboard only`

`-e - output folder where to generate the report dashboard after load test. Folder must not exist or be empty`

![alt](./screenshots/id_14.png)

## Step fifteenth
### Open the index.html file in a browser or open [this](./report/index.html) file
![alt](./screenshots/id_15.png)

----------
