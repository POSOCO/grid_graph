window.onload = function () {
    var data = [];
    $('#example').DataTable({
        responsive: true,
        "data": data,
        "order": [[1, "asc"]],
        "lengthMenu": [[10, 25, 50, 100, 200, 500, 800, 1000, 1500, 1800, -1], [10, 25, 50, 100, 200, 500, 800, 1000, 1500, 1800, "All"]],
        "columns": [
            {"data": "id"},
            {"data": "name"},
            {"data": "description"},
            {"data": "conductor_type"},
            {"data": "level"},
            {"data": "el_owners_list"},
            {"data": "el_regions_list"},
            {"data": "el_states_list"},
            {"data": "ss_names_list"},
            {"data": "elem_num"},
            {"data": "ss_owners_list"},
            {"data": "ss_regions_list"},
            {"data": "ss_states_list"},
            {"data": "line_length"},
            {"data": "noloadmvar"}
        ]
    });
    /*
	refreshTableData();
    */
	getOwnersFromServer();
	getVoltagesFromServer();
	getRegionsFromServer();
    getConductorTypesFromServer();
	
};

function refreshTableData() {
    var table = $('#example').dataTable();
    var payLoad = {
        ss_name: document.getElementById("ss_name_search_str").value,
        owner: document.getElementById("owner_search_str").value,
        voltage: document.getElementById("volt_level_search_str").value,
        region: document.getElementById("region_search_str").value,
        conductor_type: document.getElementById("cond_type_search_str").value,
        limit_rows: document.getElementById("server_rows_limit_input").value,
        offset_page: document.getElementById("server_rows_page_input").value
    };

    $.ajax({
        url: "/api/lines/",
        type: 'GET',
        data: payLoad,
        success: function (result) {
            //toastr["info"]("Data received from server");
            console.log(result);
            var dataArray = result.data;
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
                appendOptionsToSelectBox("owner_search_str", "", "-- Please select --");
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
                appendOptionsToSelectBox("volt_level_search_str", "", "-- Please select --");
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
                appendOptionsToSelectBox("region_search_str", "", "-- Please select --");
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
                appendOptionsToSelectBox("cond_type_search_str", "", "-- Please select --");
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