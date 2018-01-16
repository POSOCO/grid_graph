window.onload = function () {
    var data = [];
    $('#example').DataTable({
        responsive: true,
        "data": data,
        "order": [[1, "asc"]],
        "lengthMenu": [[10, 25, 50, 100, 200, 500, 800, 1000, 1500, 1800, -1], [10, 25, 50, 100, 200, 500, 800, 1000, 1500, 1800, "All"]],
        "columns": [
			{"data": "voltage"},
            {"data": "ss1"},
            {"data": "ss2"},            
            {"data": "line_id"},
            {"data": "line_owners"},
            {"data": "conductor_type"},
            {"data": "ss1_owners"},
            {"data": "ss2_owners"},
            {"data": "km"},
            {"data": "sil"},
            {"data": "no_load_mvar"},
            {"data": "end1_lr_mvar"},
            {"data": "end1_lr_sw"},
            {"data": "end2_lr_mvar"},
            {"data": "end2_lr_sw"}
        ]
    });
    refreshTableData();
    getOwnersFromServer();
	getVoltagesFromServer();
	getRegionsFromServer();
    getConductorTypesFromServer();
	
};

function refineArgument(arg){
	var refinedArg = null;
	if(arg == undefined||arg == ''){
		
	} else{
		refinedArg = arg;
	}
	return refinedArg;
}
function refreshTableData() {
    var table = $('#example').dataTable();
    var payLoad = {
        limit_rows: document.getElementById("server_rows_limit_input").value = "" ? 100:document.getElementById("server_rows_limit_input").value,
        offset_page: document.getElementById("server_rows_page_input").value = "" ? 0:document.getElementById("server_rows_page_input").value
    };
	var refinedArg = refineArgument(document.getElementById("ss_name_search_str").value);
	if(refinedArg != null){
		payLoad.ss_name = refinedArg;
	}
	refinedArg = refineArgument(document.getElementById("owner_search_str").value);
	if(refinedArg != null){
		payLoad.owner = refinedArg;
	}
	refinedArg = refineArgument(document.getElementById("volt_level_search_str").value);
	if(refinedArg != null){
		payLoad.voltage = refinedArg;
	}
	refinedArg = refineArgument(document.getElementById("region_search_str").value);
	if(refinedArg != null){
		payLoad.region = refinedArg;
	}
	refinedArg = refineArgument(document.getElementById("cond_type_search_str").value);
	if(refinedArg != null){
		payLoad.conductor_type = refinedArg;
	}
		
    $.ajax({
        url: "/api/lines/",
        type: 'GET',
        data: payLoad,
        success: function (result) {
            //toastr["info"]("Data received from server");
            console.log(result);
            var dataArray = result.lines;
            if (typeof dataArray != 'undefined' && dataArray != null && dataArray.constructor === Array && dataArray.length > 0) {
                table.fnClearTable();
                table.fnAddData(dataArray);
            }
        },
        error: function (textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}

function getOwnersFromServer() {
    $.ajax({
        url: "/api/owners/",
        type: 'GET',
        success: function (result) {
            //toastr["info"]("Data received from server");
            console.log(result);
            var dataArray = result.owners;
            if (typeof dataArray != 'undefined' && dataArray != null && dataArray.constructor === Array && dataArray.length > 0) {
                document.getElementById('owner_search_str').innerHTML = "";
                appendOptionsToSelectBox("owner_search_str", "", "-- Owner --");
                for (var i = 0; i < dataArray.length; i++) {
                    appendOptionsToSelectBox("owner_search_str", dataArray[i].name, dataArray[i].name);
                }
                $('#owner_search_str').selectpicker('refresh');
            }
        },
        error: function (textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}

function getVoltagesFromServer() {
    $.ajax({
        url: "/api/voltages/",
        type: 'GET',
        success: function (result) {
            //toastr["info"]("Data received from server");
            console.log(result);
            var dataArray = result.voltages;
            if (typeof dataArray != 'undefined' && dataArray != null && dataArray.constructor === Array && dataArray.length > 0) {
                document.getElementById('volt_level_search_str').innerHTML = "";
                appendOptionsToSelectBox("volt_level_search_str", "", "-- Voltage --");
                for (var i = 0; i < dataArray.length; i++) {
                    appendOptionsToSelectBox("volt_level_search_str", dataArray[i].name, dataArray[i].name);
                }
                $('#volt_level_search_str').selectpicker('refresh');
            }
        },
        error: function (textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}

function getRegionsFromServer() {
    $.ajax({
        url: "/api/regions/",
        type: 'GET',
        success: function (result) {
            //toastr["info"]("Data received from server");
            console.log(result);
            var dataArray = result.regions;
            if (typeof dataArray != 'undefined' && dataArray != null && dataArray.constructor === Array && dataArray.length > 0) {
                document.getElementById('region_search_str').innerHTML = "";
                appendOptionsToSelectBox("region_search_str", "", "-- Region --");
                for (var i = 0; i < dataArray.length; i++) {
                    appendOptionsToSelectBox("region_search_str", dataArray[i].name, dataArray[i].name);
                }
                $('#region_search_str').selectpicker('refresh');
            }
        },
        error: function (textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}

function getConductorTypesFromServer() {
    $.ajax({
        url: "/api/lines/conductor_types",
        type: 'GET',
        success: function (result) {
            //toastr["info"]("Data received from server");
            console.log(result);
            var dataArray = result.conductor_types;
            if (typeof dataArray != 'undefined' && dataArray != null && dataArray.constructor === Array && dataArray.length > 0) {
                document.getElementById('cond_type_search_str').innerHTML = "";
                appendOptionsToSelectBox("cond_type_search_str", "", "-- Conductor Type --");
                for (var i = 0; i < dataArray.length; i++) {
                    if (dataArray[i].trim() != "") {
                        appendOptionsToSelectBox("cond_type_search_str", dataArray[i], dataArray[i]);
                    }
                }
                $('#cond_type_search_str').selectpicker('refresh');
            }
        },
        error: function (textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}

function appendOptionsToSelectBox(selectBoxId, optionValue, optionText) {
    var option = document.createElement("option");
    option.text = optionText;
    option.value = optionValue;
    var select = document.getElementById(selectBoxId);
    select.appendChild(option);
}