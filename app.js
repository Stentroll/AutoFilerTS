var afParser = new AutofilerParser();
var bfParser = new BasefolderParser();
var ruleList = [];
var bfList = [];
var viewAfTable = true;
var showHideMultiline = true;
var txtFilterId;
var txtFilterName;
var cbHideDisabled;
var afTableDiv;
var bfTableDiv;
var btnSwitchTable;
var ruleTextArea;
var bfTextArea;
var btnClearFilters;
var btnCheckShowAll;
var btnCheckHideAll;
var btnCheckHideMulti;
var btnParseAF;
var btnParseBF;
var btnSaveAF;
var btnSaveBF;
var calcDiv;
var configSelector;
window.onload = function () {
    afTableDiv = document.getElementById("af-table-div");
    bfTableDiv = document.getElementById("bf-table-div");
    bfTextArea = document.getElementById("bftextarea");
    btnCheckHideAll = document.getElementById("btnCheckHideAll");
    btnCheckHideMulti = document.getElementById("btnCheckHideMulti");
    btnCheckShowAll = document.getElementById("btnCheckShowAll");
    btnClearFilters = document.getElementById('ButtonClearFilters');
    btnParseAF = document.getElementById('btnParseAF');
    btnParseBF = document.getElementById('btnParseBF');
    btnSaveAF = document.getElementById('btnSaveAF');
    btnSaveBF = document.getElementById('btnSaveBF');
    btnSwitchTable = document.getElementById('btnSwitchTable');
    calcDiv = document.getElementById('calcDiv');
    configSelector = document.getElementById('configSelector');
    cbHideDisabled = document.getElementById('cbHideDisabled');
    ruleTextArea = document.getElementById("ruletextarea");
    txtFilterId = document.getElementById('txtFilterId');
    txtFilterName = document.getElementById('txtFilterName');
    var reader = new JsonReader(ruleTextArea);
    CreateFilterChecks();
    btnClearFilters.onclick = function () { return ClearFilters(); };
    btnCheckShowAll.onclick = function () { return ShowHideAllColumns(true); };
    btnCheckHideAll.onclick = function () { return ShowHideAllColumns(false); };
    btnCheckHideMulti.onclick = function () { return ShowHideMultilineFields(); };
    btnParseAF.onclick = function () { return ParseAFConfig(); };
    btnParseBF.onclick = function () { return ParseBFConfig(); };
    btnSaveAF.onclick = function () { return SaveAFtoCSV(); };
    btnSaveBF.onclick = function () { return SaveBFtoCSV(); };
    btnSwitchTable.onclick = function () { return SwitchTable(); };
    calcDiv.appendChild(new DaySecCalculator().Build());
    configSelector.appendChild(reader.Build());
    txtFilterId.onkeyup = function () { BuildAFTable(); BuildBFTable(); };
    txtFilterName.onkeyup = function () { BuildAFTable(); BuildBFTable(); };
    cbHideDisabled.onchange = function () { BuildAFTable(); BuildBFTable(); };
};
function SaveAFtoCSV() {
    var csvContent = "data:text/csv;charset=utf-8,";
    var ruleProperties = Object.getOwnPropertyNames(new AutofilerRule(0));
    csvContent += ruleProperties.join(",") + "\n";
    for (var afref in ruleList) {
        var rule = ruleList[afref];
        csvContent += rule.ToCsvRow();
    }
    var encodedUri = encodeURI(csvContent);
    console.log(encodedUri);
    var link = document.createElement("a");
    link.href = encodedUri;
    link.setAttribute("download", "Autofilerdata.csv");
    document.body.appendChild(link);
    link.click();
}
function SaveBFtoCSV() {
    var csvContent = "data:text/csv;charset=utf-8,";
    var bfProperties = Object.getOwnPropertyNames(new Basefolder());
    csvContent += bfProperties.join(",") + "\n";
    for (var bfref in bfList) {
        var bf = bfList[bfref];
        csvContent += bf.ToCsvRow();
    }
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.href = encodedUri;
    link.setAttribute("download", "Basefolderdata.csv");
    document.body.appendChild(link);
    link.click();
}
function ShowHideAllColumns(show) {
    var checkboxElementArray = document.getElementsByClassName("fieldcheck");
    for (var n = 0; n < checkboxElementArray.length; n++) {
        var checkboxtmp = checkboxElementArray[n];
        checkboxtmp.checked = show;
    }
    BuildAFTable();
}
function ShowHideMultilineFields() {
    var checkboxElementArray = document.getElementsByClassName("fieldcheck");
    for (var n = 0; n < checkboxElementArray.length; n++) {
        var checkboxtmp = checkboxElementArray[n];
        if (checkboxtmp.name == "basefolders" || checkboxtmp.name == "basefolderLocations") {
            checkboxtmp.checked = !showHideMultiline;
        }
    }
    showHideMultiline = !showHideMultiline;
    BuildAFTable();
}
function ClearFilters() {
    txtFilterId.value = "";
    txtFilterName.value = "";
    cbHideDisabled.checked = false;
    BuildAFTable();
    BuildBFTable();
}
function ParseAFConfig() {
    var cfgText = ruleTextArea.value;
    ruleList = afParser.ParseAutofilerConfig(cfgText);
    console.log("Rules found: " + ruleList.length);
    LinkRulesToBasefolders();
    if (ruleList.length > 0) {
        BuildAFTable();
    }
    if (bfList.length > 0) {
        BuildBFTable();
    }
    document.getElementById('h2RuleCount').innerHTML = "Autofiler Rules: " + ruleList.length;
}
function ParseBFConfig() {
    var bfText = bfTextArea.value;
    bfList = bfParser.ParseBasefolderDump(bfText);
    console.log("Basefolders found:" + bfList.length);
    LinkRulesToBasefolders();
    if (bfList == [] || bfList.length > 0) {
        BuildBFTable();
    }
    if (ruleList == [] || ruleList.length > 0) {
        BuildAFTable();
    }
    document.getElementById('h2BfCount').innerHTML = "Basefolders: " + bfList.length;
}
function LinkRulesToBasefolders() {
    console.log("Linking stuff...");
    if (bfList.length == 0 || ruleList.length == 0) {
        console.log("Nothing to link.");
        return;
    }
    for (var bfref in bfList) {
        var bf = bfList[bfref];
        bf.autofilerrules = ruleList.filter(FilterAFonBfId, bf.id);
    }
    for (var afref in ruleList) {
        var rule = ruleList[afref];
        for (var bfidref in rule.basefolder_ids) {
            ruleList[afref].basefolders.push(bfList.filter(FilterBFonBFId, rule.basefolder_ids[bfidref])[0]);
        }
    }
}
function FilterAFonBfId(rule) {
    if (rule.basefolder_ids == null) {
        return false;
    }
    if (rule.basefolder_ids.indexOf(this.valueOf()) == -1) {
        return false;
    }
    return true;
}
function FilterBFonBFId(bf) {
    if (bf.id != this.valueOf()) {
        return false;
    }
    else {
        return true;
    }
}
function FilterAFonRuleName(rule) {
    var tmp = rule.name.toLowerCase();
    if (tmp.indexOf(this.toLowerCase()) === -1) {
        return false;
    }
    else {
        return true;
    }
}
function FilterRuleEnabled(rule) {
    return rule.enabled;
}
function CreateFilterChecks() {
    var fieldNames = Object.getOwnPropertyNames(new AutofilerRule(null));
    var newDiv;
    var newCheck;
    var tag;
    for (var fieldRef in fieldNames) {
        var fieldSelectorDiv = document.getElementById("fieldSelectors");
        newDiv = document.createElement("div");
        newCheck = document.createElement("input");
        tag = document.createElement("label");
        newDiv.classList.add("checkDiv");
        newCheck.className = "fieldcheck";
        newCheck.type = "checkbox";
        newCheck.checked = true;
        newCheck.id = fieldRef;
        newCheck.name = fieldNames[fieldRef];
        tag.classList.add("filterlabel");
        tag.innerHTML = fieldNames[fieldRef];
        newDiv.appendChild(newCheck);
        newDiv.appendChild(tag);
        document.getElementById("fieldSelectors").appendChild(newDiv);
        fieldSelectorDiv.appendChild(newDiv);
        newCheck.onchange = function (ev) { return BuildAFTable(); };
    }
}
function BuildAFTable() {
    console.log("Building AF table...");
    if (ruleList == null || ruleList.length == 0) {
        return;
    }
    var tmpList;
    tmpList = ruleList;
    var checksBoolArray = [];
    if (txtFilterId.value.length > 0) {
        console.log("Filtering on ID " + Number(txtFilterId.value));
        tmpList = tmpList.filter(FilterAFonBfId, Number(txtFilterId.value));
    }
    if (txtFilterName.value.length != 0) {
        tmpList = tmpList.filter(FilterAFonRuleName, txtFilterName.value);
    }
    if (cbHideDisabled.checked) {
        tmpList = tmpList.filter(FilterRuleEnabled, true);
    }
    var checkboxElementArray = document.getElementsByClassName("fieldcheck");
    for (var n = 0; n < checkboxElementArray.length; n++) {
        var checkboxtmp = checkboxElementArray[n];
        checksBoolArray.push(checkboxtmp.checked);
    }
    var tbl = document.getElementById("AFtable");
    var newTable = document.createElement("table");
    var thead = newTable.createTHead();
    var tbody = newTable.createTBody();
    var headrow = thead.insertRow();
    var properties = Object.getOwnPropertyNames(new AutofilerRule(null));
    var headerCell;
    newTable.id = "AFtable";
    newTable.className = 'sortable table-hover table-responsive';
    for (var propRef in properties) {
        if (checksBoolArray[propRef]) {
            var propertyName = properties[propRef];
            headerCell = document.createElement("th");
            headerCell.setAttribute("data-sortable", "true");
            headrow.appendChild(headerCell);
            headerCell.innerHTML = propertyName;
        }
    }
    for (var ruleRef in tmpList) {
        var rule = tmpList[ruleRef];
        var row = rule.CreateTableRow();
        row.setAttribute("data-index", ruleRef);
        for (var checkBool in checksBoolArray) {
            if (!checksBoolArray[checkBool]) {
                var cell = row.childNodes[checkBool];
                cell.hidden = true;
            }
        }
        tbody.appendChild(row);
    }
    tbl.parentNode.removeChild(tbl);
    afTableDiv.appendChild(newTable);
    sorttable.makeSortable(newTable);
}
function BuildBFTable() {
    console.log("Building BF table...");
    var tmpAFList = ruleList;
    var tmpBFList = bfList;
    var tbl = document.getElementById("BFtable");
    var newtable = document.createElement("table");
    var thead = newtable.createTHead();
    var tbody = newtable.createTBody();
    var headrow = thead.insertRow();
    var properties = Object.getOwnPropertyNames(new AutofilerRule(null));
    var hcell;
    var row;
    var cell;
    var bf;
    newtable.className = 'table-hover table-responsive';
    newtable.id = "BFtable";
    headrow.insertCell().innerHTML = "Basefolder ID";
    headrow.insertCell().innerHTML = "Basefolder Name";
    headrow.insertCell().innerHTML = "Location";
    headrow.insertCell().innerHTML = "Rules";
    if (txtFilterId.value.length != 0) {
        tmpBFList = bfList.filter(FilterBFonBFId, Number(txtFilterId.value));
    }
    for (var bfRef in tmpBFList) {
        bf = tmpBFList[bfRef];
        row = tbody.insertRow();
        row.insertCell(row.cells.length).innerHTML = String(bf.id.toString());
        row.insertCell(row.cells.length).innerHTML = bf.name;
        row.insertCell(row.cells.length).innerHTML = bf.location;
        var cell = row.insertCell(row.cells.length);
        for (var afref in bf.autofilerrules) {
            var tmpRule = bf.autofilerrules[afref];
            cell.innerHTML += tmpRule.name + "<br/>";
        }
        tbody.appendChild(row);
        bfTableDiv.removeChild(tbl);
        bfTableDiv.appendChild(newtable);
        tbl = newtable;
    }
}
function PopulateTextArea() {
    console.log("Filling textareas with demo data...");
    ruleTextArea.value = "\n#\n#	Creator: $Id: w_config_autof.C, v 1.40 2010/ 04 / 20 09:43:12 mi- sto Exp $\n    #	Created: 11 / 06 / 14 14:18:27\n    #\n    disk_check {\n        12_months {\n            interval < 3600 >\n                enable < false >\n                purge_timeout < 12960000 >\n                archival < none >\n                lower_limit < 90 >\n                upper_limit < 95 >\n                base_folder_ids < 93 >\n    }\n        16_months_ContC {\n            base_folder_ids < 113 >\n                interval < 216000 >\n                upper_limit < 90 >\n                lower_limit < 88 >\n                archival < none >\n                purge_timeout < 5184000 >\n                enable < true >\n    }\n        17_months_ContC {\n            base_folder_ids < 111 >\n                interval < 216000 >\n                upper_limit < 90 >\n                lower_limit < 88 >\n                archival < none >\n                purge_timeout < 2592000 >\n                enable < true >\n    }\n        15_months_ContC {\n            base_folder_ids < 112 >\n                interval < 216000 >\n                upper_limit < 90 >\n                lower_limit < 88 >\n                archival < none >\n                purge_timeout < 7776000 >\n                enable < true >\n    }\n        24_months_Cont {\n            base_folder_ids < 95 >\n                interval < 3600 >\n                upper_limit < 95 >\n                lower_limit < 90 >\n                archival < none >\n                purge_timeout < 172800 >\n                enable < false >\n    }\n        prefetch {\n            base_folder_ids < 102 >\n                time < 06:00 >\n                    upper_limit < 70 >\n                    lower_limit < 50 >\n                    archival < none >\n                    purge_timeout < 2678400 >\n                    enable < true >\n    }\n        6_months {\n            enable < true >\n                purge_timeout < 31104000 >\n                archival < none >\n                lower_limit < 70 >\n                upper_limit < 80 >\n                time < 00:50 >\n                    base_folder_ids < 92 >\n    }\n        Cont_12 {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 138 139 140 141 142 148>\n    }\n        Cont_11C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 111 112 113>\n    }\n        Cont_10C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 53 54 55 56 57 58 59 60 61 62>\n    }\n        Cont_9C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 63 64 65 66 67 68 69 70 71 72>\n    }\n        Cont_8C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 73 74 75 76 77 78 79 80 81 82>\n    }\n        Cont_7C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 83 84 85 86 87 88 89 90 110>\n    }\n        Cont_8 {\n            base_folder_ids < 108 >\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_7 {\n            base_folder_ids < 118 109 115 101 132 133 134 135 136 137>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_6 {\n            base_folder_ids < 2 92 93 94 95 102 104 105 106 107>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_5 {\n            base_folder_ids < 44 45 46 47 48 49 50 51 52 91>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_4 {\n            base_folder_ids < 34 35 36 37 38 39 40 41 42 43>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_3 {\n            base_folder_ids < 24 25 26 27 28 29 30 31 32 33>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_2 {\n            base_folder_ids < 14 15 16 17 18 19 20 21 22 23>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_1 {\n            base_folder_ids < 1 4 5 6 7 8 9 10 11 13>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_burnbank {\n            base_folder_ids < 101 >\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 13824000 >\n                enable < true >\n    }\n        Cont_default {\n            base_folder_ids < 1 >\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 7776000 >\n                enable < true >\n    }\n        Daily_1 {\n            base_folder_ids < 1 4 5 6 7 8 9 10 11 13>\n                time < 03:50 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_2 {\n            base_folder_ids < 14 15 16 17 18 19 20 21 22 23>\n                time < 04:05 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_3 {\n            base_folder_ids < 24 25 26 27 28 29 30 31 32 33>\n                time < 04:20 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_4 {\n            base_folder_ids < 34 35 36 37 38 39 40 41 42 43>\n                time < 04:35 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_5 {\n            base_folder_ids < 44 45 46 47 48 49 50 51 52 91>\n                time < 04:50 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_6 {\n            base_folder_ids < 2 92 93 94 95 102 104 105 106 107>\n                time < 05:05 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_8 {\n            base_folder_ids < 108 >\n                time < 05:25 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_7 {\n            base_folder_ids < 118 109 115 101 132 133 134 135 136 137>\n                time < 04:20 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_7C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 04:35 >\n                    base_folder_ids < 83 84 85 86 87 88 89 90 110 114>\n    }\n        Daily_8C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 04:20 >\n                    base_folder_ids < 73 74 75 76 77 78 79 80 81 82>\n    }\n        Daily_9C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 04:05 >\n                    base_folder_ids < 63 64 65 66 67 68 69 70 71 72>\n    }\n        Daily_10C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 03:50 >\n                    base_folder_ids < 53 54 55 56 57 58 59 60 61 62>\n    }\n        Daily_11C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 04:05 >\n                    base_folder_ids < 111 112 113>\n    }\n        Daily_12 {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 03:55 >\n                    base_folder_ids < 138 139 140 141 142 148>\n    }\n        17_months_cont {\n            enable < true >\n                purge_timeout < 5184000 >\n                archival < none >\n                lower_limit < 96 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 109 >\n    }\n        16_months_cont {\n            enable < true >\n                purge_timeout < 7776000 >\n                archival < none >\n                lower_limit < 96 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 108 >\n    }\n        15_months_cont {\n            enable < true >\n                purge_timeout < 6768000 >\n                archival < none >\n                lower_limit < 96 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 107 >\n    }\n        13_months_cont {\n            enable < true >\n                purge_timeout < 15552000 >\n                archival < none >\n                lower_limit < 96 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 105 >\n    }\n        18_months_Cont {\n            enable < true >\n                purge_timeout < 3600 >\n                archival < none >\n                lower_limit < 88 >\n                upper_limit < 90 >\n                interval < 3600 >\n                base_folder_ids < 94 >\n    }\n        14_months_cont {\n            enable < true >\n                purge_timeout < 6048000 >\n                archival < none >\n                lower_limit < 88 >\n                upper_limit < 90 >\n                interval < 3600 >\n                base_folder_ids < 106 >\n    }\n    }\n    auto_archive {\n        Reported_1 {\n            base_folder_ids < 1 4 5 6 7 8 9 10 11 13>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n\n        Reported_2 {\n            base_folder_ids < 14 15 16 17 18 19 20 21 22 23>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_3 {\n            base_folder_ids < 24 25 26 27 28 29 30 31 32 33>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_4 {\n            base_folder_ids < 34 35 36 37 38 39 40 41 42 43>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_5 {\n            base_folder_ids < 44 45 46 47 48 49 50 51 52 101>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_6 {\n            base_folder_ids < 2 92 93 94 95 102 104 105 106 107>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_7 {\n            base_folder_ids < 115 118 108 109 132 133 134 135 136 137>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_7C {\n            lonely_rff_purge_timeout < 2592000 >\n                purge_timeout < 47347200 >\n                enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge < yes >\n                arch_timeout < 7200 >\n                time < 02:05 >\n                    state_check {\n                minimum < 100 >\n                    enable < true >\n	}\n            base_folder_ids < 83 84 85 86 87 88 89 90 91 110>\n    }\n        Reported_8C {\n            lonely_rff_purge_timeout < 2592000 >\n                purge_timeout < 47347200 >\n                enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge < yes >\n                arch_timeout < 7200 >\n                time < 01:50 >\n                    state_check {\n                minimum < 100 >\n                    enable < true >\n	}\n            base_folder_ids < 73 74 75 76 77 78 79 80 81 82>\n    }\n        Reported_9C {\n            lonely_rff_purge_timeout < 2592000 >\n                purge_timeout < 47347200 >\n                enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge < yes >\n                arch_timeout < 7200 >\n                time < 01:35 >\n                    state_check {\n                minimum < 100 >\n                    enable < true >\n	}\n            base_folder_ids < 63 64 65 66 67 68 69 70 71 72>\n    }\n        Reported_10C {\n            lonely_rff_purge_timeout < 2592000 >\n                purge_timeout < 47347200 >\n                enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge < yes >\n                arch_timeout < 7200 >\n                time < 01:20 >\n                    state_check {\n                minimum < 100 >\n                    enable < true >\n	}\n            base_folder_ids < 53 54 55 56 57 58 59 60 61 62>\n    }\n        Reported_11C {\n            lonely_rff_purge_timeout < 2592000 >\n                purge_timeout < 47347200 >\n                enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge < yes >\n                arch_timeout < 7200 >\n                time < 01:35 >\n                    state_check {\n                minimum < 100 >\n                    enable < true >\n	}\n            base_folder_ids < 111 112 113 114>\n    }\n        Reported_12 {\n            base_folder_ids < 138 139 140 141 142 148>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:50 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Timeout_1 {\n            base_folder_ids < 1 4 5 6 7 8 9 10 11 13>\n                time < 02:35 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_2 {\n            base_folder_ids < 14 15 16 17 18 19 20 21 22 23>\n                time < 02:50 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_3 {\n            base_folder_ids < 24 25 26 27 28 29 30 31 32 33>\n                time < 03:05 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_4 {\n            base_folder_ids < 34 35 36 37 38 39 40 41 42 43>\n                time < 03:20 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_5 {\n            base_folder_ids < 44 45 46 47 48 49 50 51 52 101>\n                time < 03:35 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_6 {\n            base_folder_ids < 2 92 93 94 95 102 104 105 106 107>\n                time < 03:50 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_7 {\n            base_folder_ids < 115 118 108 109 132 133 134 135 136 137>\n                time < 03:05 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_7C {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 04:00 >\n                    base_folder_ids < 83 84 85 86 87 88 89 90 91 110>\n    }\n        Timeout_8C {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 04:20 >\n                    base_folder_ids < 73 74 75 76 77 78 79 80 81 82>\n    }\n        Timeout_9C {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 04:40 >\n                    base_folder_ids < 63 64 65 66 67 68 69 70 71 72>\n    }\n        Timeout_10C {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 05:00 >\n                    base_folder_ids < 53 54 55 56 57 58 59 60 61 62>\n    }\n        Timeout_11C {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 05:15 >\n                    base_folder_ids < 111 112 113 114>\n    }\n        Timeout_12 {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 04:10 >\n                    base_folder_ids < 138 139 140 141 142 148>\n    }\n        transition_archive {\n            base_folder_ids < 2 >\n                interval < 900 >\n                arch_timeout < 60 >\n                purge < no >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 1209600 >\n                enable < false >\n    }\n    }\n    verbose < 1 >";
    bfTextArea.value = "base_folder:\n	id: 1\n	name: System default\n	type_id: 0\n	location: file://FLUPIS01/folders$/default\n	id_string: default\nbase_folder:\n	id: 2\n	name: transition\n	location: file://FLUPIS01/folders$/transition\n	id_string: transition\nbase_folder:\n	id: 3\n	name: Archive\n	type_id: 1\n	location: mojb://NONE\n	id_string: archive\nbase_folder:\n	id: 4\n	name: flu_ct1\n	location: file://FLUPIS01/folders$/flu_ct1\n	id_string: flu_ct1\nbase_folder:\n	id: 5\n	name: flu_ct2\n	location: file://FLUPIS01/folders$/flu_ct2\n	id_string: flu_ct2\nbase_folder:\n	id: 6\n	name: flu_ctws1\n	location: file://FLUPIS01/folders$/flu_ctws1\n	id_string: flu_ctws1\nbase_folder:\n	id: 7\n	name: flu_ct3\n	location: file://FLUPIS01/folders$/flu_ct3\n	id_string: flu_ct3\nbase_folder:\n	id: 8\n	name: flu_ct4\n	location: file://FLUPIS01/folders$/flu_ct4\n	id_string: flu_ct4\nbase_folder:\n	id: 9\n	name: flu_ot1\n	location: file://FLUPIS01/folders$/flu_ot1\n	id_string: flu_ot1\nbase_folder:\n	id: 10\n	name: flu_mr1\n	location: file://FLUPIS01/folders$/flu_mr1\n	id_string: flu_mr1\nbase_folder:\n	id: 11\n	name: flu_mr2\n	location: file://FLUPIS01/folders$/flu_mr2\n	id_string: flu_mr2\nbase_folder:\n	id: 13\n	name: flu_mr3\n	location: file://FLUPIS01/folders$/flu_mr3\n	id_string: flu_mr3\nbase_folder:\n	id: 14\n	name: flu_mrsw1\n	location: file://FLUPIS01/folders$/flu_mrws1\n	id_string: flu_mrws1\nbase_folder:\n	id: 15\n	name: flu_mrsw2\n	location: file://FLUPIS01/folders$/flu_mrws2\n	id_string: flu_mrws2\nbase_folder:\n	id: 16\n	name: flu_mrsw3\n	location: file://FLUPIS01/folders$/flu_mrws3\n	id_string: flu_mrws3\nbase_folder:\n	id: 17\n	name: flu_mrsw4\n	location: file://FLUPIS01/folders$/flu_mrws4\n	id_string: flu_mrws4\nbase_folder:\n	id: 18\n	name: flu_mrsw5\n	location: file://FLUPIS01/folders$/flu_mrws5\n	id_string: flu_mrws5\nbase_folder:\n	id: 19\n	name: flu_mg1\n	location: file://FLUPIS01/folders$/flu_mg1\n	id_string: flu_mg1\nbase_folder:\n	id: 20\n	name: flu_mg2\n	location: file://FLUPIS01/folders$/flu_mg2\n	id_string: flu_mg2\nbase_folder:\n	id: 21\n	name: flu_mg3\n	location: file://FLUPIS01/folders$/flu_mg3\n	id_string: flu_mg3\nbase_folder:\n	id: 22\n	name: flu_mgws1\n	location: file://FLUPIS01/folders$/flu_mgws1\n	id_string: flu_mgws1\nbase_folder:\n	id: 23\n	name: flu_mgws2\n	location: file://FLUPIS01/folders$/flu_mgws2\n	id_string: flu_mgws2\nbase_folder:\n	id: 24\n	name: flu_mg4\n	location: file://FLUPIS01/folders$/flu_mg4\n	id_string: flu_mg4\nbase_folder:\n	id: 25\n	name: flu_mgws3\n	location: file://FLUPIS01/folders$/flu_mgws3\n	id_string: flu_mgws3\nbase_folder:\n	id: 26\n	name: flu_us1\n	location: file://FLUPIS01/folders$/flu_us1\n	id_string: flu_us1\nbase_folder:\n	id: 27\n	name: flu_us2\n	location: file://FLUPIS01/folders$/flu_us2\n	id_string: flu_us2\nbase_folder:\n	id: 28\n	name: flu_us3\n	location: file://FLUPIS01/folders$/flu_us3\n	id_string: flu_us3\nbase_folder:\n	id: 29\n	name: flu_us4\n	location: file://FLUPIS01/folders$/flu_us4\n	id_string: flu_us4\nbase_folder:\n	id: 30\n	name: flu_rf1\n	location: file://FLUPIS01/folders$/flu_rf1\n	id_string: flu_rf1\nbase_folder:\n	id: 31\n	name: flu_dr1\n	location: file://FLUPIS01/folders$/flu_dr1\n	id_string: flu_dr1\nbase_folder:\n	id: 32\n	name: flu_cr1\n	location: file://FLUPIS01/folders$/flu_cr1\n	id_string: flu_cr1\nbase_folder:\n	id: 33\n	name: flu_cr2\n	location: file://FLUPIS01/folders$/flu_cr2\n	id_string: flu_cr2\nbase_folder:\n	id: 34\n	name: flu_cr3\n	location: file://FLUPIS01/folders$/flu_cr3\n	id_string: flu_cr3\nbase_folder:\n	id: 35\n	name: flu_cr4\n	location: file://FLUPIS01/folders$/flu_cr4\n	id_string: flu_cr4\nbase_folder:\n	id: 36\n	name: flu_nm1\n	location: file://FLUPIS01/folders$/flu_nm1\n	id_string: flu_nm1\nbase_folder:\n	id: 37\n	name: flu_nm2\n	location: file://FLUPIS01/folders$/flu_nm2\n	id_string: flu_nm2\nbase_folder:\n	id: 38\n	name: flu_nm3\n	location: file://FLUPIS01/folders$/flu_nm3\n	id_string: flu_nm3\nbase_folder:\n	id: 39\n	name: flu_nm4\n	location: file://FLUPIS01/folders$/flu_nm4\n	id_string: flu_nm4\nbase_folder:\n	id: 40\n	name: flu_nmws1\n	location: file://FLUPIS01/folders$/flu_nmws1\n	id_string: flu_nmws1\nbase_folder:\n	id: 41\n	name: flu_nmws2\n	location: file://FLUPIS01/folders$/flu_nmws2\n	id_string: flu_nmws2\nbase_folder:\n	id: 42\n	name: flu_nmws3\n	location: file://FLUPIS01/folders$/flu_nmws3\n	id_string: flu_nmws3\nbase_folder:\n	id: 43\n	name: flu_nmws4\n	location: file://FLUPIS01/folders$/flu_nmws4\n	id_string: flu_nmws4\nbase_folder:\n	id: 44\n	name: flu_pet1\n	location: file://FLUPIS01/folders$/flu_pet1\n	id_string: flu_pet1\nbase_folder:\n	id: 45\n	name: flu_pet2\n	location: file://FLUPIS01/folders$/flu_pet2\n	id_string: flu_pet2\nbase_folder:\n	id: 46\n	name: flu_nm5\n	location: file://FLUPIS01/folders$/flu_nm5\n	id_string: flu_nm5\nbase_folder:\n	id: 47\n	name: flu_nm6\n	location: file://FLUPIS01/folders$/flu_nm6\n	id_string: flu_nm6\nbase_folder:\n	id: 48\n	name: flu_nm7\n	location: file://FLUPIS01/folders$/flu_nm7\n	id_string: flu_nm7\nbase_folder:\n	id: 49\n	name: flu_ctws2\n	location: file://FLUPIS01/folders$/flu_ctws2\n	id_string: flu_ctws2\nbase_folder:\n	id: 50\n	name: flu_ot2\n	location: file://FLUPIS01/folders$/flu_ot2\n	id_string: flu_ot2\nbase_folder:\n	id: 51\n	name: flu_ot3\n	location: file://FLUPIS01/folders$/flu_ot3\n	id_string: flu_ot3\nbase_folder:\n	id: 52\n	name: flu_ot4\n	location: file://FLUPIS01/folders$/flu_ot4\n	id_string: flu_ot4\nbase_folder:\n	id: 53\n	name: blo_ct1\n	location: file://BLOPIS01/folders$/blo_ct1\n	id_string: blo_ct1\nbase_folder:\n	id: 54\n	name: blo_ct2\n	location: file://BLOPIS01/folders$/blo_ct2\n	id_string: blo_ct2\nbase_folder:\n	id: 55\n	name: blo_ct3\n	location: file://BLOPIS01/folders$/blo_ct3\n	id_string: blo_ct3\nbase_folder:\n	id: 56\n	name: blo_mr1\n	location: file://BLOPIS01/folders$/blo_mr1\n	id_string: blo_mr1\nbase_folder:\n	id: 57\n	name: blo_mrws1\n	location: file://BLOPIS01/folders$/blo_mrws1\n	id_string: blo_mrws1\nbase_folder:\n	id: 58\n	name: blo_mr2\n	location: file://BLOPIS01/folders$/blo_mr2\n	id_string: blo_mr2\nbase_folder:\n	id: 59\n	name: blo_mrws2\n	location: file://BLOPIS01/folders$/blo_mrws2\n	id_string: blo_mrws2\nbase_folder:\n	id: 60\n	name: blo_mg1\n	location: file://BLOPIS01/folders$/blo_mg1\n	id_string: blo_mg1\nbase_folder:\n	id: 61\n	name: blo_mg2\n	location: file://BLOPIS01/folders$/blo_mg2\n	id_string: blo_mg2\nbase_folder:\n	id: 62\n	name: blo_mg3\n	location: file://BLOPIS01/folders$/blo_mg3\n	id_string: blo_mg3\nbase_folder:\n	id: 63\n	name: blo_mg4\n	location: file://BLOPIS01/folders$/blo_mg4\n	id_string: blo_mg4\nbase_folder:\n	id: 64\n	name: blo_us1\n	location: file://BLOPIS01/folders$/blo_us1\n	id_string: blo_us1\nbase_folder:\n	id: 65\n	name: blo_us2\n	location: file://BLOPIS01/folders$/blo_us2\n	id_string: blo_us2\nbase_folder:\n	id: 66\n	name: blo_us3\n	location: file://BLOPIS01/folders$/blo_us3\n	id_string: blo_us3\nbase_folder:\n	id: 67\n	name: blo_us4\n	location: file://BLOPIS01/folders$/blo_us4\n	id_string: blo_us4\nbase_folder:\n	id: 68\n	name: blo_us5\n	location: file://BLOPIS01/folders$/blo_us5\n	id_string: blo_us5\nbase_folder:\n	id: 69\n	name: blo_us6\n	location: file://BLOPIS01/folders$/blo_us6\n	id_string: blo_us6\nbase_folder:\n	id: 70\n	name: blo_xa1\n	location: file://BLOPIS01/folders$/blo_xa1\n	id_string: blo_xa1\nbase_folder:\n	id: 71\n	name: blo_xa2\n	location: file://BLOPIS01/folders$/blo_xa2\n	id_string: blo_xa2\nbase_folder:\n	id: 72\n	name: blo_cr1\n	location: file://BLOPIS01/folders$/blo_cr1\n	id_string: blo_cr1\nbase_folder:\n	id: 73\n	name: blo_cr2\n	location: file://BLOPIS01/folders$/blo_cr2\n	id_string: blo_cr2\nbase_folder:\n	id: 74\n	name: blo_cr3\n	location: file://BLOPIS01/folders$/blo_cr3\n	id_string: blo_cr3\nbase_folder:\n	id: 75\n	name: blo_cr4\n	location: file://BLOPIS01/folders$/blo_cr4\n	id_string: blo_cr4\nbase_folder:\n	id: 76\n	name: blo_dr1\n	location: file://BLOPIS01/folders$/blo_dr1\n	id_string: blo_dr1\nbase_folder:\n	id: 77\n	name: blo_drrf1\n	location: file://BLOPIS01/folders$/blo_drrf1\n	id_string: blo_drrf1\nbase_folder:\n	id: 78\n	name: blo_iopx1\n	location: file://BLOPIS01/folders$/blo_iopx1\n	id_string: blo_iopx1\nbase_folder:\n	id: 79\n	name: blo_ctws1\n	location: file://BLOPIS01/folders$/blo_ctws1\n	id_string: blo_ctws1\nbase_folder:\n	id: 80\n	name: blo_ctws2\n	location: file://BLOPIS01/folders$/blo_ctws2\n	id_string: blo_ctws2\nbase_folder:\n	id: 81\n	name: blo_ot1\n	location: file://BLOPIS01/folders$/blo_ot1\n	id_string: blo_ot1\nbase_folder:\n	id: 82\n	name: blo_ot2\n	location: file://BLOPIS01/folders$/blo_ot2\n	id_string: blo_ot2\nbase_folder:\n	id: 83\n	name: blo_mgws1\n	location: file://BLOPIS01/folders$/blo_mgws1\n	id_string: blo_mgws1\nbase_folder:\n	id: 84\n	name: blo_mgws2\n	location: file://BLOPIS01/folders$/blo_mgws2\n	id_string: blo_mgws2\nbase_folder:\n	id: 85\n	name: blo_mgws3\n	location: file://BLOPIS01/folders$/blo_mgws3\n	id_string: blo_mgws3\nbase_folder:\n	id: 86\n	name: blo_pet1\n	location: file://BLOPIS01/folders$/blo_pet1\n	id_string: blo_pet1\nbase_folder:\n	id: 87\n	name: blo_ct4\n	location: file://BLOPIS01/folders$/blo_ct4\n	id_string: blo_ct4\nbase_folder:\n	id: 88\n	name: blo_nmws1\n	location: file://BLOPIS01/folders$/blo_nmws1\n	id_string: blo_nmws1\nbase_folder:\n	id: 89\n	name: blo_nm1\n	location: file://BLOPIS01/folders$/blo_nm1\n	id_string: blo_nm1\nbase_folder:\n	id: 90\n	name: blo_nmws2\n	location: file://BLOPIS01/folders$/blo_nmws2\n	id_string: blo_nmws2\nbase_folder:\n	id: 91\n	name: rmaqr\n	location: file://FLUPIS01/folders$/rmaqr\n	id_string: rmaqr\nbase_folder:\n	id: 92\n	name: 6months\n	location: file://FLUPIS01/folders$/6months\n	id_string: 6months\nbase_folder:\n	id: 93\n	name: 12months\n	location: file://FLUPIS01/folders$/12months\n	id_string: 12months\nbase_folder:\n	id: 94\n	name: 18months\n	location: file://FLUPIS01/folders$/18months\n	id_string: 18months\nbase_folder:\n	id: 95\n	name: 24months\n	location: file://FLUPIS01/folders$/24months\n	id_string: 24months\nbase_folder:\n	id: 96\n	name: IR On Call PACSMail\n	type_id: 2\n	location: send://10.163.252.112\n	id_string: PACSMail\nbase_folder:\n	id: 99\n	name: Radiotherapy Planning Fluton\n	type_id: 2\n	location: send://192.168.250.200\n	id_string: Radiotherapy_Planning\nbase_folder:\n	id: 101\n	name: flu_bur\n	location: file://FLUPIS01/folders$/flu_bur\n	id_string: flu_bur\nbase_folder:\n	id: 102\n	name: prefetch\n	location: file://FLUPIS01/folders$/prefetch\n	id_string: prefetch\nbase_folder:\n	id: 104\n	name: net_ret\n	location: file://FLUPIS01/folders$/net_ret\n	id_string: net_ret\nbase_folder:\n	id: 105\n	name: 13months\n	location: file://FLUPIS01/folders$/13months\n	id_string: 13months\nbase_folder:\n	id: 106\n	name: 14months\n	location: file://FLUPIS01/folders$/14months\n	id_string: 14months\nbase_folder:\n	id: 107\n	name: 15months\n	location: file://FLUPIS01/folders$/15months\n	id_string: 15months\nbase_folder:\n	id: 108\n	name: 16months\n	location: file://FLUPIS01/folders$/16months\n	id_string: 16months\nbase_folder:\n	id: 109\n	name: 17months\n	location: file://FLUPIS01/folders$/17months\n	id_string: 17months\nbase_folder:\n	id: 110\n	name: blo_ct5\n	location: file://BLOPIS01/folders$/blo_ct5\n	id_string: blo_ct5\nbase_folder:\n	id: 111\n	name: 17months_2\n	location: file://BLOPIS01/folders$/17months_2\n	id_string: 17months_2\nbase_folder:\n	id: 112\n	name: 15months_2\n	location: file://BLOPIS01/folders$/15months_2\n	id_string: 15months_2\nbase_folder:\n	id: 113\n	name: 16months_2\n	location: file://BLOPIS01/folders$/16months_2\n	id_string: 16months_2\nbase_folder:\n	id: 114\n	name: blo_rf\n	location: file://BLOPIS01/folders$/blo_rf\n	id_string: blo_rf\nbase_folder:\n	id: 115\n	name: flu_bbrad\n	location: file://FLUPIS01/folders$/flu_bbrad\n	id_string: flu_bbrad\nbase_folder:\n	id: 116\n	name: blo_us7\n	location: file://BLOPIS01/folders$/blo_us7\n	id_string: blo_us7\nbase_folder:\n	id: 117\n	name: RPYS RPACS01\n	type_id: 2\n	location: send://192.168.254.20\n	id_string: rpys_0\nbase_folder:\n	id: 118\n	name: flu_dr2\n	location: file://FLUPIS01/folders$/flu_dr2\n	id_string: flu_dr2\nbase_folder:\n	id: 119\n	name: blo_dr2\n	location: file://BLOPIS01/folders$/blo_dr2\n	id_string: blo_dr2\nbase_folder:\n	id: 120\n	name: blo_dr3\n	location: file://BLOPIS01/folders$/blo_dr3\n	id_string: blo_dr3\nbase_folder:\n	id: 121\n	name: blo_us8\n	location: file://BLOPIS01/folders$/blo_us8\n	id_string: blo_us8\nbase_folder:\n	id: 122\n	name: 18months_2\n	location: file://BLOPIS01/folders$/18months_2\n	id_string: 18months_2\nbase_folder:\n	id: 123\n	name: 14months_2\n	location: file://BLOPIS01/folders$/14months_2\n	id_string: 14months_2\nbase_folder:\n	id: 124\n	name: 13months_2\n	location: file://BLOPIS01/folders$/13months_2\n	id_string: 13months_2\nbase_folder:\n	id: 125\n	name: 12months_2\n	location: file://BLOPIS01/folders$/12months_2\n	id_string: 12months_2\nbase_folder:\n	id: 126\n	name: 11months_2\n	location: file://BLOPIS01/folders$/11months_2\n	id_string: 11months_2\nbase_folder:\n	id: 127\n	name: 10months_2\n	location: file://BLOPIS01/folders$/10months_2\n	id_string: 10months_2\nbase_folder:\n	id: 128\n	name: 9months_2\n	location: file://BLOPIS01/folders$/9months_2\n	id_string: 9months_2\nbase_folder:\n	id: 129\n	name: 8months_2\n	location: file://BLOPIS01/folders$/8months_2\n	id_string: 8months_2\nbase_folder:\n	id: 130\n	name: 7months_2\n	location: file://BLOPIS01/folders$/7months_2\n	id_string: 7months_2\nbase_folder:\n	id: 131\n	name: 6months_2\n	location: file://BLOPIS01/folders$/6months_2\n	id_string: 6months_2\nbase_folder:\n	id: 132\n	name: flu_nm8\n	location: file://FLUPIS01/folders$/flu_nm8\n	id_string: flu_nm8\nbase_folder:\n	id: 133\n	name: flu_nmws5\n	location: file://FLUPIS01/folders$/flu_nmws5\n	id_string: flu_nmws5\nbase_folder:\n	id: 134\n	name: flu_nmws6\n	location: file://FLUPIS01/folders$/flu_nmws6\n	id_string: flu_nmws6\nbase_folder:\n	id: 135\n	name: flu_us5\n	location: file://FLUPIS01/folders$/flu_us5\n	id_string: flu_us5\nbase_folder:\n	id: 136\n	name: flu_nm9\n	location: file://FLUPIS01/folders$/flu_nm9\n	id_string: flu_nm9\nbase_folder:\n	id: 137\n	name: flu_nm10\n	location: file://FLUPIS01/folders$/flu_nm10\n	id_string: flu_nm10\nbase_folder:\n	id: 138\n	name: flu_7930\n	location: file://FLUPIS01/folders$/flu_7930\n	id_string: flu_7930\nbase_folder:\n	id: 139\n	name: flu_7931\n	location: file://FLUPIS01/folders$/flu_7931\n	id_string: flu_7931\nbase_folder:\n	id: 140\n	name: flu_7932\n	location: file://FLUPIS01/folders$/flu_7932\n	id_string: flu_7932\nbase_folder:\n	id: 141\n	name: flu_7933\n	location: file://FLUPIS01/folders$/flu_7933\n	id_string: flu_7933\nbase_folder:\n	id: 142\n	name: flu_7934\n	location: file://FLUPIS01/folders$/flu_7934\n	id_string: flu_7934\nbase_folder:\n	id: 143\n	name: blo_7935\n	location: file://BLOPIS01/folders$/blo_7935\n	id_string: blo_7935\nbase_folder:\n	id: 144\n	name: blo_7936\n	location: file://BLOPIS01/folders$/blo_7936\n	id_string: blo_7936\nbase_folder:\n	id: 145\n	name: blo_7937\n	location: file://BLOPIS01/folders$/blo_7937\n	id_string: blo_7937\nbase_folder:\n	id: 146\n	name: blo_7938\n	location: file://BLOPIS01/folders$/blo_7938\n	id_string: blo_7938\nbase_folder:\n	id: 147\n	name: blo_7939\n	location: file://BLOPIS01/folders$/blo_7939\n	id_string: blo_7939\nbase_folder:\n	id: 148\n	name: flu_ot5\n	location: file://FLUPIS01/folders$/flu_ot5\n	id_string: flu_ot5\nbase_folder:\n	id: 149\n	name: Radiotherapy Planning Blolsea\n	type_id: 2\n	location: send://192.168.248.2\n	id_string: Radiotherapy__Planning_Blolsea\nbase_folder:\n	id: 150\n	name: blo_bur\n	location: file://BLOPIS01/folders$/blo_bur\n	id_string: blo_bur\nbase_folder:\n	id: 151\n	name: blo_default\n	location: file://BLOPIS01/folders$/blo_default\n	id_string: blo_default\nbase_folder:\n	id: 152\n	name: blo_mg5\n	location: file://BLOPIS01/folders$/blo_mg5\n	id_string: blo_mg5\nbase_folder:\n	id: 153\n	name: Urostation\n	type_id: 2\n	location: send://192.168.142.194\n	id_string: trdest_KOELIS\nbase_folder:\n	id: 154\n	name: flu_mg5\n	location: file://FLUPIS01/folders$/flu_mg5\n	id_string: flu_mg5\nbase_folder:\n	id: 155\n	name: NICAM\n	location: file://BLOPIS01/folders$/NICAM\n	id_string: NICAM\nbase_folder:\n	id: 156\n	name: flu_us6\n	location: file://FLUPIS01/folders$/flu_us6\n	id_string: flu_us6\n";
}
function SwitchTable() {
    afTableDiv.hidden = viewAfTable;
    bfTableDiv.hidden = !viewAfTable;
    btnSwitchTable.textContent = (viewAfTable ? "Go to autofiler view" : "Go to basefolder view");
    viewAfTable = !viewAfTable;
}
