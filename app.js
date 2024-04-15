// server.js
const http = require("http");
const url = require("url");
const fs = require("fs");
const crypto = require("crypto");
var mysql = require("mysql2/promise");
var formidable = require("formidable");
const { name } = require("ejs");
const { promises } = require("dns");
var pool = mysql.createPool({
  // connectionLimit: 5,
  host: "localhost",
  user: "root",
  password: "",
  database: "digitalcorps",
 // insecureAuth: true,
  // Set the flags option to execute a command on connection
  //flags: '-FOUND_ROWS,MYSQL_ATTR_INIT_COMMAND=set session sql_mode="TRADITIONAL"',
  // onitolot@gmail.com
});

let alerted = ``;
let sessionId2 = "";
const client = 2;
const clientname = "client";
const admin = 1;
const adminname = "admin";
const vendor = 3;
const vendorname = "vendor";
let datas = "";
var idDatas = "";
let idDatasnumber;
let connectionResult = [];
const today = new Date();

// Get the year, month, and day components of the date
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based
const day = String(today.getDate()).padStart(2, "0");
const day2 = String(today.getDate() + 14).padStart(2, "0");

// Format the date as YYYY-MM-DD
const formattedDate = `${year}-${month}-${day}`;
const formattedDate2 = `${year}-${month}-${day2}`;

const expirationTime = new Date(formattedDate2);
console.log(expirationTime);
console.log(new Date("2011-04-11T10:20:30Z"));
console.log("expirationTime............");
// expirationTime.setTime(expirationTime.getTime() + 5 * 60 * 1000); // 10 minutes in milliseconds
// const expires = expirationTime.toUTCString();

function generateSessionId() {
  return crypto.randomBytes(16).toString("hex");
}

