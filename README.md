# qlikHandler

qlikHandler allow get the data from a Qlik Sense Object inside a Mashup and send it to one HTML table.

Creates a html table with the same fields as the selected qlik_object:

![image](https://user-images.githubusercontent.com/49288975/126521691-293077ec-6be8-41ba-beca-73533015039d.png)


Add, remove rows to the table:

![image](https://user-images.githubusercontent.com/49288975/126521829-8bc5b098-4507-4239-b448-4e803fbd8f18.png)

Edit values on the html table:

![image](https://user-images.githubusercontent.com/49288975/126521964-7c47d15c-5613-4cc6-a0d8-31ed6e524011.png)

Inside the class, define wich fields are editables (line 16):

![image](https://user-images.githubusercontent.com/49288975/126522354-abd6b60f-22bb-464c-aae4-f45a73d051c0.png)


*median, mean, consider and comparison cells are defined here, but calculated automatically


# Installation
Download and put the files in your directory where the mashup can call them.

1. Download qlikHandler.js
2. Download qlikHandler.css


# Dependencies
- JQUERY
- Bootstrap

# Example of use
1. Create one div with one ID on your HTML file of mashup where you want the table to be shown

  < body>
    (...)
    < div id="div_qlikHandler"></div>
    (...)
  < /body>
  

2. Inside your js file of mashup go to require funcion. Inside it call the class qlikHandler on document.ready after you call the object and the app.

  Example:
  require(["js/qlik"], function(qlik) {
      
      (...)
      var app = qlik.openApp("2bb3c2b0-a84b-4e32-9713-de3c308b6c3e", config);
      app.getObject("QV001", "mQDKC");
      (...)  
      
      $(document).ready(() => {
          qlikHandler = new qlikHandler(app, "div_qlikHandler", "mQDKC");
      });
  });
  
3. Correct the parameters of the class to your div id and your object id (the object you want to get data and send it to the html table)
  qlikHandler(app, [div_id], [object_id]);
  
  
