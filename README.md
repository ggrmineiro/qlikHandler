# qlikHandler

qlikHandler allow get the data from a Qlik Sense Object inside a Mashup and send it to one HTML table.

# Installation
Download and put the files in your directory where the mashup can call them.

1. Download qlikHandler.js
2. Download qlikHandler.css


# Dependencies
- JQUERY
- Bootstrap

# Example of use
1. Create one div with one ID on your HTML file of mashup where you want the table to be shown


  (
  <body>
    ...
    <div id="div_qlikHandler"></div>
    ...
  </body>
  )

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