const server = http.createServer(async (req, res) => {
  var q = url.parse(req.url, true);
  var pathname = "." + q.pathname;

  //   var pathquery = "." + q.query;
  var host1 = "http://localhost:3000";

  let session = {
    sessionId: "",
    alerted: "",
    data: {
      id: "",
      username: "",
      fullname: "",
      role_id: "",
      rolename: "",
    },
  };
  // let sessionId = q.query.sessionId;
  const cookies = parseCookies(req);
  session.sessionId = cookies["sessionId"];
  session.data.username = cookies["sessionu"];
  session.data.fullname = cookies["sessionf"];
  session.data.id = cookies["sessioni"];
  session.data.role_id = cookies["sessionri"] ;
  session.data.rolename = cookies["sessionrn"] ? cookies["sessionrn"].split(';')[0] : cookies["sessionrn"] ;
  var alertedid = cookies["alertedid"];

  var alertedvalue = cookies["alertedvalue"];
  if (alertedvalue) {
    if (alertedid === "0") {
      session.alerted = `<div class="" style="background-color: rgb(385, 452, -56); padding: 10px;">
    <div class="colnotifc" style="text-align: center;font-weight: bold;" >
       Error Message:
    </div>
    
     <div>
       ${alertedvalue}
       
     </div>
    </div>`;
    } else {
      session.alerted = `<div class="" style="background-color: rgb(195, 452, -56); padding: 10px;">
    <div class="colnotifc" style="text-align: center;font-weight: bold;" >
       Success Message:
    </div>
    
     <div>
       ${alertedvalue}
      
     </div>
    </div>`;
    }
  }

  console.log(cookies["sessionrn"]);
  console.log(session);
  console.log("sessionyyyy................");
  // If not, generate a new session ID
  if (!session.data.username) {
    sessionId2 = generateSessionId();
  }

  ///////GET GET GET METHODS

  if (req.method === "GET") {
    session;
    var productslists = "";
    let productimagename1 = "";
    let productimagename2 = "";
    let productimagename3 = "";
    let datas = "";
    let AllvendorCount = 0;
    let AllClientCount = 0;
    let AllProductCount = 0;
    let AllvendorCountToday = 0;
    let AllClientCountToday = 0;
    let AllProductCountToday = 0;
    let datas200 = "";
    let datas300 = "";
    let datascentral = "";
    let navbar1 = "";
    let notifcoounter = 0;

   
 //////////////////////////////////////////////////////////    Samuel part start   //////////////////////////////////////////////////

 
if (session.data.username) {
  fs.readFile("./views/navbar.html", "utf8", async (err, navbar) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error for navbar");
    } else {

      if (session.data.rolename === clientname) {
        datas += ` <li><a href="./viewclientwishlist.html">Wishlist</a></li> <li><a href="./profile.html?id=${session.data.id}">Profile</a></li>`;
        navbar1 = navbar
          .replace(/\{\{clientsidebar\}\}/g, datas)
          .replace(/\{\{username\}\}/g, session.data.username)
          .replace(/\{\{adminsidebar\}\}/g, "")
          .replace(/\{\{vendorsidebar\}\}/g, "")
          .replace(/\{\{notifcount\}\}/g, "0");
      } else if (session.data.rolename === adminname) {

        const [rows, fields] = await pool.execute(`SELECT COUNT(id)  as count
        FROM notification 
       WHERE MONTH(created_at)=${month} and DAY(created_at)=${day} and YEAR(created_at) = ${year};`);

        for (let result of rows) {
          notifcoounter = result.count || 0;
        }
        datas += ` <li><a href="./viewproductlist.html?qty=all">View Products</a></li>  <li><a href="./viewvendorlist.html?qty=all">Manage Vendors </a></li>  <li><a href="./viewclientlist.html?qty=all">Manage Clients</a></li> <li><a href="./profile.html?id=${session.data.id}">Profile</a></li>`;
        navbar1 = navbar
          .replace(/\{\{adminsidebar\}\}/g, datas)
          .replace(/\{\{username\}\}/g, session.data.username)
          .replace(/\{\{clientsidebar\}\}/g, "").replace(/\{\{notifcount\}\}/g, notifcoounter)
          .replace(/\{\{vendorsidebar\}\}/g, "");
      } else {
        const [rows, fields] = await pool.execute(`SELECT COUNT(id)  as count
        FROM notification
        WHERE delivered_to='vendor' AND MONTH(created_at)=${month} and DAY(created_at)=${day} and YEAR(created_at) = ${year};`);

        for (let result of rows) {
          notifcoounter = result.count || 0;
        }
        datas += ` <li><a href="./viewproductlist.html?qty=all">Manage Products</a></li>    <li><a href="./vendorprofile.html?id=${session.data.id}">Profile</a></li>`;
        navbar1 = navbar
          .replace(/\{\{vendorsidebar\}\}/g, datas)
          .replace(/\{\{username\}\}/g, session.data.username)
          .replace(/\{\{clientsidebar\}\}/g, "").replace(/\{\{notifcount\}\}/g, notifcoounter)
          .replace(/\{\{adminsidebar\}\}/g, "");
      }
      // <li><a href="./viewfavoriteclientlist.html">My clients</a></li>
    }
  });
}
// Serve the HTML view product list
 if (pathname === "./viewproductlist.html") {
  let rowgotten = [];
  let addproductbutton = " ";
  let deleteButton = " ";
  fs.readFile('./views/viewproductlist.html', "utf8", async (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      if (clientname === session.data.rolename) {
        const [rows, fields] = await pool.execute(
          `SELECT DISTINCT  c.website,p.Cloud_type,p.name,DATE_FORMAT(p.last_reviewed_Date,'%Y-%m-%d') as last_reviewed_Date,DATE_FORMAT(p.next_review_Date,'%Y-%m-%d') as next_review_Date,p.financial_services_client_types,c.name as cname,p.Id,GROUP_CONCAT(pt.name) as concatenated_names,DATE_FORMAT(p.created_at,'%Y-%m-%d') as created_at FROM product as p INNER JOIN company as c ON p.Company_id = c.id INNER JOIN product_product_type as ppt ON ppt.product_id = p.id INNER JOIN user_product_type_choice as uppt ON ppt.product_type_id = uppt.product_type_id INNER JOIN product_type as pt ON pt.id = uppt.product_type_id WHERE uppt.user_id = ? GROUP BY
                    c.website,
                    p.Cloud_type,
                    p.name,
                    p.last_reviewed_Date,
                    p.next_review_Date,
                    p.financial_services_client_types,
                    c.name,
                    p.Id ORDER BY p.created_at DESC;`,
          [session.data.id]
        );
        rowgotten = rows;
      } else if (adminname === session.data.rolename) {
        const [rows, fields] =
          await pool.execute(`SELECT DISTINCT IFNULL(w.id,0) as wished, c.website,p.Cloud_type,p.name,DATE_FORMAT(p.last_reviewed_Date,'%Y-%m-%d') as last_reviewed_Date,DATE_FORMAT(p.next_review_Date,'%Y-%m-%d') as next_review_Date,p.financial_services_client_types,c.name as cname,p.Id,GROUP_CONCAT(pt.name) as concatenated_names,DATE_FORMAT(p.created_at,'%Y-%m-%d') as created_at FROM product as p INNER JOIN company as c ON p.Company_id = c.id INNER JOIN product_product_type as ppt ON ppt.product_id = p.id  INNER JOIN product_type as pt ON pt.id = ppt.product_type_id LEFT JOIN wishlist as w ON w.product_id=p.id  GROUP BY
                    c.website,
                    p.Cloud_type,
                    p.name,
                    p.last_reviewed_Date,
                    p.next_review_Date,
                    p.financial_services_client_types,
                    c.name,
                    p.Id ORDER BY p.created_at DESC;`);

                    if(q.query.qty == "today"){
                      const [rows, fields] =
                      await pool.execute(`SELECT DISTINCT IFNULL(w.id,0) as wished, c.website,p.Cloud_type,p.name,DATE_FORMAT(p.last_reviewed_Date,'%Y-%m-%d') as last_reviewed_Date,DATE_FORMAT(p.next_review_Date,'%Y-%m-%d') as next_review_Date,p.financial_services_client_types,c.name as cname,p.Id,GROUP_CONCAT(pt.name) as concatenated_names,DATE_FORMAT(p.created_at,'%Y-%m-%d') as created_at FROM product as p INNER JOIN company as c ON p.Company_id = c.id INNER JOIN product_product_type as ppt ON ppt.product_id = p.id  INNER JOIN product_type as pt ON pt.id = ppt.product_type_id LEFT JOIN wishlist as w ON w.product_id=p.id WHERE MONTH(p.created_at)=${month} and DAY(p.created_at)=${day} and YEAR(p.created_at) = ${year} GROUP BY
                      c.website,
                      p.Cloud_type,
                      p.name,
                      p.last_reviewed_Date,
                      p.next_review_Date,
                      p.financial_services_client_types,
                      c.name,
                      p.Id ORDER BY p.created_at DESC;`);

                    
                                                    rowgotten = rows;
                      }else{
                        const [rows, fields] =
                        await pool.execute(`SELECT DISTINCT IFNULL(w.id,0) as wished, c.website,p.Cloud_type,p.name,DATE_FORMAT(p.last_reviewed_Date,'%Y-%m-%d') as last_reviewed_Date,DATE_FORMAT(p.next_review_Date,'%Y-%m-%d') as next_review_Date,p.financial_services_client_types,c.name as cname,p.Id,GROUP_CONCAT(pt.name) as concatenated_names,DATE_FORMAT(p.created_at,'%Y-%m-%d') as created_at FROM product as p INNER JOIN company as c ON p.Company_id = c.id INNER JOIN product_product_type as ppt ON ppt.product_id = p.id  INNER JOIN product_type as pt ON pt.id = ppt.product_type_id LEFT JOIN wishlist as w ON w.product_id=p.id  GROUP BY
                    c.website,
                    p.Cloud_type,
                    p.name,
                    p.last_reviewed_Date,
                    p.next_review_Date,
                    p.financial_services_client_types,
                    c.name,
                    p.Id ORDER BY p.created_at DESC;`);
                        rowgotten = rows;
                      }
      } else {
        const [rows, fields] = await pool.execute(
          `SELECT DISTINCT IFNULL(w.id,0) as wished,c.website,p.Cloud_type,p.name,DATE_FORMAT(p.last_reviewed_Date,'%Y-%m-%d') as last_reviewed_Date,DATE_FORMAT(p.next_review_Date,'%Y-%m-%d') as next_review_Date,p.financial_services_client_types,c.name as cname,p.Id,GROUP_CONCAT(pt.name) as concatenated_names,DATE_FORMAT(p.created_at,'%Y-%m-%d') as created_at FROM product as p INNER JOIN company as c ON p.Company_id = c.id INNER JOIN product_product_type as ppt ON ppt.product_id = p.id  INNER JOIN product_type as pt ON pt.id = ppt.product_type_id LEFT JOIN wishlist as w ON w.product_id=p.id WHERE p.Company_id = ? GROUP BY
                                            c.website,
                                            p.Cloud_type,
                                            p.name,
                                            p.last_reviewed_Date,
                                            p.next_review_Date,
                                            p.financial_services_client_types,
                                            c.name,
                                            p.Id ORDER BY p.created_at DESC;`,
          [session.data.id]
        );
        rowgotten = rows;
        addproductbutton = `<a href="./addproduct.html"><button class="btn" style="background-color:#1f60aa">Add Product</button></a>`;
      }
      if (rowgotten.length < 1) {
        productslists += "<tr><td>no data available</td></tr>";
      } else {
        for (var result of rowgotten) {
          if (clientname != session.data.rolename) {
            // deleteButton = `<td><a href="#" > Delete product</a></td>`;
            deleteButton = `<td><a href="./deleteproduct?id=${result.Id}&w=${result.wished}" > Delete product</a></td>`;
          }

          var wished = "";
          if (result.wished > 0) {
            wished += `<td> <input type="checkbox" disabled id="v6" checked></td>`;
          } else {
            wished += `<td> <input type="checkbox" disabled id="v6" ></td>`;
          }
          /* <td><a href="${result.website}" target="_blank">${result.website}</a></td> */
          // <td>${result.financial_services_client_types}</td>
          productslists += ` <tr> <td> ${result.name}</td>
            <td>${result.concatenated_names}</td>
            <td>${result.cname}</td>
            <td>${result.created_at}</td>
            <td>${result.last_reviewed_Date}</td>
            <td>${result.next_review_Date}</td>
            ${wished}
            <td><a href="./product.html?id=${result.Id}" > View Details</a></td> 
           ${deleteButton}
          </tr>`;
        }
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      datas = data
        .replace(/\{\{navbar\}\}/g, navbar1)
        .replace(/\{\{productlist\}\}/g, productslists)
        .replace(/\{\{addproductbutton\}\}/g, addproductbutton)
        .replace(/\{\{alerted\}\}/g, session.alerted);
      res.end(datas);
    }
  });
}
  
if (pathname === "./notification.html") {
  let rowgotten = [];
  let addproductbutton = " ";
  let deleteButton = " ";
  fs.readFile('./views/notification.html', "utf8", async (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      if (adminname === session.data.rolename) {
        const [rows, fields] = await pool.execute(
          `SELECT DISTINCT id,delivered_to ,message, DATE_FORMAT(created_at,'%Y-%m-%d') as date FROM notification ORDER BY created_at DESC;`
        );
        rowgotten = rows;
      }
      if (vendorname === session.data.rolename) {
        const [rows, fields] = await pool.execute(
          `SELECT DISTINCT id,delivered_to ,message, DATE_FORMAT(created_at,'%Y-%m-%d') as date FROM notification WHERE  delivered_to='vendor' ORDER BY created_at DESC;`
        );
        rowgotten = rows;
      }
      if (rowgotten.length < 1) {
        productslists += "<tr><td>no data available</td></tr>";
      } else {
        for (var result of rowgotten) {
         
          productslists += ` 
            <td>${result.message}</td>
         
            <td>${result.date}</td>
            
            <td>${result.date == formattedDate? "new": "old"}</td>
           
          </tr>`;
        }
      }
      res.writeHead(200, { "Content-Type": "text/html" });
      datas = data
        .replace(/\{\{navbar\}\}/g, navbar1)
        .replace(/\{\{productlist\}\}/g, productslists)
        .replace(/\{\{addproductbutton\}\}/g, addproductbutton);
      res.end(datas);
    }
  });
}

  // Serve the HTML view product list
  if (pathname === "./addproduct.html") {
    fs.readFile('./views/addproduct.html', "utf8",async (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
         let navbar12 = await new Promise((resolve, reject) => {
          console.log(navbar1);
          console.log('navbar1.......');
            resolve(navbar1);
         
        });
        console.log(navbar12);
        console.log('navbar12.......');
        datas = await data.replace(/\{\{navbar\}\}/g, navbar12);

        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(datas);
        res.end();
      }
    });
  }

  if (pathname === "./editproduct.html") {
    var country_id_check = 0;
    var gender_id_check = "";
    var softwType_id_check = "";
    fs.readFile('./views/editproduct.html', "utf8", async (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        // You can also iterate over the results and access individual rows
        const [rows, fields] = await pool.execute(
          `SELECT GROUP_CONCAT(pt.name)  as concatenated_names,p.id,p.name,p.business_areas,p.description,p.modules,p.financial_services_client_types,p.Cloud_type,p.last_reviewed_Date,p.next_review_Date,p.Company_id,p.active,p.additional_info  FROM product as p INNER JOIN product_product_type as ppt ON ppt.product_id = p.id INNER JOIN product_type as pt ON pt.id = ppt.product_type_id WHERE p.id = ?;`,
          [q.query.id]
        );

        for (let result of rows) {
          const originalDate = result.last_reviewed_Date;
          const utcYear = originalDate.getUTCFullYear();
          const utcMonth = originalDate.getUTCMonth() + 1; // Months are zero-based, so add 1
          const utcDay = originalDate.getUTCDate();
          const utcHours = originalDate.getUTCHours();
          const utcMinutes = originalDate.getUTCMinutes();
          const utcSeconds = originalDate.getUTCSeconds();

          // Format the date string in the required format
          const formattedDateString = `${utcYear}-${
            (utcMonth < 10 ? "0" : "") + utcMonth
          }-${(utcDay < 10 ? "0" : "") + utcDay}T${
            (utcHours < 10 ? "0" : "") + utcHours
          }:${(utcMinutes < 10 ? "0" : "") + utcMinutes}:${
            (utcSeconds < 10 ? "0" : "") + utcSeconds
          }.000Z`;

          const originalDate2 = result.next_review_Date;
          const utcYear2 = originalDate2.getUTCFullYear();
          const utcMonth2 = originalDate2.getUTCMonth() + 1; // Months are zero-based, so add 1
          const utcDay2 = originalDate2.getUTCDate();
          const utcHours2 = originalDate2.getUTCHours();
          const utcMinutes2 = originalDate2.getUTCMinutes();
          const utcSeconds2 = originalDate2.getUTCSeconds();

          // Format the date string in the required format
          const formattedDateString2 = `${utcYear2}-${
            (utcMonth2 < 10 ? "0" : "") + utcMonth2
          }-${(utcDay2 < 10 ? "0" : "") + utcDay2}T${
            (utcHours2 < 10 ? "0" : "") + utcHours2
          }:${(utcMinutes2 < 10 ? "0" : "") + utcMinutes2}:${
            (utcSeconds2 < 10 ? "0" : "") + utcSeconds2
          }.000Z`;

          cloud_id_check = result.Cloud_type;
          softwType_id_check = result.concatenated_names;
          datascentral = data
            .replace(/\{\{navbar\}\}/g, navbar1)
            .replace(/\{\{softwarename\}\}/g, `${result.name}`)
            .replace(/\{\{businessareas\}\}/g, `${result.business_areas}`)

            .replace(/\{\{description\}\}/g, result.description)
            .replace(/\{\{additionalinformation\}\}/g, result.additional_info)
            .replace(/\{\{modules\}\}/g, result.modules)
            .replace(
              /\{\{financialservicesclientypes\}\}/g,
              result.financial_services_client_types
            )
            .replace(/\{\{lastreview\}\}/g, formattedDateString.split("T")[0])
            .replace(
              /\{\{nextreview\}\}/g,
              formattedDateString2.split("T")[0]
            )
            .replace(/\{\{id\}\}/g, result.id)
            .replace(/\{\{companyid\}\}/g, result.Company_id);

          console.log("result.dateofbirth.toString(.split()[0]");
        }
        datas200 += '<option value="">--select Cloud Type--</option>';

        if ("native" == cloud_id_check) {
          datas200 += `<option value="native" selected>Native</option>`;
        } else {
          datas200 += `<option value="native">Native</option>`;
        }
        if ("enabled" == cloud_id_check) {
          datas200 += `<option value="enabled" selected>Enabled</option>`;
        } else {
          datas200 += `<option value="enabled">Enabled</option>`;
        }

        if ("based" == cloud_id_check) {
          datas200 += `<option value="based" selected>Based</option>`;
        } else {
          datas200 += `<option value="based">Based</option>`;
        }

        if (softwType_id_check) {
          var types = softwType_id_check.trim().split(",");

          if (types.includes("Process Automation")) {
            datas300 += `<div class="row"> 
            <div class="col">
            <div class="form-check">
                  <label  class="form-check-input"  for="v1">Process Automation</label>
                  <input type="checkbox" class="form-check-input" name="z1" value="1" id="v1" checked >
              </div></div>`;
          } else {
            datas300 += `<div class="row">  <div class="col"><div class="form-check"> 
                  <label  class="form-check-input"  for="v1">Process Automation</label>
                  <input type="checkbox" class="form-check-input" name="z1" value="1" id="v1">
                  </div></div>`;
          }
          if (types.includes("Alternative Investment")) {
            datas300 += `<div class="col"><div class="form-check"> 
                  <label  class="form-check-input"  for="v2">Alternative Investment</label>
                  <input type="checkbox" class="form-check-input" name="z2" value="2" id="v2" checked >
                  </div></div>`;
          } else {
            datas300 += `<div class="col"><div class="form-check">  
                  <label  class="form-check-input"  for="v2">Alternative Investment</label>
                  <input type="checkbox" class="form-check-input" name="z2" value="2" id="v2"  >
                  </div></div>`;
          }
          if (types.includes("Data Management")) {
            datas300 += `<div class="col"><div class="form-check">
                  <label  class="form-check-input"  for="v3">Data Management</label>
                  <input type="checkbox" class="form-check-input" name="z3" value="3" id="v3" checked >
              </div></div></div>`;
          } else {
            datas300 += `<div class="col"><div class="form-check">
                  <label  class="form-check-input"  for="v3">Data Management</label>
                  <input type="checkbox" class="form-check-input" name="z3" value="3" id="v3"  >
              </div></div></div>`;
          }
          if (types.includes("Data Transformation")) {
            datas300 += `<div class="row"><div class="col"><div class="form-check"> 
                  <label  class="form-check-input"  for="v4">Data Transformation</label>
                  <input type="checkbox" class="form-check-input" name="4" value="4" id="v4" checked >
              </div></div>`;
          } else {
            datas300 += `<div class="row"> <div class="col"><div class="form-check">
                  <label  class="form-check-input"  for="v4">Data Transformation</label>
                  <input type="checkbox" class="form-check-input" name="z4" value="4" id="v4"  >
              </div></div>`;
          }
          if (types.includes("Artificial Intelligence")) {
            datas300 += `<div class="col"><div class="form-check"> 
                  <label  class="form-check-input"  for="v5">Artificial Intelligence</label>
                  <input type="checkbox" class="form-check-input" name="z5" value="5" id="v5" checked >
              </div></div>`;
          } else {
            datas300 += `<div class="col"><div class="form-check">
                  <label  class="form-check-input"  for="v5">Artificial Intelligence</label>
                  <input type="checkbox" class="form-check-input" name="z5" value="5" id="v5"  >
              </div></div>`;
          }
          if (types.includes("Portfolio Management Trading")) {
            datas300 += `<div class="col"><div class="form-check"> 
                  <label  class="form-check-input"  for="v6">Portfolio Management Trading</label>
                  <input type="checkbox" required class="form-check-input" name="z6" value="6" id="v6" checked >
              </div></div></div>`;
          } else {
            datas300 += `<div class="col"><div class="form-check">
                  <label  class="form-check-input"  for="v6">Portfolio Management Trading</label>
                  <input type="checkbox" required class="form-check-input" name="z6" value="6" id="v6"  >
              </div></div></div>`;
          }
        } else {
          datas300 += `<div class="row"> <div class="col"><div class="form-check">
               <label  class="form-check-input"  for="v1">Process Automation</label>
               <input type="checkbox" class="form-check-input" name="z1" value="1" id="v1"  >
           </div></div>`;

          datas300 += `<div class="col"><div class="form-check">
               <label  class="form-check-input"  for="v2">Alternative Investment</label>
               <input type="checkbox" class="form-check-input" name="z2" value="2" id="v2"  >
           </div></div>`;

          datas300 += `<div class="col"><div class="form-check">
               <label  class="form-check-input"  for="v3">Data Management</label>
               <input type="checkbox" class="form-check-input" name="z3" value="3" id="v3"  >
           </div></div></div>`;

          datas300 += `<div class="row"> <div class="col"><div class="form-check">
               <label  class="form-check-input"  for="v4">Data Transformation</label>
               <input type="checkbox" class="form-check-input" name="z4" value="4" id="v4"  >
           </div></div>`;

          datas300 += `<div class="col"><div class="form-check">
               <label  class="form-check-input"  for="v5">Artificial Intelligence</label>
               <input type="checkbox" class="form-check-input" name="z5" value="5" id="v5"  >
           </div></div>`;

          datas300 += `<div class="col"><div class="form-check"> 
               <label  class="form-check-input"  for="v6">Portfolio Management Trading</label>
               <input type="checkbox" required class="form-check-input" name="z6" value="6" id="v6"  >
           </div></div></div>`;
        }

        datascentral = datascentral
          .replace(/\{\{cloud\}\}/g, datas200)
          .replace(/\{\{softwaretype\}\}/g, datas300);

        var fetchedQuery = q.query; //returns an object: { year: 2017, month: 'february' }
        // data = data
        //   .replace(/\{\{countryoption\}\}/g, datas)
        res.writeHead(200, { "Content-Type": "text/html" });
        //res.wr(datascentral);
        res.end(datascentral);
      }
    });
  }

  // Serve the HTML view product list
  if (pathname === "./deleteproduct") {
    fs.readFile("./views/index.html", "utf8", async (err, data) => {
      if (err) {
        getAlertCookie(0, "Product have not deleted successfully",res);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        if (q.query.id && q.query.w.trim() === "0") {
          console.log(q.query.id);
          console.log("deleteproduct..........");

          const [row1, fields1] = await pool.execute(
            `DELETE FROM product_product_type WHERE product_id=?`,
            [q.query.id]
          );
          const [rows2, fields2] = await pool.execute(
            `DELETE FROM rate_product WHERE product_id=?`,
            [q.query.id]
          );
          const [rows, fields] = await pool.execute(
            `DELETE FROM product WHERE Id=?`,
            [q.query.id]
          );
         
        getAlertCookie(
            1,
            "Product have been deleted successfully",res
          );
          
        } else {
          getAlertCookie(
            0,
            "Product have not deleted successfully",res
          );
        }
       
        res.writeHead(302, {
          "Content-Type": "text/html",
          Location: host1 + "/viewproductlist.html",
        });
        res.end();
      }
    });
  }

