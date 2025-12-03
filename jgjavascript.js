  var stateObj = { foo: "bar" };


async function loadNavigation() {
    console.log('loading nav...');
    try {
        const response = await fetch('nav.html');
        console.log('response status:', response.status);
        const navHtml = await response.text();
        console.log('nav loaded length:', navHtml.length);
        document.getElementById('nav-placeholder').innerHTML = navHtml;
    } catch (error) {
        console.error('nav load error:', error);
    }
}

// Call the function immediately (as before)
loadNavigation();

        // Updated to the current Google Charts loader
        google.charts.load('current', {'packages':['corechart']});
        google.charts.setOnLoadCallback(NextTask);

        function NextTask() {
            filldata();
            GetResults();
        }

        function filldata() {
            var myparams = window.location.search;
            if (myparams.charAt(0) === '?') {
                myparams = myparams.substring(1);
            }
            if (!myparams) return;

            var parray = myparams.split('&');

            for (var i = 0; i < parray.length; i++) {
                var prray = parray[i].split('=');
                var a = prray[0];
                var b = decodeURIComponent(prray[1] || ""); // decoding makes it safer

                if (a == 't') {
                    var tagray = b.split('_');
                    document.getElementById("txtFilter").value = ""; 
                    for (var j = 0; j < tagray.length; j++) {            
                        document.getElementById("txtFilter").value += tagray[j];
                        if (j != tagray.length - 1) {
                            document.getElementById("txtFilter").value += " ";
                        } 
                    }
                }
                
                if (a == 'd') {
                    var selectBox = document.getElementById("selectBox");
                    switch (b) {
                        case "week": selectBox.value = "week"; break;
                        case "month": selectBox.value = "month"; break;
                        case "year": selectBox.value = "year"; break;
                        case "decade": selectBox.value = "decade"; break;
                        case "century": selectBox.value = "century"; break;
                        default: selectBox.value = "All";
                    }
                }
            } 
        }

        function GetResults() {
            updateURL();
            var myFilter = document.getElementById("txtFilter").value;
            myFilter = myFilter ? myFilter.toUpperCase() : "";
            
            var selectBox = document.getElementById("selectBox");
            var selectedValue = selectBox.options[selectBox.selectedIndex].value;
            
            var d = new Date();
            
            switch (selectedValue) {
                case "week": d.setDate(d.getDate() - 7); break;
                case "month": d.setDate(d.getDate() - 30); break;
                case "year": d.setDate(d.getDate() - 365); break;
                case "decade": d.setDate(d.getDate() - 3650); break;
                case "century": d.setDate(d.getDate() - 36500); break;
            }

            var myyear = d.getFullYear();
            var mymonth = (d.getMonth() + 1).toString().padStart(2, '0');
            var myday = d.getDate().toString().padStart(2, '0');
            
            var mycowdate = myyear + '-' + mymonth + '-' + myday;
            
            var myQuery = 'SELECT *'
            if (selectedValue != 'All') {
                myQuery = myQuery + " WHERE E > date '" + mycowdate + "'";
            }
            
            if (myFilter) {
                if (selectedValue == 'All') {
                    myQuery = myQuery + " WHERE";
                } else { 
                    myQuery = myQuery + " AND";
                }
                
                var farray = myFilter.split(' ');
                myQuery = myQuery + " ("; 
                for (var j = 0; j < farray.length; j++) {  
                    if (j > 0) myQuery = myQuery + " OR ";
                    myQuery = myQuery + "(";
                    myQuery = myQuery + "upper(B) Like '%" + farray[j] + "%'";
                    myQuery = myQuery + " OR upper(C) Like '%" + farray[j] + "%'";
                    myQuery = myQuery + " OR upper(D) Like '%" + farray[j] + "%'";
                    myQuery = myQuery + " OR upper(F) Like '%" + farray[j] + "%'";
                    myQuery = myQuery + ")";
                }
                myQuery = myQuery + ")";
            }
            
            myQuery = myQuery + " Order by A desc";
            
            var queryString = encodeURIComponent(myQuery);
            var magicIncantation = '/gviz/tq?gid=0&headers=1&tq=';
            // ******** UPDATED SHEET URL HERE ***********
            var myURL = 'https://docs.google.com/spreadsheets/d/1PHfLhnSfhcZpMvKiar99mJtE-DGKDxpqk8ISCODPtSk';
            var myFullURL = myURL + magicIncantation + queryString;
            
            var query = new google.visualization.Query(myFullURL);
            query.send(handleSampleDataQueryResponse);
        }

        function handleSampleDataQueryResponse(response) {
            if (response.isError()) {
                document.getElementById("myDiv3").innerHTML = 'Error contacting Google Sheet. Please ensure the Sheet is "Shared with anyone with the link". <br><br>Details: ' + response.getMessage();
                return;
            }

            var data = response.getDataTable();
            var num_rows = data.getNumberOfRows();
            document.getElementById("myDiv2").innerHTML = ' Results: ' + num_rows;
            
            var output = "";

            for (var i = 0; i < num_rows; i++) {
                var myValue = data.getValue(i, 0);
                if (typeof myValue === 'number') {
                     myValue = '$' + myValue.toFixed(2);
                }
                
                var myTitle = data.getValue(i, 1);
                var myURL = data.getValue(i, 2);
                var myLink = "<a href='" + myURL + "' target='_blank'>" + myTitle + "</a>"
                var myUser = data.getValue(i, 3);
                var myTags = data.getValue(i, 5);
                
                if (myTags) {
                    myTags = tagURL(myTags);
                } else {
                    myTags = "";
                }

                output += myValue + ' - ' + myLink + ' by ' + myUser + ' ' + myTags + '<br>';
            }
            document.getElementById("myDiv3").innerHTML = output;
        }

        function updateURL() {
            var myterms = document.getElementById("txtFilter").value;
            var selectBox = document.getElementById("selectBox");
            var selectedValue = selectBox.options[selectBox.selectedIndex].value;
            var mparams = '';
            
            var paramsParts = [];

            if (myterms) {
                paramsParts.push('t=' + myterms.replace(/ /g,"_"));
            }
            if (selectedValue != 'All'){
                paramsParts.push('d=' + selectedValue);
            }
            
            if (paramsParts.length > 0){
                mparams = "?" + paramsParts.join('&');
            } else {
                mparams = window.location.pathname; // Clean URL
            }
            
            history.pushState(stateObj, "JungleGroves", mparams);
        }

        function tagURL(mytags) {
            var tarray = mytags.split(',');
            var result = [];

            for (var j = 0; j < tarray.length; j++) { 
                var myTitle = tarray[j].trim();
                var myURL = '?t=' + myTitle.replace(/ /g,"_");
                result.push("<a href='" + myURL + "'>#" + myTitle + "</a>");
            }

            return result.join(' ');
        }