//////////////////////////////////////////////////////////    Samuel part end   //////////////////////////////////////////////////

  
 
//////////////////////////////////////////////////////////    Tundes part start   //////////////////////////////////////////////////

 // Method for landing page: Serve the HTML registration form(Babatunde)
 if (pathname === "./" || pathname === `./index.html`) {
  fs.readFile("./views/index.html", "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    }
  });
}
// Method for logout page(Babatunde)
if (pathname === "./logout") {
  fs.readFile("./views/index.html", "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      session.data.username = null;
      session.data.fullname = null;
      session.data.id = null;

      session.data.role_id = null;
      session.data.rolename = null;

      res.setHeader("Set-Cookie", `session= ;Path=/;Max-Age=0 ; HttpOnly`);
      res.writeHead(302, {
        "Content-Type": "text/html",
        Location: host1 + `/index.html`,
      });
      res.end();
    }
  });
}
  
if (pathname === "./setupregister.html") {
  fs.readFile('./views/setupregister.html', "utf8", (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    }
  });
}

if (pathname === "./register.html") {
  fs.readFile('./views/register.html', "utf8", async (err, data) => {
    try {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });

        const [rows, fields] = await pool.execute("SELECT * FROM country");

        datas += '<option value="">--select country--</option>';
        // You can also iterate over the results and access individual rows

        for (let result of rows) {
          datas += `<option value="${result.id}_${result.name}">${result.name}</option>`;
        }

        var fetchedQuery = q.query; //returns an object: { year: 2017, month: 'february' }
        data = data
          .replace(/\{\{countryoption\}\}/g, datas)
          .replace(/\{\{email\}\}/g, fetchedQuery.email)
          .replace(/\{\{password\}\}/g, fetchedQuery.password);

        res.write(data);
        res.end();
      }
    } catch (error) {
      console.error("Error executing query:", error);
    }
  });
}

// Serve the HTML view product list
if (pathname === "./pdf.html") {
  console.log(q.query.doc);
  console.log("q.query.idooooooooooooooooo");
  fs.readFile('./views/pdf.html', "utf8", async (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      const [rows, fields] = await pool.execute(
        `SELECT DISTINCT c.website,p.Cloud_type,p.name,p.last_reviewed_Date,p.pdf,p.modules,p.next_review_Date,p.financial_services_client_types,c.name as cname,p.Id,GROUP_CONCAT(pt.name) as concatenated_names  FROM product as p INNER JOIN company as c ON p.Company_id = c.id INNER JOIN product_product_type as ppt ON ppt.product_id = p.id  INNER JOIN product_type as pt ON pt.id = ppt.product_type_id WHERE p.id = ? GROUP BY
                c.website,
                p.Cloud_type,
                p.name,
                p.last_reviewed_Date,
                p.next_review_Date,
                p.financial_services_client_types,
                c.name,
                p.Id;`,
        [q.query.doc]
      );
      for (let result of rows) {
        datas = data.replace(/\{\{pdf\}\}/g, result.pdf);
      }

      res.writeHead(200, { "Content-Type": "text/html" });

      res.end(datas);
    }
  });
}

 // Serve the HTML view product list
 if (pathname === "./product.html") {
  console.log(q.query);
  let data4pdf = "";
  let yourrate = "";
  console.log("q.query............");
  fs.readFile('./views/product.html', "utf8", async (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      const [rows, fields] = await pool.execute(
        `SELECT DISTINCT IFNULL(rp.rate,0) as yourrate, IFNULL(w.id,0) as wid,c.id as cid ,c.website,p.Cloud_type,p.name,p.pdf,p.description,p.business_areas,p.modules,DATE_FORMAT(p.last_reviewed_Date,'%Y-%m-%d') as last_reviewed_Date,DATE_FORMAT(p.next_review_Date,'%Y-%m-%d') as next_review_Date,p.financial_services_client_types,c.name as cname,p.Id,GROUP_CONCAT(pt.name) as concatenated_names FROM product as p INNER JOIN company as c ON p.Company_id = c.id INNER JOIN product_product_type as ppt ON ppt.product_id = p.id  INNER JOIN product_type as pt ON pt.id = ppt.product_type_id  LEFT JOIN wishlist as w ON w.user_id= ? AND w.product_id=p.id LEFT JOIN rate_product as rp ON rp.user_id= ? AND rp.product_id=p.id WHERE p.id = ? GROUP BY
                c.website,
                p.Cloud_type,
                p.name,
                p.last_reviewed_Date,
                p.next_review_Date,
                p.financial_services_client_types,
                c.name,
                p.Id;`,
        [session.data.id, session.data.id, q.query.id]
      );

      const [rows1, fields1] = await pool.execute(
        `SELECT DISTINCT IFNULL(AVG(rate),0) as rate FROM rate_product WHERE product_id = ? `,
        [q.query.id]
      );

      console.log(rows);
      console.log("rowsrrrrrrrrrr..........");
      for (let result of rows) {
        var filerecord =
          __dirname + `\\uploads\\product\\${result.name}.pdf`;
        let editbutton = "";
        let editwish = "";
        let editwishdecision = "";
        if (clientname === session.data.rolename) {
          editbutton = "";
          editwish = result.wid == 0 ? "heart.svg" : "trace.svg";
          editwishdecision =
            result.wid == 0 ? "Add to wishlist" : "Remove from wishlist";
        } else {
          //editbutton =  `<p><a href="./updateproduct.html?id=${result.Id}"><button>Edit</button></a></p>`
          editwish = "";
          editwishdecision = "";

          editbutton = `<p><a href="editproduct.html?id=${result.Id}"><button>Edit</button></a></p>`;
        }
        if (result.pdf) {
          data4pdf = `<p><small>Pdf Document</small>:  <a href="./pdf.html?doc=${result.Id}"  >download attchment</a></p>`;
        }

        if (result.yourrate == 0) {
          yourrate += `<a href="./rate?id=${result.Id}&val=1"><span style="font-size: smaller;"> <img src="../assets/svg/star.svg" width="20px"  ></span></a>
          <a href="./rate?id=${result.Id}&val=2"><span style="font-size: smaller;"> <img src="../assets/svg/star.svg" width="20px"  ></span></a>
          <a href="./rate?id=${result.Id}&val=3"><span style="font-size: smaller;"> <img src="../assets/svg/star.svg" width="20px"  ></span></a>
          <a href="./rate?id=${result.Id}&val=4"><span style="font-size: smaller;"> <img src="../assets/svg/star.svg" width="20px"  ></span></a>
          <a href="./rate?id=${result.Id}&val=5"><span style="font-size: smaller;"> <img src="../assets/svg/star.svg" width="20px"  ></span></a>
        `;
        } else if (result.yourrate == 1) {
          yourrate += `<a href="./rate?id=${result.Id}&val=1"><span style="font-size: smaller;"> <img src="../assets/svg/redstar.svg" width="20px"  ></span></a>
          <a href="./rate?id=${result.Id}&val=2"><span style="font-size: smaller;"> <img src="../assets/svg/star.svg" width="20px"  ></span></a>
          <a href="./rate?id=${result.Id}&val=3"><span style="font-size: smaller;"> <img src="../assets/svg/star.svg" width="20px"  ></span></a>
          <a href="./rate?id=${result.Id}&val=4"><span style="font-size: smaller;"> <img src="../assets/svg/star.svg" width="20px"  ></span></a>
          <a href="./rate?id=${result.Id}&val=5"><span style="font-size: smaller;"> <img src="../assets/svg/star.svg" width="20px"  ></span></a>
        `;
        } else if (result.yourrate == 2) {
          yourrate += `<a href="./rate?id=${result.Id}&val=1"><span style="font-size: smaller;"> <img src="../assets/svg/redstar.svg" width="20px"  ></span></a>
          <a href="./rate?id=${result.Id}&val=2"><span style="font-size: smaller;"> <img src="../assets/svg/redstar.svg" width="20px"  ></span></a>
          <a href="./rate?id=${result.Id}&val=3"><span style="font-size: smaller;"> <img src="../assets/svg/star.svg" width="20px"  ></span></a>
          <a href="./rate?id=${result.Id}&val=4"><span style="font-size: smaller;"> <img src="../assets/svg/star.svg" width="20px"  ></span></a>
          <a href="./rate?id=${result.Id}&val=5"><span style="font-size: smaller;"> <img src="../assets/svg/star.svg" width="20px"  ></span></a>
        `;
        } else if (result.yourrate == 3) {
          yourrate += ` <a href="./rate?id=${result.Id}&val=1"><span style="font-size: smaller;"> <img src="../assets/svg/redstar.svg" width="20px"  ></span></a>
        <a href="./rate?id=${result.Id}&val=2"><span style="font-size: smaller;"> <img src="../assets/svg/redstar.svg" width="20px"  ></span></a>
        <a href="./rate?id=${result.Id}&val=3"><span style="font-size: smaller;"> <img src="../assets/svg/redstar.svg" width="20px"  ></span></a>
        <a href="./rate?id=${result.Id}&val=4"><span style="font-size: smaller;"> <img src="../assets/svg/star.svg" width="20px"  ></span></a>
        <a href="./rate?id=${result.Id}&val=5"><span style="font-size: smaller;"> <img src="../assets/svg/star.svg" width="20px"  ></span></a>
      `;
        } else if (result.yourrate == 4) {
          yourrate += ` <a href="./rate?id=${result.Id}&val=1"><span style="font-size: smaller;"> <img src="../assets/svg/redstar.svg" width="20px"  ></span></a>
      <a href="./rate?id=${result.Id}&val=2"><span style="font-size: smaller;"> <img src="../assets/svg/redstar.svg" width="20px"  ></span></a>
      <a href="./rate?id=${result.Id}&val=3"><span style="font-size: smaller;"> <img src="../assets/svg/redstar.svg" width="20px"  ></span></a>
      <a href="./rate?id=${result.Id}&val=4"><span style="font-size: smaller;"> <img src="../assets/svg/redstar.svg" width="20px"  ></span></a>
      <a href="./rate?id=${result.Id}&val=5"><span style="font-size: smaller;"> <img src="../assets/svg/star.svg" width="20px"  ></span></a>
    `;
        } else {
          yourrate += ` <a href="./rate?id=${result.Id}&val=1"><span style="font-size: smaller;"> <img src="../assets/svg/redstar.svg" width="20px"  ></span></a>
      <a href="./rate?id=${result.Id}&val=2"><span style="font-size: smaller;"> <img src="../assets/svg/redstar.svg" width="20px"  ></span></a>
      <a href="./rate?id=${result.Id}&val=3"><span style="font-size: smaller;"> <img src="../assets/svg/redstar.svg" width="20px"  ></span></a>
      <a href="./rate?id=${result.Id}&val=4"><span style="font-size: smaller;"> <img src="../assets/svg/redstar.svg" width="20px"  ></span></a>
      <a href="./rate?id=${result.Id}&val=5"><span style="font-size: smaller;"> <img src="../assets/svg/redstar.svg" width="20px"  ></span></a>
    `;
        }
        datas = data
          .replace(/\{\{navbar\}\}/g, navbar1)
          .replace(/\{\{typeofsoftware\}\}/g, result.concatenated_names)
          .replace(/\{\{modules\}\}/g, result.modules)
          .replace(/\{\{businessareas\}\}/g, result.business_areas)
          .replace(/\{\{cloud\}\}/g, result.Cloud_type)
          .replace(
            /\{\{clientservice\}\}/g,
            result.financial_services_client_types
          )
          .replace(/\{\{companyname\}\}/g, result.cname)
          .replace(/\{\{description\}\}/g, result.description)
          .replace(/\{\{Website\}\}/g, result.website)
          .replace(/\{\{pdf\}\}/g, result.pdf)
          .replace(/\{\{lastdatereviewed\}\}/g, result.last_reviewed_Date)
          .replace(/\{\{nextdatereview\}\}/g, result.next_review_Date)
          .replace(/\{\{pid\}\}/g, data4pdf)
          .replace(/\{\{productname\}\}/g, result.name)
          .replace(/\{\{editbutton\}\}/g, editbutton)
          .replace(/\{\{vid\}\}/g, result.cid)
          .replace(/\{\{id\}\}/g, result.Id)
          .replace(/\{\{hearted\}\}/g, editwish)
          .replace(/\{\{decide\}\}/g, editwishdecision)
          .replace(/\{\{rate\}\}/g, rows1[0].rate.toString(".")[0])
          .replace(/\{\{yourrate\}\}/g, yourrate)
          .replace(/\{\{decideval\}\}/g, result.wid == 0 ? "1" : "0").replace(/\{\{alerted\}\}/g, session.alerted);
      }
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(datas);
  });
}

// Serve the HTML view product list
if (pathname === "./profile.html")  {
 console.log(q.query.id); console.log("q.query.id");let userid = "";
  fs.readFile('./views/profile.html', "utf8", async (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      const [rows, fields] = await pool.execute(
        `SELECT GROUP_CONCAT(pt.name) as concatenated_names,u.email,u.firstname,u.lastname,u.username,u.address,u.dateofbirth,u.phonenumber,c.name,u.gender,u.id FROM users as u INNER JOIN user_product_type_choice as uppt ON uppt.user_id = u.id INNER JOIN country as c ON u.country_id = c.id  INNER JOIN product_type as pt ON pt.id = uppt.product_type_id WHERE u.id = ?  group by u.email;`,
        [q.query.id]
      );

      console.log(rows);
      console.log("jfjfjjfrows................");
      if (rows[0].id) {
        for (let result of rows) {
          console.log(result.dateofbirth);
          console.log(result.dateofbirth.toString("dd-MM-yyyy"));
          console.log("result.dateofbirth.toString");
          datas = data
            .replace(/\{\{navbar\}\}/g, navbar1)
            .replace(
              /\{\{fullname\}\}/g,
              `${result.firstname} ${result.lastname}`
            )
            .replace(/\{\{typeofsoftware\}\}/g, result.concatenated_names)
            .replace(/\{\{username\}\}/g, result.username)
            .replace(/\{\{email\}\}/g, result.email)
            .replace(/\{\{address\}\}/g, result.address)
            .replace(/\{\{country\}\}/g, result.name)
            .replace(/\{\{gender\}\}/g, result.gender)
            .replace(
              /\{\{dob\}\}/g,
              result.dateofbirth.toString("dd-MM-yyyy").split("G")[0]
            )
            .replace(/\{\{phonenumber\}\}/g, result.phonenumber)
            .replace(/\{\{id\}\}/g, result.id).replace(/\{\{alerted\}\}/g, session.alerted);
        }
      }
      res.writeHead(200, { "Content-Type": "text/html" });

      res.end(datas);
    }
  });
}

if (pathname === "./editprofile.html") {
  var country_id_check = 0;
  var gender_id_check = "";
  var softwType_id_check = "";
  fs.readFile('./views/editprofile.html', "utf8", async (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      // You can also iterate over the results and access individual rows
      const [rows, fields] = await pool.execute(
        `SELECT GROUP_CONCAT(pt.name)  as concatenated_names,u.email,u.firstname,u.lastname,u.username,u.address,u.dateofbirth,u.phonenumber,c.name,c.id as country_id,u.gender,u.id FROM users as u INNER JOIN user_product_type_choice as uppt ON uppt.user_id = u.id INNER JOIN country as c ON u.country_id = c.id  INNER JOIN product_type as pt ON pt.id = uppt.product_type_id WHERE u.id = ?;`,
        [q.query.id]
      );

      for (let result of rows) {
        const originalDate = result.dateofbirth;
        const utcYear = originalDate.getUTCFullYear();
        const utcMonth = originalDate.getUTCMonth() + 1; // Months are zero-based, so add 1
        const utcDay = originalDate.getUTCDate();
        const utcHours = originalDate.getUTCHours();
        const utcMinutes = originalDate.getUTCMinutes();
        const utcSeconds = originalDate.getUTCSeconds();

        // Format the date string in the required format
        const formattedDateString = `${utcYear}-${
          (utcMonth < 10 ? "0" : "") + utcMonth
        }-${(utcDay < 10 ? "0" : "") + utcDay}T${
          (utcHours < 10 ? "0" : "") + utcHours
        }:${(utcMinutes < 10 ? "0" : "") + utcMinutes}:${
          (utcSeconds < 10 ? "0" : "") + utcSeconds
        }.000Z`;

        console.log(result.dateofbirth.toString("dd-MM-yyyy"));
        console.log(result.dateofbirth.toString());
        console.log("result.dateofbirth.toString");
        var dob2 = `${result.dateofbirth}`;
        country_id_check = result.country_id;
        gender_id_check = result.gender;
        softwType_id_check = result.concatenated_names;
        datascentral = data
          .replace(/\{\{navbar\}\}/g, navbar1)
          .replace(/\{\{firstname\}\}/g, `${result.firstname}`)
          .replace(/\{\{lastname\}\}/g, `${result.lastname}`)

          .replace(/\{\{username\}\}/g, result.username)
          .replace(/\{\{email\}\}/g, result.email)
          .replace(/\{\{address\}\}/g, result.address)
          .replace(
            /\{\{dateofbirth\}\}/g,
            formattedDateString.split("T")[0]
          )
          .replace(/\{\{phonenumber\}\}/g, result.phonenumber)
          .replace(/\{\{id\}\}/g, result.id);

        console.log("result.dateofbirth.toString(.split()[0]");
      }

      const [rows1, fields1] = await pool.execute("SELECT * FROM country");

      datas += '<option value="">--select country--</option>';
      for (let result of rows1) {
        if (result.id == country_id_check) {
          datas += `<option value="${result.id}" selected>${result.name}</option>`;
        } else {
          datas += `<option value="${result.id}">${result.name}</option>`;
        }
      }
      datas200 += '<option value="">--select gender--</option>';

      if ("male" == gender_id_check) {
        datas200 += `<option value="male" selected>male</option>`;
      } else {
        datas200 += `<option value="male">male</option>`;
      }
      if ("female" == gender_id_check) {
        datas200 += `<option value="female" selected>female</option>`;
      } else {
        datas200 += `<option value="female">female</option>`;
      }

      if (softwType_id_check) {
        var types = softwType_id_check.trim().split(",");

        if (types.includes("Process Automation")) {
          datas300 += `<div class="row"> 
                <label for="v1">Process Automation</label>
                <input type="checkbox" class="input3" name="z1" value="1" id="v1" checked style="margin-bottom: 28px;">
            </div>`;
        } else {
          datas300 += `<div class="row"> 
                <label for="v1">Process Automation</label>
                <input type="checkbox" class="input3" name="z1" value="1" id="v1"  style="margin-bottom: 28px;">
            </div>`;
        }
        if (types.includes("Alternative Investment")) {
          datas300 += `<div class="row"> 
                <label for="v2">Alternative Investment</label>
                <input type="checkbox" class="input3" name="z2" value="2" id="v2" checked style="margin-bottom: 28px;">
            </div>`;
        } else {
          datas300 += `<div class="row"> 
                <label for="v2">Alternative Investment</label>
                <input type="checkbox" class="input3" name="z2" value="2" id="v2"  style="margin-bottom: 28px;">
            </div>`;
        }
        if (types.includes("Data Management")) {
          datas300 += `<div class="row"> 
                <label for="v3">Data Management</label>
                <input type="checkbox" class="input3" name="z3" value="3" id="v3" checked style="margin-bottom: 28px;">
            </div>`;
        } else {
          datas300 += `<div class="row"> 
                <label for="v3">Data Management</label>
                <input type="checkbox" class="input3" name="z3" value="3" id="v3"  style="margin-bottom: 28px;">
            </div>`;
        }
        if (types.includes("Data Transformation")) {
          datas300 += `<div class="row"> 
                <label for="v4">Data Transformation</label>
                <input type="checkbox" class="input3" name="4" value="4" id="v4" checked style="margin-bottom: 28px;">
            </div>`;
        } else {
          datas300 += `<div class="row"> 
                <label for="v4">Data Transformation</label>
                <input type="checkbox" class="input3" name="z4" value="4" id="v4"  style="margin-bottom: 28px;">
            </div>`;
        }
        if (types.includes("Artificial Intelligence")) {
          datas300 += `<div class="row"> 
                <label for="v5">Artificial Intelligence</label>
                <input type="checkbox" class="input3" name="z5" value="5" id="v5" checked style="margin-bottom: 28px;">
            </div>`;
        } else {
          datas300 += `<div class="row"> 
                <label for="v5">Artificial Intelligence</label>
                <input type="checkbox" class="input3" name="z5" value="5" id="v5"  style="margin-bottom: 28px;">
            </div>`;
        }
        if (types.includes("Portfolio Management Trading")) {
          datas300 += `<div class="row"> 
                <label for="v6">Portfolio Management Trading</label>
                <input type="checkbox" class="input3" name="z6" value="6" id="v6" checked style="margin-bottom: 28px;">
            </div>`;
        } else {
          datas300 += `<div class="row"> 
                <label for="v6">Portfolio Management Trading</label>
                <input type="checkbox" class="input3" name="z6" value="6" id="v6"  style="margin-bottom: 28px;">
            </div>`;
        }
      } else {
        datas300 += `<div class="row"> 
             <label for="v1">Process Automation</label>
             <input type="checkbox" class="input3" name="z1" value="1" id="v1"  style="margin-bottom: 28px;">
         </div>`;

        datas300 += `<div class="row"> 
             <label for="v2">Alternative Investment</label>
             <input type="checkbox" class="input3" name="z2" value="2" id="v2"  style="margin-bottom: 28px;">
         </div>`;

        datas300 += `<div class="row"> 
             <label for="v3">Data Management</label>
             <input type="checkbox" class="input3" name="z3" value="3" id="v3"  style="margin-bottom: 28px;">
         </div>`;

        datas300 += `<div class="row"> 
             <label for="v4">Data Transformation</label>
             <input type="checkbox" class="input3" name="z4" value="4" id="v4"  style="margin-bottom: 28px;">
         </div>`;

        datas300 += `<div class="row"> 
             <label for="v5">Artificial Intelligence</label>
             <input type="checkbox" class="input3" name="z5" value="5" id="v5"  style="margin-bottom: 28px;">
         </div>`;

        datas300 += `<div class="row"> 
             <label for="v6">Portfolio Management Trading</label>
             <input type="checkbox" class="input3" name="z6" value="6" id="v6"  style="margin-bottom: 28px;">
         </div>`;
      }

      datascentral = datascentral
        .replace(/\{\{gender\}\}/g, datas200)
        .replace(/\{\{countryOption\}\}/g, datas)
        .replace(/\{\{softwaretype\}\}/g, datas300);

      var fetchedQuery = q.query; //returns an object: { year: 2017, month: 'february' }
      // data = data
      //   .replace(/\{\{countryoption\}\}/g, datas)
      res.writeHead(200, { "Content-Type": "text/html" });
      //res.wr(datascentral);
      res.end(datascentral);
    }
  });
}

//////////////////////////////////////////////////////////    Tundes part end   //////////////////////////////////////////////////



//////////////////////////////////////////////////////////    Winnie part start   //////////////////////////////////////////////////

 // Method for login page (Babatunde)
 if (pathname === "./login.html") {
  fs.readFile("./views/login.html", "utf8", async (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    } else {
      const [rows, fields] = await pool.execute("SELECT * FROM role");

      datas += '<option value="">--select type of user--</option>';
      // You can also iterate over the results and access individual rows

      for (let result of rows) {
        datas += `<option value="${result.id}">${result.name}</option>`;
      }

      datas = data
        .replace(/\{\{loginOption\}\}/g, datas)
        .replace(/\{\{alerted\}\}/g, session.alerted);

      res.writeHead(200, { "Content-Type": "text/html" });

      res.write(datas);
      res.end();
    }
  });
}

// Dashboard for all users(Client,Vendor,Admin)
if (pathname === "./dashboard.html") {
  var productTitle = "";
  if (session.data.username) {
    fs.readFile('./views/dashboard.html', "utf8", async (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        try {
          if (clientname === session.data.rolename) {
            const [rows, fields] = await pool.execute(
              `SELECT DISTINCT  c.website,p.Cloud_type,p.name,DATE_FORMAT(p.created_at,'%Y-%m-%d') as created_at,p.last_reviewed_Date,p.next_review_Date,p.financial_services_client_types,c.name as cname,p.Id,GROUP_CONCAT(pt.name) as concatenated_names FROM product as p INNER JOIN company as c ON p.Company_id = c.id INNER JOIN product_product_type as ppt ON ppt.product_id = p.id INNER JOIN user_product_type_choice as uppt ON ppt.product_type_id = uppt.product_type_id INNER JOIN product_type as pt ON pt.id = uppt.product_type_id WHERE uppt.user_id = ? GROUP BY
c.website,
p.Cloud_type,
p.name,
p.last_reviewed_Date,
p.next_review_Date,
p.financial_services_client_types,
c.name,
p.Id ORDER BY p.created_at DESC;`,
              [session.data.id]
            );
            rowgotten = rows;
            productTitle = "Recommended Products";
          } else if (adminname === session.data.rolename) {
            AllClientCount = await pool.execute(`SELECT COUNT(id) as count
FROM users
WHERE role_id = 2;`);

            AllvendorCount = await pool.execute(`SELECT COUNT(id) as count
FROM company ;`);

            AllProductCount = await pool.execute(`SELECT COUNT(id) as count
FROM product ;`);

            AllClientCountToday =
              await pool.execute(`SELECT COUNT(id)  as count
FROM users
WHERE role_id = 2 AND MONTH(created_at)=${month} and DAY(created_at)=${day} and YEAR(created_at) = ${year};`);
            //Date(created_at)=${formattedDate};
            AllvendorCountToday =
              await pool.execute(`SELECT COUNT(id) as count
FROM company where MONTH(created_at)=${month} and DAY(created_at)=${day} and YEAR(created_at) = ${year};`);

            AllProductCountToday =
              await pool.execute(`SELECT COUNT(id) as count
FROM product where MONTH(created_at)=${month} and DAY(created_at)=${day} and YEAR(created_at) = ${year};`);

            console.log("AllProductCountToday.........");
            // rowgotten = rows;
          } else {
            const [rows, fields] = await pool.execute(
              `SELECT DISTINCT c.website,p.Cloud_type,p.name,p.last_reviewed_Date,DATE_FORMAT(p.created_at,'%Y-%m-%d') as created_at,p.next_review_Date,p.financial_services_client_types,c.name as cname,p.Id,GROUP_CONCAT(pt.name) as concatenated_names FROM product as p INNER JOIN company as c ON p.Company_id = c.id INNER JOIN product_product_type as ppt ON ppt.product_id = p.id  INNER JOIN product_type as pt ON pt.id = ppt.product_type_id WHERE p.Company_id = ? GROUP BY
                        c.website,
                        p.Cloud_type,
                        p.name,
                        p.last_reviewed_Date,
                        p.next_review_Date,
                        p.financial_services_client_types,
                        c.name,
                        p.Id ORDER BY p.created_at DESC;`,
              [session.data.id]
            );
            rowgotten = rows;
            productTitle = "My Products";
          }

          if (adminname === session.data.rolename) {
            productslists += ` <div class="background-land">
            <a href="./viewclientlist.html?qty=all"style="width: 24%;">  <div class="styled-box"  style="position: relative; margin: 20px;">
             
               <div class="row2" style="margin-bottom: 10px;">
                    <div class="col2">Total client</div>
                    <div  class="col2"><img src="../assets/svg/dashboardcardicon.svg" width="20"></div>
                  </div>
                  <div>${AllClientCount[0][0].count}</div>
                </div></a>
      
                <a href="./viewvendorlist.html?qty=all"style="width: 24%;">  <div class="styled-box"  style="position: relative; margin: 20px;">
             
                  <div class="row2" style="margin-bottom: 10px;">
                    <div class="col2">Total Vendor</div>
                    <div  class="col2"><img src="../assets/svg/dashboardcardicon.svg" width="20"></div>
                  </div>
                  <div>${AllvendorCount[0][0].count}</div>
                </div></a>
             
                <a href="./viewproductlist.html?qty=all"style="width: 24%;">   <div class="styled-box"  style="position: relative; margin: 20px;">
             
                <div class="row2" style="margin-bottom: 10px;">
                  <div class="col2">Total Product</div>
                  <div  class="col2"><img src="../assets/svg/dashboardcardicon.svg" width="20"></div>
                </div>
                <div>${AllProductCount[0][0].count}</div>
              </div></a>
              <a href="./viewproductlist.html?qty=today"style="width: 24%;">  <div class="styled-box"  style="position: relative; margin: 20px;">
             
                <div class="row2" style="margin-bottom: 10px;">
                  <div class="col2">New Product</div>
                  <div  class="col2"><img src="../assets/svg/dashboardcardicon.svg" width="20"></div>
                </div>
                <div>${AllProductCountToday[0][0].count}</div>
              </div>
            </div></a>
           
              <div class="background-land">
            
              <a href="./viewclientlist.html?qty=today"style="width: 24%;"> <div class="styled-box"  style="position: relative; margin: 20px;">
             
            <div class="row2" style="margin-bottom: 10px;">
              <div class="col2">New Client</div>
              <div  class="col2"><img src="../assets/svg/dashboardcardicon.svg" width="20"></div>
            </div>
            <div>${AllClientCountToday[0][0].count}</div>
          </div></a>
       
          <a href="./viewvendorlist.html?qty=today"style="width: 24%;">  <div class="styled-box"  style="position: relative; margin: 20px;">
             
          <div class="row2" style="margin-bottom: 10px;">
            <div class="col2">New Vendor</div>
            <div  class="col2"><img src="../assets/svg/dashboardcardicon.svg" width="20"></div>
          </div>
          <div>${AllvendorCountToday[0][0].count}</div>
        </div></a>
      </div>`;
          } else {
            productslists += `<div class="styled-box">
              <h3 class="box-heading">${productTitle}</h3>`;
            for (let result of rowgotten) {
              productslists += `<div class="background-land" style="width: 100%;">

              <div class="styled-box"  style="width: 100%; margin: 20px;">
                <div class="card" style="width: 100%;font-family: cambria;">
            
              <h2 style="text-align: center;background-color: #A5B3C7;font-family: cambria;height: 40px;">${result.name}<small  style="font-size: small;font-size: cambria;"> (Product Name)</small>  </h2>
              <div class="row"><h4 style="color:black;font-family: cambria;"><small  style="font-size: small;font-family: cambria;">Company Name:</small>  ${result.cname}</h4>
              <h4 style="color:black;font-family: cambria;"><small  style="font-size: small;font-family: cambria;">Date Added:</small>  ${result.created_at}</h4>
              <h4 style="color: black;font-family: cambria;"><small  style="font-size: small;font-family: cambria;">Website:</small>  <b><a href="${result.website}" target="_blank" style="text-decoration: none; color: black;">${result.website}</a></b></h4></div> 
              <p><a href="./product.html?id=${result.Id}"><button>view</button></a></p>
            
          </div> 
              </div>
        </div>`;
            }
            productslists += `</div>`;
          }

          datas = data
            .replace(/\{\{navbar\}\}/g, navbar1)
            .replace(/\{\{fullname\}\}/g, session.data.fullname)
            .replace(/\{\{rolename\}\}/g, session.data.rolename)
            .replace(/\{\{productlists\}\}/g, productslists);

          res.writeHead(200, { "Content-Type": "text/html" });

          console.log("dashboardpost1......");
          res.write(datas);
          res.end();
        } catch (error) {
          console.error("Error accessing image file:", error);
          jj1 = false; // Set jj1 to false if there was an error accessing the file
        }
      }
    });
  } else {
    res.writeHead(302, {
      "Content-Type": "text/html",
      Location: host1 + "/views/login.html",
    });
    console.log("dashboardpost2......");
    res.end();
  }
}

    // Serve the HTML view product list
    if (pathname === "./viewclientwishlist.html") {
      let rowgotten = [];
      let addproductbutton = " ";
      let deleteButton = " ";
      fs.readFile('./views/viewclientwishlist.html', "utf8", async (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        } else {
          if (clientname === session.data.rolename) {
            const [rows, fields] = await pool.execute(
              `SELECT DISTINCT p.created_at, c.website,p.Cloud_type,p.name,DATE_FORMAT(p.last_reviewed_Date,'%Y-%m-%d') as last_reviewed_Date,DATE_FORMAT(p.next_review_Date,'%Y-%m-%d') as next_review_Date,p.financial_services_client_types,c.name as cname,p.Id,GROUP_CONCAT(pt.name) as concatenated_names,DATE_FORMAT(p.created_at,'%Y-%m-%d') as created_at FROM product as p INNER JOIN company as c ON p.Company_id = c.id INNER JOIN product_product_type as ppt ON ppt.product_id = p.id INNER JOIN wishlist as uppt ON ppt.product_id = uppt.product_id INNER JOIN product_type as pt ON pt.id = ppt.product_type_id  WHERE uppt.user_id = ? GROUP BY
                        c.website,
                        p.Cloud_type,
                        p.name,
                        p.last_reviewed_Date,
                        p.next_review_Date,
                        p.financial_services_client_types,
                        c.name,
                        p.Id ORDER BY p.created_at DESC;`,
              [session.data.id]
            );
            rowgotten = rows;
          }
          if (rowgotten.length < 1) {
            productslists += "<tr><td>no data available</td></tr>";
          } else {
            for (var result of rowgotten) {
              if (clientname != session.data.rolename) {
                // deleteButton = `<td><a href="#" > Delete product</a></td>`;
                deleteButton = `<td><a href="./deleteproduct?id=${result.Id}" > Delete product</a></td>`;
              }
              /* <td><a href="${result.website}" target="_blank">${result.website}</a></td> */
              // <td>${result.financial_services_client_types}</td>
              productslists += ` <tr> <td> ${result.name}</td>
                <td>${result.concatenated_names}</td>
                <td>${result.cname}</td>
                <td>${result.created_at}</td>
                <td>${result.last_reviewed_Date}</td>
                <td>${result.next_review_Date}</td>
               
                <td><a href="./product.html?id=${result.Id}" > View Details</a></td> 
               ${deleteButton}
              </tr>`;
            }
          }
          res.writeHead(200, { "Content-Type": "text/html" });
          datas = data
            .replace(/\{\{navbar\}\}/g, navbar1)
            .replace(/\{\{productlist\}\}/g, productslists)
            .replace(/\{\{addproductbutton\}\}/g, addproductbutton);
          res.end(datas);
        }
      });
    }

    if (pathname === "./updatewishproduct") {
      fs.readFile("./views/index.html", "utf8", async (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        } else {
          if (q.query.id) {
            if (q.query.val == 0) {
              const [row1, fields1] = await pool.execute(
                `DELETE FROM wishlist WHERE user_id =? AND product_id = ?;`,
                [session.data.id, q.query.id]
              );
            }
            if (q.query.val == 1) {
              const sql = `INSERT INTO wishlist (user_id ,product_id,active) VALUES ?`;
              values = [[`${session.data.id}`, `${q.query.id}`, true]];

              const [rows1, fields1] = await pool.query(sql, [values]);
            }

            res.writeHead(302, {
              "Content-Type": "text/html",
              Location: host1 + `/product.html?id=${q.query.id}`,
            });
            res.end();
          }
        }
      });
    }

    if (pathname === "./rate") {
      fs.readFile("./views/index.html", "utf8", async (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        } else {
          if (q.query.id) {
            const rate = parseInt(q.query.val);
            if (rate >= 0 && rate <= 5) {
              const [row, fields] = await pool.execute(
                `DELETE FROM rate_product WHERE user_id =? AND product_id = ?;`,
                [session.data.id, q.query.id]
              );

              const sql = `INSERT INTO rate_product (user_id ,product_id,rate,active) VALUES ?`;
              values = [
                [`${session.data.id}`, `${q.query.id}`, `${q.query.val}`, true],
              ];

              const [rows1, fields1] = await pool.query(sql, [values]);
            }

            res.writeHead(302, {
              "Content-Type": "text/html",
              Location: host1 + `/product.html?id=${q.query.id}`,
            });
            res.end();
          }
        }
      });
    }

    if (pathname === "./vendorprofile.html") {
      fs.readFile('./views/vendorprofile.html', "utf8", async (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        } else {
          try {
            const [rows, fields] = await pool.execute(
              `SELECT  * FROM company WHERE id = ?`,
              [q.query.id]
            );
            console.log(rows);
            console.log(rows.length);
            console.log("rows.......");
            if (rows[0].id) {
              for (let r of rows) {
                datas = data
                  .replace(/\{\{navbar\}\}/g, navbar1)
                  .replace(/\{\{companyname\}\}/g, r.name)
                  .replace(/\{\{companyemail\}\}/g, r.email)
                  .replace(/\{\{website\}\}/g, r.website)
                  .replace(/\{\{established\}\}/g, r.year_established)
                  .replace(/\{\{countries\}\}/g, r.location_countries)
                  .replace(/\{\{cities\}\}/g, r.location_cities)
                  .replace(/\{\{phone\}\}/g, r.Phone_no)
                  .replace(/\{\{employees\}\}/g, r.number_of_employees)
                  .replace(/\{\{address\}\}/g, r.address)
                  .replace(/\{\{id\}\}/g, r.id).replace(/\{\{alerted\}\}/g, session.alerted);
              }
            }

            res.writeHead(200, { "Content-Type": "text/html" });

            res.write(datas);
            res.end();
          } catch (error) {
            console.error("Error accessing image file:", error);
            jj1 = false; // Set jj1 to false if there was an error accessing the file
          }
        }
      });
    }

    if (pathname === "./updatevendor.html") {
      fs.readFile('./views/updatevendor.html', "utf8", async (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        } else {
          try {
            const [rows, fields] = await pool.execute(
              `SELECT  * FROM company WHERE id = ?`,
              [q.query.id]
            );
            console.log(rows);
            console.log(rows.length);
            console.log("rows.......");
            if (rows.length > 0) {
              for (let r of rows) {
                datas = data
                  .replace(/\{\{navbar\}\}/g, navbar1)
                  .replace(/\{\{companyname\}\}/g, r.name)
                  .replace(/\{\{companyemail\}\}/g, r.email)
                  .replace(/\{\{website\}\}/g, r.website)
                  .replace(/\{\{established\}\}/g, r.year_established)
                  .replace(/\{\{countries\}\}/g, r.location_countries)
                  .replace(/\{\{cities\}\}/g, r.location_cities)
                  .replace(/\{\{phone\}\}/g, r.Phone_no)
                  .replace(/\{\{employees\}\}/g, r.number_of_employees)
                  .replace(/\{\{address\}\}/g, r.address)
                  .replace(/\{\{id\}\}/g, r.id);
              }
            } else {
              productslists = "no sales made yet";
            }

            res.writeHead(200, { "Content-Type": "text/html" });

            res.write(datas);
            console.log(datas);
            console.log("edit o............");
            res.end();
          } catch (error) {
            console.error("Error accessing image file:", error);
            jj1 = false; // Set jj1 to false if there was an error accessing the file
          }
        }
      });
    }

//////////////////////////////////////////////////////////    Winnie part end   //////////////////////////////////////////////////




//////////////////////////////////////////////////////////    Femis part start   //////////////////////////////////////////////////

  // Serve the HTML view product list
  if (pathname === "./viewvendorlist.html") {
    fs.readFile('./views/viewvendorlist.html', "utf8", async (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        if (adminname === session.data.rolename) {
         
          if(q.query.qty == "today"){
            const [rows, fields] =
              await pool.execute(`SELECT active,id,name,location_countries,website,DATE_FORMAT(created_at,'%Y-%m-%d') as created_at FROM company WHERE MONTH(created_at)=${month} and DAY(created_at)=${day} and YEAR(created_at) = ${year} ORDER BY created_at DESC`);
                                          rowgotten = rows;
            }else{
              const [rows, fields] =
              await pool.execute(`SELECT active,id,name,location_countries,website,DATE_FORMAT(created_at,'%Y-%m-%d') as created_at FROM company ORDER BY created_at DESC;`);
              rowgotten = rows;
            }

        } else {
          const [rows, fields] = await pool.execute(
            `SELECT active,id,name,location_countries,website,DATE_FORMAT(created_at,'%Y-%m-%d') as created_at FROM company WHERE id = ? ORDER BY created_at DESC;`,
            [session.data.id]
          );
          rowgotten = rows;
        }
        if (rowgotten.length < 1) {
          productslists += "<tr><td>no data available</tr></td>";
        } else {
          for (var result of rowgotten) {
            productslists += ` <tr> <td> ${result.name}</td>
              <td>${result.location_countries}</td>
              <td><a href="${result.website}" target="_blank">${result.website}</a></td>
              <td>${result.created_at}</td>
              <td>${result.active == 1?true:false}</td>
              <td><a href="./vendorprofile.html?id=${result.id}" > View Details</a></td>
              <td><a href="./deactivatevendor?id=${result.id}" > Deactivate vendor</a></td>
              <td><a href="./activatevendor?id=${result.id}" > Activate vendor</a></td>
            </tr>
            `;
          }
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        datas = data
          .replace(/\{\{navbar\}\}/g, navbar1)
          .replace(/\{\{vendorlist\}\}/g, productslists) .replace(/\{\{alerted\}\}/g, session.alerted);;
        res.end(datas);
      }
    });
  }

  // Serve the HTML view product list
  if (pathname === "./viewclientlist.html") {
    fs.readFile('./views/viewclientlist.html', "utf8", async (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        if(q.query.qty == "today"){
        const [rows, fields] =
          await pool.execute(`SELECT GROUP_CONCAT(pt.name)  as concatenated_names,u.email,u.firstname,u.lastname,u.lastname,u.active,c.name,u.gender,u.id,DATE_FORMAT(u.created_at,'%Y-%m-%d') as created_at FROM users as u INNER JOIN user_product_type_choice as uppt ON uppt.user_id = u.id INNER JOIN country as c ON u.country_id = c.id  INNER JOIN product_type as pt ON pt.id = uppt.product_type_id WHERE u.role_id > 1 AND MONTH(u.created_at)=${month} and DAY(u.created_at)=${day} and YEAR(u.created_at) = ${year} GROUP BY
                                      u.email,
                                      u.id ORDER BY u.created_at DESC`);
        rowgotten = rows;

        }else{
          const [rows, fields] =
          await pool.execute(`SELECT GROUP_CONCAT(pt.name)  as concatenated_names,u.email,u.firstname,u.lastname,u.lastname,u.active,c.name,u.gender,u.id,DATE_FORMAT(u.created_at,'%Y-%m-%d') as created_at FROM users as u INNER JOIN user_product_type_choice as uppt ON uppt.user_id = u.id INNER JOIN country as c ON u.country_id = c.id  INNER JOIN product_type as pt ON pt.id = uppt.product_type_id WHERE u.role_id > 1 GROUP BY
                                      u.email,
                                      u.id ORDER BY u.created_at DESC`);
        rowgotten = rows;

        }
        console.log(rowgotten[0]);
        console.log('rowgotten[0]........,ooo');
        if (rowgotten.length < 1) {
          productslists += "<tr><td>no data available</tr></td>";
        } else {
          for (var result of rowgotten) {
            
            productslists += ` <tr> <td> ${result.firstname} ${result.lastname}</td>
      <td> ${result.name}</td>
      <td>${result.email}</td>
      <td>${result.gender}</td>
      <td>${result.created_at}</td>

      <td>${result.concatenated_names}</td>
      <td>${result.active == 1?true:false}</td>
      <td><a href="./profile.html?id=${result.id}" > View Details</a></td>
            <td><a href="./deactivateclient?id=${result.id}" > Deactivate Client</a></td>
            <td><a href="./activateclient?id=${result.id}" >Activate Client</a></td>
    </tr>
    `;
          }
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        datas = data
          .replace(/\{\{navbar\}\}/g, navbar1)
          .replace(/\{\{clientlist\}\}/g, productslists) .replace(/\{\{alerted\}\}/g, session.alerted);
        res.end(datas);
      }
    });
  }

  // Serve the HTML view product list
  if (pathname === "./deactivatevendor") {
    fs.readFile("./views/index.html", "utf8", async (err, data) => {
      if (err) {
        
        getAlertCookie(0, "Vendor have not deactivated successfully",res);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        if (q.query.id) {
          console.log(q.query.id);
          console.log("deleteproduct..........");
          sql = `UPDATE company SET active = false
         WHERE id = ${mysql.escape(q.query.id)}`;
          await pool.execute(sql);
        getAlertCookie(1, "Vendor have been deactivated successfully",res);

          res.writeHead(302, {
            "Content-Type": "text/html",
            Location: host1 + "/viewvendorlist.html",
          });
          res.end();
        }
      }
    });
  }

  if (pathname === "./activatevendor") {
    fs.readFile("./views/index.html", "utf8", async (err, data) => {
      if (err) {
      
        getAlertCookie(0, "Vendor have not deactivated successfully",res);

        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        if (q.query.id) {
          console.log(q.query.id);
          console.log("deleteproduct..........");
          sql = `UPDATE company SET active = true
         WHERE id = ${mysql.escape(q.query.id)}`;
          await pool.execute(sql);
          getAlertCookie(1, "Vendor have been activated successfully",res);

          res.writeHead(302, {
            "Content-Type": "text/html",
            Location: host1 + "/viewvendorlist.html",
          });
          res.end();
        }
      }
    });
  }

  if (pathname === "./activateclient") {
    fs.readFile("./views/index.html", "utf8", async (err, data) => {
      if (err) {
      getAlertCookie(0, "Client have not activated successfully",res);

        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        if (q.query.id) {
         
      sql = `UPDATE users SET active = true
       WHERE id = ${mysql.escape(q.query.id)}`;
      const [rows1, fields1] = await pool.query(sql);
     
      getAlertCookie(1, "Client have been activated successfully",res);

          res.writeHead(302, {
            "Content-Type": "text/html",
            Location: host1 + "/viewclientlist.html",
          });
          res.end();
        }
      }
    });
  }


  if (pathname === "./deactivateclient") {
    fs.readFile("./views/index.html", "utf8", async (err, data) => {
      if (err) {
      getAlertCookie(0, "Client have not deactivated successfully",res);

        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        if (q.query.id) {
          
      sql = `UPDATE users SET active = false
     WHERE id = ${mysql.escape(q.query.id)}`;
      const [rows1, fields1] = await pool.query(sql);
      getAlertCookie(1, "Client have been deactivated successfully",res);

          res.writeHead(302, {
            "Content-Type": "text/html",
            Location: host1 + "/viewclientlist.html",
          });
          res.end();
        }
      }
    });
  }
  

//////////////////////////////////////////////////////////    Femis part end   //////////////////////////////////////////////////












    //////////////////////////////////////////POST POST POST METHODS
  } else if (req.method === "POST") {
    var sql = "";
    var newpathpdf = "";
    var newpathimg = "";
    var filer = {};
    var fielder = {};
    var fieldername = "";
    var values = [];
    var base64String = "";
    var base64Stringpdf = null;
  

//////////////////////////////////////////////////////////    Tundes part start   //////////////////////////////////////////////////

if (pathname === "./register.html") {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      // Parse form data (e.g., using querystring module)
      const formData = new URLSearchParams(body);
      const email = formData.get("email");
      if (formData.get("type") === "client") {
        // Extract form fields
        const username = formData.get("username");
        const firstname = formData.get("firstname");
        const lastname = formData.get("lastname");
        const address = formData.get("address");
        const gender = formData.get("gender");
        const dateofbirth = formData.get("dateofbirth");
        const country_id = parseInt(formData.get("country"));
        const phonenumber = formData.get("phonenumber");
        const password = formData.get("password");
        const role_id = client;
        const active = true;

        // Process registration data (e.g., save to database)
        sql =
          "INSERT INTO users (username,email,firstname,lastname,address,gender,dateofbirth,country_id,phonenumber,password,role_id,active) VALUES ?";
        values = [
          [
            `${username}`,
            `${email}`,
            `${firstname}`,
            `${lastname}`,
            `${address}`,
            `${gender}`,
            `${dateofbirth}`,
            country_id,
            `${phonenumber}`,
            `${password}`,
            role_id,
            active,
          ],
        ];
      }
      if (formData.get("type") === "vendor") {
        const name = formData.get("Companyname");
        fieldername = formData.get("Companyname");
        const website = formData.get("website");
        const location_countries = formData.get("countries");
        const address = formData.get("address");
        const location_cities = formData.get("cities");
        const year_established = formData.get("established");
        const number_of_employees = parseInt(formData.get("employees"));
        const Phone_no = formData.get("telephone");
        const password = formData.get("password");
        const role_id = vendor;
        const active = true;

        // Process registration data (e.g., save to database)
        sql =
          "INSERT INTO company (name,email,website,location_countries,address,location_cities,year_established,number_of_employees,Phone_no,password,role_id,active) VALUES ?";
        values = [
          [
            `${name}`,
            `${email}`,
            `${website}`,
            `${location_countries}`,
            `${address}`,
            `${location_cities}`,
            `${year_established}`,
            number_of_employees,
            `${Phone_no}`,
            `${password}`,
            role_id,
            active,
          ],
        ];
        console.log(values);
        console.log("company........");
      }

      const [rows1, fields1] = await pool.query(sql, [values]);

      console.log("reg inserted");

      const [rows, fields] = await pool.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      for (let result of rows) {
        idDatas += result.id;
        console.log("id: ", idDatas);
      }
      let producttypename='';
      for (var form of formData.keys()) {
        if (form.charAt(0) === "z") {
          var sqld =
            "INSERT INTO user_product_type_choice (product_type_id,user_id,active) VALUES ?";
           let producttype = formData.get(form)
          let producttypeid = parseInt(producttype.split('_')[0]);

           producttypename += `${producttype.split('_')[1]}, `;
         
          let user_id = parseInt(idDatas);
          var values2 = [[producttypeid, user_id, true]];
          console.log("choice: ", values2);

          const [rows, fields] = await pool.query(sqld, [values2]);

          console.log("choice inserted");
        }
      }
      if (formData.get("type") === "vendor") {
        let info= `${fieldername}/${email} (vendor) registered on our platform`;
        var sqld =
           "INSERT INTO notification (message,delivered_to) VALUES ?";
           var values2 = [[info, adminname]];       
           const [rows, fields] = await pool.query(sqld, [values2]);
     await getAlertCookie(1, "Vendor have been registered successfully", res);

      }else{

         let info= `${email} (client) registered and interested in these product types: ${producttypename}, `;
         var sqld =
            "INSERT INTO notification (message,delivered_to) VALUES ?";
            var values2 = [[info, vendorname]];       
            const [rows, fields] = await pool.query(sqld, [values2]);

      await getAlertCookie(1, "Client have been registered successfully", res);


      }
    } catch (error) {
    
      console.error("Error executing query:", error);
    }
  });

  res.writeHead(302, {
    "Content-Type": "text/html",
    Location: host1 + "/login.html",
  });
  res.end();
}
  
if (pathname === "./editprofile.html") {
  let body = "";
  let universalId = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      // Parse form data (e.g., using querystring module)
      const formData = new URLSearchParams(body);
      const email = formData.get("email");
      const id = parseInt(formData.get("id"));
      universalId = formData.get("id");
      console.log(universalId);
      console.log("universalId22222.....");
      // Extract form fields
      const username = formData.get("username");
      const firstname = formData.get("firstname");
      const lastname = formData.get("lastname");
      const address = formData.get("address");
      const gender = formData.get("gender");
      const dateofbirth = formData.get("dateofbirth");
      const country_id = parseInt(formData.get("country"));
      const phonenumber = formData.get("phonenumber");

      // const role_id = Session.data.role_id;
      // const active = true;

      // Process registration data (e.g., save to database)
      sql = `UPDATE users SET username = ${mysql.escape(
        username
      )}, email = ${mysql.escape(email)}, firstname = ${mysql.escape(
        firstname
      )}, lastname = ${mysql.escape(lastname)}, address = ${mysql.escape(
        address
      )}, gender = ${mysql.escape(gender)}, dateofbirth = ${mysql.escape(
        dateofbirth
      )}, country_id = ${mysql.escape(
        country_id
      )}, phonenumber = ${mysql.escape(
        phonenumber
      )} WHERE id = ${mysql.escape(id)}`;

      const [rows1, fields1] = await pool.query(sql);

      for (var key of formData.keys()) {
        if (/^z\d/.test(key)) {
          // Key matches the pattern
          console.log(`Key '${key}' matches the pattern`);
          await pool.query(
            "delete from user_product_type_choice where user_id=?",
            [id]
          );
          break;
        }
      }
      for (var form of formData.keys()) {
        if (form.charAt(0) === "z") {
          var sqld =
            "INSERT INTO user_product_type_choice (product_type_id,user_id,active) VALUES ?";
          let pci = parseInt(formData.get(form));
          let ui = id;
          var values2 = [[pci, ui, true]];
          console.log("choice: ", values2);

          const [rows, fields] = await pool.query(sqld, [values2]);

          console.log("choice inserted");
        }
      }
      getAlertCookie(1, "User have been updated successfully", res);

    } catch (error) {
      getAlertCookie(0, "User have not updated successfully", res);

      console.error("Error executing query:", error);
    }
    console.log(universalId);
    console.log("universalId1111.....");
    res.writeHead(302, {
      "Content-Type": "text/html",
      Location: host1 + `/profile.html?id=${universalId}`,
    });
    res.end();
  });
}

//////////////////////////////////////////////////////////    Tundes part end   //////////////////////////////////////////////////



//////////////////////////////////////////////////////////    Winnie part start   //////////////////////////////////////////////////

if (pathname === "./login.html") {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      // Parse form data (e.g., using querystring module)
      const formData = new URLSearchParams(body);

      const email = formData.get("email");

      const password = formData.get("password");
      const role_id = formData.get("role_id");
      if (formData.get("role_id") === vendor.toString()) {
        // Process registration data (e.g., save to database)
        sql =
          "SELECT * FROM company WHERE email = ? and password = ? and role_id = ? and active = true";
        values = [email, password, role_id];
      } else {
        sql =
          "SELECT * FROM users WHERE email = ? and password = ? and role_id = ? and active = true";
        values = [email, password, role_id];
      }
      const [rows, fields1] = await pool.query(sql, values);
      if (rows.length < 1) {
        console.log("tadadadadada");

        getAlertCookie(0, "User have not logged in successfully", res);
        // res.setHeader(
        //   "Set-Cookie",
        //   `alerted=${alerted} ;Path=/;Max-Age=15 ; HttpOnly`
        // );
        res.writeHead(302, {
          "Content-Type": "text/html",
          Location: host1 + "/login.html",
        });
        res.end();
      } else {
        // session.data.username = rows[0].username || rows[0].email.split('@')[0];
        // session.data.fullname = `${rows[0].firstname || rows[0].name} ${
        //   rows[0].lastname || " "
        // } `;
        // session.data.id = rows[0].id;
        if (!session.sessionId) {
          session.sessionId = sessionId2;
        }
        let rolenm = 0;

        if (rows[0].role_id == client) {
          rolenm = clientname;
        } else if (rows[0].role_id == admin) {
          rolenm = adminname;
        } else {
          rolenm = vendorname;
        }

        var cooked = `hhh#ll!sessionId#${session.sessionId}!sessionu#${
          rows[0].username || rows[0].name
        }!sessionf#${rows[0].firstname || rows[0].name} ${
          rows[0].lastname || " "
        }!sessioni#${rows[0].id}!sessionri#${
          rows[0].role_id
        }!sessionrn#${rolenm}`;

        res.setHeader(
          "Set-Cookie",
          `session=${cooked} ;Path=/;Max-Age=3600 ; HttpOnly`
        );
        getAlertCookie(1, "User have been logged in successfully", res);

        // res.setHeader(
        //   "Set-Cookie", [
        //   `session=${cooked}; Path=/; Max-Age=3600; HttpOnly`,
        //   `alerted=${alerted}; Path=/; Max-Age=15; HttpOnly`,
        // ]);
        console.log(cooked);
        console.log("cooked.......");

        res.writeHead(302, {
          "Content-Type": "text/html",
          Location: host1 + "/dashboard.html",
        });
        console.log("loginpost......");

        res.end();
      }
    } catch (error) {
      console.error("Error executing query:", error);
    }
  });
}

if (pathname === "./updatevendor.html") {
  let body = "";
  let universalId = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      // Parse form data (e.g., using querystring module)
      const formData = new URLSearchParams(body);
      const email = formData.get("email");
      const id = parseInt(formData.get("id"));
      universalId = formData.get("id");

      const name1 = formData.get("companyname");
      const website = formData.get("website");
      const location_countries = formData.get("countries");
      const address = formData.get("address");
      const location_cities = formData.get("cities");
      const year_established = formData.get("established");
      const number_of_employees = parseInt(formData.get("employees"));
      const Phone_no = formData.get("telephone");

      // Process registration data (e.g., save to database)
      sql = `UPDATE company SET name = ${mysql.escape(
        name1
      )}, email = ${mysql.escape(email)}, website = ${mysql.escape(
        website
      )}, location_countries = ${mysql.escape(
        location_countries
      )}, address = ${mysql.escape(
        address
      )}, location_cities = ${mysql.escape(
        location_cities
      )}, year_established = ${mysql.escape(
        year_established
      )}, number_of_employees = ${mysql.escape(
        number_of_employees
      )}, Phone_no = ${mysql.escape(Phone_no)} WHERE id = ${mysql.escape(
        id
      )}`;
      //  values = [name1, email, website, location_countries, address, location_cities, year_established, number_of_employees, Phone_no, representative, description, id];

      console.log(values);
      console.log("company........");

      const [rows1, fields1] = await pool.query(sql);
      getAlertCookie(1, "Vendor have been updated successfully", res);

    } catch (error) {
      getAlertCookie(0, "Vendor have not updated successfully", res);

      console.error("Error executing query:", error);
    }

    res.writeHead(302, {
      "Content-Type": "text/html",
      Location: host1 + `/vendorprofile.html?id=${universalId}`,
    });
    res.end();
  });
}

//////////////////////////////////////////////////////////    Winnie part end   //////////////////////////////////////////////////





   



//////////////////////////////////////////////////////////    Samuel part start   //////////////////////////////////////////////////
   
if (pathname === "./addproduct.html") {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  console.log(__dirname);
  console.log("__dirname");
  console.log(process.cwd());
  console.log("process.cwd()");
  req.on("end", async () => {
    try {
      const formData = new URLSearchParams(body);

      const name = formData.get("softwarename");
      const business_areas = formData.get("businessareas");
      const description = formData.get("description");
      const additionalinformation = formData.get("additionalinformation");
      const modules = formData.get("modules");
      const financial_services_client_types = formData.get(
        "financialservicesclientypes"
      );
      const Cloud_type = formData.get("cloud");
      const active = true;
      const Company_id = session.data.id;

      // Process registration data (e.g., save to database)last_reviewed_Date,
      sql =
        "INSERT INTO product (name,business_areas,description,additional_info,modules,financial_services_client_types,Cloud_type,last_reviewed_Date,next_review_Date,Company_id,active) VALUES ?";
      values = [
        [
          `${name}`,
          `${business_areas}`,
          `${description}`,
          `${additionalinformation}`,
          `${modules}`,
          `${financial_services_client_types}`,
          `${Cloud_type}`,
          `1960-01-01`,
          `${formattedDate2}`,
          `${Company_id}`,
          active,
        ],
      ];
      console.log(formData.get("softwarename"));
      console.log("valuessssssssssssssssss.");
      const [rows1, fields1] = await pool.query(sql, [values]);

      var productidgotten = await new Promise((resolve, reject) => {
        if (rows1.affectedRows < 1) {
          console.log("tadadadadadapppppp");
          reject("tadadadadadapppppperr");
          res.writeHead(302, {
            "Content-Type": "text/html",
            Location: host1 + "/views/addproduct.html",
          });
          res.end();
        } else {
          console.log(rows1);
          console.log("product inserted");
          resolve(rows1.insertId);
        }
      });

      console.log(productidgotten);
      console.log("fielder.keys()............");
      for (var form of formData.keys()) {
        if (form.charAt(0) === "z") {
          var sqld =
            "INSERT INTO product_product_type (product_type_id,product_id,active) VALUES ?";
          let pci = parseInt(formData.get(form));
          var values2 = [[pci, productidgotten, true]];
          console.log("product product inserted values: ", values2);

          const [rows, fields] = await pool.query(sqld, [values2]);

          console.log("product product inserted");
        }
      }
      let info= `${session.data.fullname} (vendor) added a product: ${name}, `;
         var sqld =
            "INSERT INTO notification (message,delivered_to) VALUES ?";
            var values2 = [[info, adminname]];       
            const [rows, fields] = await pool.query(sqld, [values2]);

      getAlertCookie(1, "Product have been added successfully", res);

      res.writeHead(302, {
        "Content-Type": "text/html",
        Location: host1 + "/viewproductlist.html",
      });
      console.log("loginpost......");

      res.end();
    } catch (error) {
      getAlertCookie(0, "Product have not added successfully", res);

      console.error("Error executing query:", error);
    }
  });
}

if (pathname === "./editproduct.html") {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  console.log(__dirname);
  console.log("__dirname");
  console.log(process.cwd());
  console.log("process.cwd()");
  req.on("end", async () => {
    try {
      const formData = new URLSearchParams(body);
      const email = formData.get("softwarename");
      const id = parseInt(formData.get("id"));
      universalId = formData.get("id");

      const name = formData.get("softwarename");
      const business_areas = formData.get("businessareas");
      const description = formData.get("description");
      const additionalinformation = formData.get("additionalinformation");
      const modules = formData.get("modules");
      const financial_services_client_types = formData.get(
        "financialservicesclientypes"
      );
      const Cloud_type = formData.get("cloud");

      sql = `UPDATE product SET name = ${mysql.escape(
        name
      )}, business_areas = ${mysql.escape(
        business_areas
      )}, description = ${mysql.escape(
        description
      )}, additional_info = ${mysql.escape(
        additionalinformation
      )}, modules = ${mysql.escape(
        modules
      )}, financial_services_client_types = ${mysql.escape(
        financial_services_client_types
      )}, Cloud_type = ${mysql.escape(
        Cloud_type
      )} WHERE id = ${mysql.escape(id)}`;

      const [rows1, fields1] = await pool.query(sql, [values]);

      console.log("fielder.keys()............");
      for (var key of formData.keys()) {
        if (/^z\d/.test(key)) {
          // Key matches the pattern
          console.log(`Key '${key}' matches the pattern`);
          await pool.query(
            "delete from product_product_type where product_id=?",
            [id]
          );
          break;
        }
      }
      for (var form of formData.keys()) {
        if (form.charAt(0) === "z") {
          var sqld =
            "INSERT INTO product_product_type (product_type_id,product_id,active) VALUES ?";
          let pci = parseInt(formData.get(form));
          var values2 = [[pci, id, true]];
          console.log("product product inserted values: ", values2);

          const [rows, fields] = await pool.query(sqld, [values2]);

          console.log("product product inserted");
        }
      }
      getAlertCookie(1, "Product have been updated successfully", res);

      res.writeHead(302, {
        "Content-Type": "text/html",
        Location: host1 + `/product.html?id=${universalId}`,
      });
      console.log("loginpost......");

      res.end();
    } catch (error) {
      getAlertCookie(0, "Product have not updated successfully", res);

      console.error("Error executing query:", error);
    }
  });
}

if (pathname === "./editproductdocument.html") {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  console.log(__dirname);
  console.log("__dirname");
  console.log(process.cwd());
  console.log("process.cwd()");

  var form = new formidable.IncomingForm();

  var result = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
  console.log(result);
  console.log("jjj..........");
  var keyspdf = await new Promise((resolve, reject) => {
    if (result.fields || result.files) {
      fielder = result.fields;
      filer = result.files;
      const fil = Object.keys(filer);
      console.log(fil);
      console.log("jjj.jhk.........");
      resolve(Object.keys(fil));
    } else {
      throw "error";
    }
  });

  if (keyspdf.length > 0) {
    const base64Stringpdfkk = await new Promise((resolve, reject) => {
      if (filer.pdf[0].filepath) {
        resolve(fs.readFileSync(filer.pdf[0].filepath));
      } else {
        reject("err");
      }
    });

    base64Stringpdf = base64Stringpdfkk.toString("base64");

    await new Promise((resolve, reject) => {
      fs.unlink(filer.pdf[0].filepath, function (err) {
        if (err) {
          reject(err);
        } else {
          console.log("pdf deleted!");
          resolve("pdf deleted!");
        }
      });
    });
  }

  try {
    let idOfPdf = parseInt(fielder.id);
    console.log(idOfPdf);
    console.log("idOfPdf.....");

    sql = `UPDATE product SET pdf = ${mysql.escape(
      base64Stringpdf
    )} WHERE id = ${mysql.escape(idOfPdf)}`;

    const result3 = await new Promise((resolve, reject) => {
      if (!idOfPdf) {
        reject("rrr");
      } else {
        console.log(result.affectedRows + " record(s) updated");

        resolve(pool.query(sql));
      }
    });

    console.log(result3);
    console.log("pdf updated1!");
    if (result3.affectedRows < 1) {
      getAlertCookie(0, "Product have not updated successfully", res);

      res.writeHead(302, {
        "Content-Type": "text/html",
        Location: host1 + "/addproduct.html",
      });
      res.end();
    } else {
      console.log("pdf updated2!");
      getAlertCookie(1, "Product have been updated successfully", res);

      res.writeHead(302, {
        "Content-Type": "text/html",
        Location: host1 + `/product.html?id=${fielder.id}`,
      });
      res.end();
    }
  } catch (error) {
    getAlertCookie(0, "Product have not updated successfully", res);

    console.error("Error executing query:", error);
  }
}

if (pathname === "./editproductreview.html") {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  console.log(__dirname);
  console.log("__dirname");
  console.log(process.cwd());
  console.log("process.cwd()");
  req.on("end", async () => {
    try {
      const formData = new URLSearchParams(body);
      const id = parseInt(formData.get("id"));
      universalId = formData.get("id");

      const last_reviewed_Date = formData.get("lastreview");
      const next_review_Date = formData.get("nextreview");

      sql = `UPDATE product SET last_reviewed_Date = ${mysql.escape(
        last_reviewed_Date
      )}, next_review_Date = ${mysql.escape(
        next_review_Date
      )} WHERE id = ${mysql.escape(id)}`;

      const [rows1, fields1] = await pool.query(sql, [values]);
      getAlertCookie(1, "Product have been updated successfully", res);

      res.writeHead(302, {
        "Content-Type": "text/html",
        Location: host1 + `/product.html?id=${universalId}`,
      });
      console.log("loginpost......");

      res.end();
    } catch (error) {
      getAlertCookie(0, "Product have not updated successfully", res);

      console.error("Error executing query:", error);
    }
  });
}

//////////////////////////////////////////////////////////    Samuel part end   //////////////////////////////////////////////////


  }





//////////////////////////////////////////////////////////    Femis part start   //////////////////////////////////////////////////

  ///ASSET ASSETS ASSETS ASSETS
  {
    if (
      req.url.endsWith(".JPG") ||
      req.url.endsWith(".jpg") ||
      req.url.endsWith(".jpeg") ||
      req.url.endsWith(".png") ||
      req.url.endsWith(".svg")
    ) {
      // Read the image file
      if (
        req.url.endsWith(".jpeg") ||
        req.url.endsWith(".jpg") ||
        req.url.endsWith(".JPG")
      ) {
        fs.readFile(pathname, (err, data) => {
          if (err) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Image not found");
          } else {
            // Set Content-Type header to indicate image/jpeg
            res.writeHead(200, { "Content-Type": "image/jpg" });
            // Send the image data as the response
            res.end(data);
          }
        });
      }
      if (req.url.endsWith(".png")) {
        fs.readFile(pathname, (err, data) => {
          if (err) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Image not found");
          } else {
            // Set Content-Type header to indicate image/jpeg
            res.writeHead(200, { "Content-Type": "image/png" });
            // Send the image data as the response
            res.end(data);
          }
        });
      }
      if (req.url.endsWith(".svg")) {
        fs.readFile(pathname, (err, data) => {
          if (err) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Image not found");
          } else {
            // Set Content-Type header to indicate image/jpeg
            res.writeHead(200, { "Content-Type": "image/svg+xml" });
            // Send the image data as the response
            res.end(data);
          }
        });
      }
    }

    if (req.url.endsWith(".css")) {
      // Read the CSS file
      fs.readFile(pathname, "utf8", (err, data) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("404 Not Found");
        } else {
          // Set Content-Type header
          res.writeHead(200, { "Content-Type": "text/css" });
          // Send the CSS content
          res.end(data);
        }
      });
    }

    if (req.url.endsWith(".js")) {
      // Read the CSS file
      fs.readFile(pathname, "utf8", (err, data) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("404 Not Found");
        } else {
          // Set Content-Type header
          res.writeHead(200, { "Content-Type": "text/javascript" });
          // Send the CSS content
          res.end(data);
        }
      });
    }
  }

  //////////////////////////////////////////////////////////    Femis part end   //////////////////////////////////////////////////

});


// Function to parse cookies from the request header
function parseCookies(req) {
  const cookieHeader = req.headers.cookie;
  console.log(req.headers.cookie);
  console.log("cookieHeader..........");
  const cookies = {};
  if (cookieHeader) {
    console.log("cookieHeader....in......");
    cookieHeader.split("!").forEach((cookie) => {
      const parts = cookie.split("#");
      cookies[parts[0].trim()] = parts[1].trim();
    });
  }
  return cookies;
}

async function getAlertCookie(status, message, res)  {
  var template = "";

  template = `hhkj#llo!alertedid#${status}!alertedvalue#${message}`;

  // Assuming 'res' is the response object
  let existingCookies = res.getHeader("Set-Cookie") || [];
  existingCookies = Array.isArray(existingCookies)
    ? existingCookies
    : [existingCookies];

  // Append the new cookie to the existing cookies
  const newCookie = `alerted=${template}; Path=/; Max-Age=1; HttpOnly`;
  existingCookies.push(newCookie);

  // Set the updated list of cookies in the response headers
  res.setHeader("Set-Cookie", existingCookies);

  return template;
}

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
