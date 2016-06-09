/// <reference path="tsclasses/basefolder.ts" />
/// <reference path="TSclasses/autofilerrule.ts" />
/// <reference path="TSclasses/AutofilerParser.ts" />
///<reference path='jquery.d.ts'/>


var afParser = new AutofilerParser();
var bfParser = new BasefolderParser();

var ruleList : AutofilerRule[] = [];
var bfList: Basefolder[] = [];

var AFview: boolean = true;
 
var txtFilterId: HTMLInputElement;
var txtFilterName: HTMLInputElement;
var cbHideDisabled: HTMLInputElement;

declare var sorttable: any;


window.onload = () => {    
   //Assign elements
    txtFilterId = <HTMLInputElement> document.getElementById('txtFilterId');
    txtFilterName = <HTMLInputElement> document.getElementById('txtFilterName');
    cbHideDisabled = <HTMLInputElement> document.getElementById('cbHideDisabled');
    var btnClearFilters: HTMLButtonElement = <HTMLButtonElement>document.getElementById('ButtonClearFilters');
    var btnCheckShowAll: HTMLInputElement = <HTMLInputElement>document.getElementById("btnCheckShowAll");
    var btnCheckHideAll: HTMLInputElement = <HTMLInputElement>document.getElementById("btnCheckHideAll");
    var btnParseAF: HTMLButtonElement = <HTMLButtonElement>document.getElementById('btnParseAF');
    var btnParseBF: HTMLButtonElement = <HTMLButtonElement>document.getElementById('btnParseBF');
    var btnSwitchTable: HTMLButtonElement = <HTMLButtonElement>document.getElementById('btnSwitchTable');

    //Procedurally create the show/hide column checkboxes
    CreateFilterChecks();

    //Function to fill the input to make debugging faster
    PopulateTextArea();

    //Assign functions to onclick events
    btnClearFilters.onclick = () => ClearFilters();
    btnCheckShowAll.onclick = () => ShowHideAllColumns(true);
    btnCheckHideAll.onclick = () => ShowHideAllColumns(false);
    btnParseAF.onclick = () => ParseAFConfig();
    btnParseBF.onclick = () => ParseBFConfig();
    btnSwitchTable.onclick = () => SwitchTable();

    txtFilterId.onkeyup = () => { BuildAFTable(); BuildBFTable(); };
    txtFilterName.onkeyup = () => { BuildAFTable(); BuildBFTable();  };
    cbHideDisabled.onchange = () => { BuildAFTable(); BuildBFTable(); };
};

function ShowHideAllColumns(show: boolean): void {
    var checkboxElementArray = document.getElementsByClassName("fieldcheck");
    
    for (var n = 0; n < checkboxElementArray.length; n++) {
        var checkboxtmp: HTMLInputElement = <HTMLInputElement>checkboxElementArray[n];
        checkboxtmp.checked = show;
    }
    BuildAFTable();
}

function ClearFilters(): void {
    txtFilterId.value = "";
    txtFilterName.value = "";
    cbHideDisabled.checked = false;
    BuildAFTable();
    BuildBFTable();
}

function ParseAFConfig() {
    var textBox: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("ruletextarea");
    var cfgText = textBox.value;
    ruleList = afParser.ParseAutofilerConfig(cfgText);
    console.log("Rules found:" + ruleList.length);
    BuildAFTable();
    BuildBFTable();
    document.getElementById('h2RuleCount').innerHTML = "Autofiler Rules: " + ruleList.length;

}

function ParseBFConfig() {
    var textBox: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("bftextarea");
    var bfText: string = textBox.value;
    bfList = bfParser.ParseBasefolderDump(bfText);
    console.log("Basefolders found:" + bfList.length);
    BuildBFTable();
    document.getElementById('h2BfCount').innerHTML = "Basefolders: " + bfList.length;
}

function FilterAFonBfId(rule) {
    var tmp: number[] = rule.basefolders;
    if (tmp.indexOf(this.valueOf()) === -1) {
        return false;
    }
    else {
        return true;
    }
}

function FilterBFonBFId(bf) {
    var tmp: number = bf.id;
    if (tmp != this.valueOf()) {
        return false;
    }
    else {
        return true;
    }
}

function FilterAFonRuleName(rule) {
    var tmp: string = rule.name;
    tmp = tmp.toLowerCase();
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

    for (var fieldRef in fieldNames) {
        var newDiv: HTMLDivElement = document.createElement("div");
        newDiv.classList.add("checkDiv");

        var newCheck: HTMLInputElement = document.createElement("input");
        newCheck.className = "fieldcheck";
        newCheck.type = "checkbox";
        newCheck.checked = true;
        newCheck.id = fieldRef;

        var tag: HTMLElement = document.createElement("label");
        tag.classList.add("filterlabel");
        tag.innerHTML = fieldNames[fieldRef];

        newDiv.appendChild(newCheck);
        newDiv.appendChild(tag);

        document.getElementById("fieldSelectors").appendChild(newDiv);

        newCheck.onchange = (ev: Event) => BuildAFTable();
    } 

    var fieldchecks: NodeList = document.getElementsByClassName("fieldcheck");
}

function BuildAFTable(): void {

    if (ruleList.length == 0) {
        return;
    }

    var tmpList: AutofilerRule[];
    tmpList = ruleList;
    var checksBoolArray: boolean[] = [];

    //Handle filtering functions
    if (txtFilterId.value.length != 0) {
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
        var checkboxtmp: HTMLInputElement = <HTMLInputElement>checkboxElementArray[n];
        checksBoolArray.push(checkboxtmp.checked);
    }

    var tbl: HTMLTableElement = <HTMLTableElement>document.getElementById("AFtable");
    var newTable: HTMLTableElement = document.createElement("table");
    var thead = <HTMLTableSectionElement>newTable.createTHead();
    var tbody = <HTMLTableSectionElement>newTable.createTBody();
    var headrow: HTMLTableRowElement = <HTMLTableRowElement>thead.insertRow();
    var properties = Object.getOwnPropertyNames(new AutofilerRule(null));
    var headerCell: HTMLTableHeaderCellElement;


    newTable.id = "AFtable";
    newTable.className = 'sortable table-hover table-responsive';
    
    //Build the table header
    for (var propRef in properties) {
        if (checksBoolArray[propRef]) {
            var propertyName = properties[propRef];

            headerCell = <HTMLTableHeaderCellElement>document.createElement("th");
            headerCell.setAttribute("data-sortable", "true");
            headrow.appendChild(headerCell);
            headerCell.innerHTML = propertyName;
        }
    }

    //Build the table body
    for (var ruleRef in tmpList) {
        var rule: AutofilerRule = tmpList[ruleRef];
        var row: HTMLTableRowElement = rule.CreateTableRow();
        row.setAttribute("data-index", ruleRef);

        for (var checkBool in checksBoolArray) {
            if (!checksBoolArray[checkBool]) {
                var cell: HTMLTableCellElement = <HTMLTableCellElement>row.childNodes[checkBool];
                cell.hidden = true;
            }
        }
        tbody.appendChild(row);
    }
    tbl.remove();
    document.getElementById("af-table-div").appendChild(newTable);
    //var hej = document.getElementById("AFtable");

    sorttable.makeSortable(newTable);
}

function BuildBFTable(): void {

    //if (bfList.length == 0) {
    //    return;
    //}

    var tmpAFList: AutofilerRule[];
    tmpAFList = ruleList;

    var tmpBFList: Basefolder[];
    tmpBFList = bfList;

    var tbl: HTMLTableElement = <HTMLTableElement>document.getElementById("BFtable");
    var newtable: HTMLTableElement = document.createElement("table");
    var thead = <HTMLTableSectionElement>newtable.createTHead();
    var tbody = <HTMLTableSectionElement>newtable.createTBody();
    var headrow: HTMLTableRowElement = <HTMLTableRowElement>thead.insertRow();
    var properties = Object.getOwnPropertyNames(new AutofilerRule(null));
    var hcell: HTMLTableHeaderCellElement;

    newtable.className = 'table-hover table-responsive';
    newtable.id = "BFtable";
    //newtable.hidden = AFview;
    
    hcell = <HTMLTableHeaderCellElement>headrow.insertCell();
    hcell.innerHTML = "Basefolder ID";
    hcell = <HTMLTableHeaderCellElement>headrow.insertCell();
    hcell.innerHTML = "Basefolder Name";
    hcell = <HTMLTableHeaderCellElement>headrow.insertCell();
    hcell.innerHTML = "Rules";

    //Handle filtering functions
    if (txtFilterId.value.length != 0) {
        tmpBFList = bfList.filter(FilterBFonBFId, Number(txtFilterId.value));
    }

    for (var bfRef in tmpBFList) {
        tmpAFList = [];
        var bf: Basefolder = tmpBFList[bfRef];

        //Create a blank table row
        var row: HTMLTableRowElement = tbody.insertRow();
        var cell = row.insertCell(row.cells.length);
        cell.innerHTML = String(bf.id.toString());
        var cell = row.insertCell(row.cells.length);
        cell.innerHTML = bf.name;

        tmpAFList = ruleList.filter(FilterAFonBfId, Number(bf.id));

        var cell = row.insertCell(row.cells.length);
        cell.innerHTML = "";
        
        for (var ref in tmpAFList) {
            var tmpRule: AutofilerRule = tmpAFList[ref];
            cell.innerHTML += tmpRule.name + "<br/>";
        }
            

        tbody.appendChild(row);

        document.getElementById("bf-table-div").removeChild(tbl);
        document.getElementById("bf-table-div").appendChild(newtable);
        tbl = newtable;
    }
}

function PopulateTextArea(): void {
    console.log("Filling textareas with demo data...");

    var AFtextBox: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("ruletextarea");
    var BFtextBox: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("bftextarea");

    AFtextBox.value = "\n#\n#	Creator: $Id: w_config_autof.C, v 1.40 2010/ 04 / 20 09:43:12 mi- sto Exp $\n    #	Created: 11 / 06 / 14 14:18:27\n    #\n    disk_check {\n        12_months {\n            interval < 3600 >\n                enable < false >\n                purge_timeout < 12960000 >\n                archival < none >\n                lower_limit < 90 >\n                upper_limit < 95 >\n                base_folder_ids < 93 >\n    }\n        16_months_ContC {\n            base_folder_ids < 113 >\n                interval < 216000 >\n                upper_limit < 90 >\n                lower_limit < 88 >\n                archival < none >\n                purge_timeout < 5184000 >\n                enable < true >\n    }\n        17_months_ContC {\n            base_folder_ids < 111 >\n                interval < 216000 >\n                upper_limit < 90 >\n                lower_limit < 88 >\n                archival < none >\n                purge_timeout < 2592000 >\n                enable < true >\n    }\n        15_months_ContC {\n            base_folder_ids < 112 >\n                interval < 216000 >\n                upper_limit < 90 >\n                lower_limit < 88 >\n                archival < none >\n                purge_timeout < 7776000 >\n                enable < true >\n    }\n        24_months_Cont {\n            base_folder_ids < 95 >\n                interval < 3600 >\n                upper_limit < 95 >\n                lower_limit < 90 >\n                archival < none >\n                purge_timeout < 172800 >\n                enable < false >\n    }\n        prefetch {\n            base_folder_ids < 102 >\n                time < 06:00 >\n                    upper_limit < 70 >\n                    lower_limit < 50 >\n                    archival < none >\n                    purge_timeout < 2678400 >\n                    enable < true >\n    }\n        6_months {\n            enable < true >\n                purge_timeout < 31104000 >\n                archival < none >\n                lower_limit < 70 >\n                upper_limit < 80 >\n                time < 00:50 >\n                    base_folder_ids < 92 >\n    }\n        Cont_12 {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 138 139 140 141 142 148>\n    }\n        Cont_11C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 111 112 113>\n    }\n        Cont_10C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 53 54 55 56 57 58 59 60 61 62>\n    }\n        Cont_9C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 63 64 65 66 67 68 69 70 71 72>\n    }\n        Cont_8C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 73 74 75 76 77 78 79 80 81 82>\n    }\n        Cont_7C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 83 84 85 86 87 88 89 90 110>\n    }\n        Cont_8 {\n            base_folder_ids < 108 >\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_7 {\n            base_folder_ids < 118 109 115 101 132 133 134 135 136 137>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_6 {\n            base_folder_ids < 2 92 93 94 95 102 104 105 106 107>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_5 {\n            base_folder_ids < 44 45 46 47 48 49 50 51 52 91>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_4 {\n            base_folder_ids < 34 35 36 37 38 39 40 41 42 43>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_3 {\n            base_folder_ids < 24 25 26 27 28 29 30 31 32 33>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_2 {\n            base_folder_ids < 14 15 16 17 18 19 20 21 22 23>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_1 {\n            base_folder_ids < 1 4 5 6 7 8 9 10 11 13>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_burnbank {\n            base_folder_ids < 101 >\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 13824000 >\n                enable < true >\n    }\n        Cont_default {\n            base_folder_ids < 1 >\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 7776000 >\n                enable < true >\n    }\n        Daily_1 {\n            base_folder_ids < 1 4 5 6 7 8 9 10 11 13>\n                time < 03:50 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_2 {\n            base_folder_ids < 14 15 16 17 18 19 20 21 22 23>\n                time < 04:05 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_3 {\n            base_folder_ids < 24 25 26 27 28 29 30 31 32 33>\n                time < 04:20 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_4 {\n            base_folder_ids < 34 35 36 37 38 39 40 41 42 43>\n                time < 04:35 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_5 {\n            base_folder_ids < 44 45 46 47 48 49 50 51 52 91>\n                time < 04:50 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_6 {\n            base_folder_ids < 2 92 93 94 95 102 104 105 106 107>\n                time < 05:05 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_8 {\n            base_folder_ids < 108 >\n                time < 05:25 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_7 {\n            base_folder_ids < 118 109 115 101 132 133 134 135 136 137>\n                time < 04:20 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_7C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 04:35 >\n                    base_folder_ids < 83 84 85 86 87 88 89 90 110 114>\n    }\n        Daily_8C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 04:20 >\n                    base_folder_ids < 73 74 75 76 77 78 79 80 81 82>\n    }\n        Daily_9C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 04:05 >\n                    base_folder_ids < 63 64 65 66 67 68 69 70 71 72>\n    }\n        Daily_10C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 03:50 >\n                    base_folder_ids < 53 54 55 56 57 58 59 60 61 62>\n    }\n        Daily_11C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 04:05 >\n                    base_folder_ids < 111 112 113>\n    }\n        Daily_12 {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 03:55 >\n                    base_folder_ids < 138 139 140 141 142 148>\n    }\n        17_months_cont {\n            enable < true >\n                purge_timeout < 5184000 >\n                archival < none >\n                lower_limit < 96 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 109 >\n    }\n        16_months_cont {\n            enable < true >\n                purge_timeout < 7776000 >\n                archival < none >\n                lower_limit < 96 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 108 >\n    }\n        15_months_cont {\n            enable < true >\n                purge_timeout < 6768000 >\n                archival < none >\n                lower_limit < 96 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 107 >\n    }\n        13_months_cont {\n            enable < true >\n                purge_timeout < 15552000 >\n                archival < none >\n                lower_limit < 96 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 105 >\n    }\n        18_months_Cont {\n            enable < true >\n                purge_timeout < 3600 >\n                archival < none >\n                lower_limit < 88 >\n                upper_limit < 90 >\n                interval < 3600 >\n                base_folder_ids < 94 >\n    }\n        14_months_cont {\n            enable < true >\n                purge_timeout < 6048000 >\n                archival < none >\n                lower_limit < 88 >\n                upper_limit < 90 >\n                interval < 3600 >\n                base_folder_ids < 106 >\n    }\n    }\n    auto_archive {\n        Reported_1 {\n            base_folder_ids < 1 4 5 6 7 8 9 10 11 13>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n\n        Reported_2 {\n            base_folder_ids < 14 15 16 17 18 19 20 21 22 23>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_3 {\n            base_folder_ids < 24 25 26 27 28 29 30 31 32 33>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_4 {\n            base_folder_ids < 34 35 36 37 38 39 40 41 42 43>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_5 {\n            base_folder_ids < 44 45 46 47 48 49 50 51 52 101>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_6 {\n            base_folder_ids < 2 92 93 94 95 102 104 105 106 107>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_7 {\n            base_folder_ids < 115 118 108 109 132 133 134 135 136 137>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_7C {\n            lonely_rff_purge_timeout < 2592000 >\n                purge_timeout < 47347200 >\n                enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge < yes >\n                arch_timeout < 7200 >\n                time < 02:05 >\n                    state_check {\n                minimum < 100 >\n                    enable < true >\n	}\n            base_folder_ids < 83 84 85 86 87 88 89 90 91 110>\n    }\n        Reported_8C {\n            lonely_rff_purge_timeout < 2592000 >\n                purge_timeout < 47347200 >\n                enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge < yes >\n                arch_timeout < 7200 >\n                time < 01:50 >\n                    state_check {\n                minimum < 100 >\n                    enable < true >\n	}\n            base_folder_ids < 73 74 75 76 77 78 79 80 81 82>\n    }\n        Reported_9C {\n            lonely_rff_purge_timeout < 2592000 >\n                purge_timeout < 47347200 >\n                enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge < yes >\n                arch_timeout < 7200 >\n                time < 01:35 >\n                    state_check {\n                minimum < 100 >\n                    enable < true >\n	}\n            base_folder_ids < 63 64 65 66 67 68 69 70 71 72>\n    }\n        Reported_10C {\n            lonely_rff_purge_timeout < 2592000 >\n                purge_timeout < 47347200 >\n                enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge < yes >\n                arch_timeout < 7200 >\n                time < 01:20 >\n                    state_check {\n                minimum < 100 >\n                    enable < true >\n	}\n            base_folder_ids < 53 54 55 56 57 58 59 60 61 62>\n    }\n        Reported_11C {\n            lonely_rff_purge_timeout < 2592000 >\n                purge_timeout < 47347200 >\n                enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge < yes >\n                arch_timeout < 7200 >\n                time < 01:35 >\n                    state_check {\n                minimum < 100 >\n                    enable < true >\n	}\n            base_folder_ids < 111 112 113 114>\n    }\n        Reported_12 {\n            base_folder_ids < 138 139 140 141 142 148>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:50 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Timeout_1 {\n            base_folder_ids < 1 4 5 6 7 8 9 10 11 13>\n                time < 02:35 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_2 {\n            base_folder_ids < 14 15 16 17 18 19 20 21 22 23>\n                time < 02:50 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_3 {\n            base_folder_ids < 24 25 26 27 28 29 30 31 32 33>\n                time < 03:05 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_4 {\n            base_folder_ids < 34 35 36 37 38 39 40 41 42 43>\n                time < 03:20 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_5 {\n            base_folder_ids < 44 45 46 47 48 49 50 51 52 101>\n                time < 03:35 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_6 {\n            base_folder_ids < 2 92 93 94 95 102 104 105 106 107>\n                time < 03:50 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_7 {\n            base_folder_ids < 115 118 108 109 132 133 134 135 136 137>\n                time < 03:05 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_7C {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 04:00 >\n                    base_folder_ids < 83 84 85 86 87 88 89 90 91 110>\n    }\n        Timeout_8C {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 04:20 >\n                    base_folder_ids < 73 74 75 76 77 78 79 80 81 82>\n    }\n        Timeout_9C {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 04:40 >\n                    base_folder_ids < 63 64 65 66 67 68 69 70 71 72>\n    }\n        Timeout_10C {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 05:00 >\n                    base_folder_ids < 53 54 55 56 57 58 59 60 61 62>\n    }\n        Timeout_11C {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 05:15 >\n                    base_folder_ids < 111 112 113 114>\n    }\n        Timeout_12 {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 04:10 >\n                    base_folder_ids < 138 139 140 141 142 148>\n    }\n        transition_archive {\n            base_folder_ids < 2 >\n                interval < 900 >\n                arch_timeout < 60 >\n                purge < no >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 1209600 >\n                enable < false >\n    }\n    }\n    verbose < 1 >";
    BFtextBox.value = "base_folder:\n	id: 1\n	name: System default\n	type_id: 0\n	location: file://SUTPIS01/folders$/default\n	id_string: default\nbase_folder:\n	id: 2\n	name: transition\n	location: file://SUTPIS01/folders$/transition\n	id_string: transition\nbase_folder:\n	id: 3\n	name: Archive\n	type_id: 1\n	location: mojb://NONE\n	id_string: archive\nbase_folder:\n	id: 4\n	name: sut_ct1\n	location: file://SUTPIS01/folders$/sut_ct1\n	id_string: sut_ct1\nbase_folder:\n	id: 5\n	name: sut_ct2\n	location: file://SUTPIS01/folders$/sut_ct2\n	id_string: sut_ct2\nbase_folder:\n	id: 6\n	name: sut_ctws1\n	location: file://SUTPIS01/folders$/sut_ctws1\n	id_string: sut_ctws1\nbase_folder:\n	id: 7\n	name: sut_ct3\n	location: file://SUTPIS01/folders$/sut_ct3\n	id_string: sut_ct3\nbase_folder:\n	id: 8\n	name: sut_ct4\n	location: file://SUTPIS01/folders$/sut_ct4\n	id_string: sut_ct4\nbase_folder:\n	id: 9\n	name: sut_ot1\n	location: file://SUTPIS01/folders$/sut_ot1\n	id_string: sut_ot1\nbase_folder:\n	id: 10\n	name: sut_mr1\n	location: file://SUTPIS01/folders$/sut_mr1\n	id_string: sut_mr1\nbase_folder:\n	id: 11\n	name: sut_mr2\n	location: file://SUTPIS01/folders$/sut_mr2\n	id_string: sut_mr2\nbase_folder:\n	id: 13\n	name: sut_mr3\n	location: file://SUTPIS01/folders$/sut_mr3\n	id_string: sut_mr3\nbase_folder:\n	id: 14\n	name: sut_mrsw1\n	location: file://SUTPIS01/folders$/sut_mrws1\n	id_string: sut_mrws1\nbase_folder:\n	id: 15\n	name: sut_mrsw2\n	location: file://SUTPIS01/folders$/sut_mrws2\n	id_string: sut_mrws2\nbase_folder:\n	id: 16\n	name: sut_mrsw3\n	location: file://SUTPIS01/folders$/sut_mrws3\n	id_string: sut_mrws3\nbase_folder:\n	id: 17\n	name: sut_mrsw4\n	location: file://SUTPIS01/folders$/sut_mrws4\n	id_string: sut_mrws4\nbase_folder:\n	id: 18\n	name: sut_mrsw5\n	location: file://SUTPIS01/folders$/sut_mrws5\n	id_string: sut_mrws5\nbase_folder:\n	id: 19\n	name: sut_mg1\n	location: file://SUTPIS01/folders$/sut_mg1\n	id_string: sut_mg1\nbase_folder:\n	id: 20\n	name: sut_mg2\n	location: file://SUTPIS01/folders$/sut_mg2\n	id_string: sut_mg2\nbase_folder:\n	id: 21\n	name: sut_mg3\n	location: file://SUTPIS01/folders$/sut_mg3\n	id_string: sut_mg3\nbase_folder:\n	id: 22\n	name: sut_mgws1\n	location: file://SUTPIS01/folders$/sut_mgws1\n	id_string: sut_mgws1\nbase_folder:\n	id: 23\n	name: sut_mgws2\n	location: file://SUTPIS01/folders$/sut_mgws2\n	id_string: sut_mgws2\nbase_folder:\n	id: 24\n	name: sut_mg4\n	location: file://SUTPIS01/folders$/sut_mg4\n	id_string: sut_mg4\nbase_folder:\n	id: 25\n	name: sut_mgws3\n	location: file://SUTPIS01/folders$/sut_mgws3\n	id_string: sut_mgws3\nbase_folder:\n	id: 26\n	name: sut_us1\n	location: file://SUTPIS01/folders$/sut_us1\n	id_string: sut_us1\nbase_folder:\n	id: 27\n	name: sut_us2\n	location: file://SUTPIS01/folders$/sut_us2\n	id_string: sut_us2\nbase_folder:\n	id: 28\n	name: sut_us3\n	location: file://SUTPIS01/folders$/sut_us3\n	id_string: sut_us3\nbase_folder:\n	id: 29\n	name: sut_us4\n	location: file://SUTPIS01/folders$/sut_us4\n	id_string: sut_us4\nbase_folder:\n	id: 30\n	name: sut_rf1\n	location: file://SUTPIS01/folders$/sut_rf1\n	id_string: sut_rf1\nbase_folder:\n	id: 31\n	name: sut_dr1\n	location: file://SUTPIS01/folders$/sut_dr1\n	id_string: sut_dr1\nbase_folder:\n	id: 32\n	name: sut_cr1\n	location: file://SUTPIS01/folders$/sut_cr1\n	id_string: sut_cr1\nbase_folder:\n	id: 33\n	name: sut_cr2\n	location: file://SUTPIS01/folders$/sut_cr2\n	id_string: sut_cr2\nbase_folder:\n	id: 34\n	name: sut_cr3\n	location: file://SUTPIS01/folders$/sut_cr3\n	id_string: sut_cr3\nbase_folder:\n	id: 35\n	name: sut_cr4\n	location: file://SUTPIS01/folders$/sut_cr4\n	id_string: sut_cr4\nbase_folder:\n	id: 36\n	name: sut_nm1\n	location: file://SUTPIS01/folders$/sut_nm1\n	id_string: sut_nm1\nbase_folder:\n	id: 37\n	name: sut_nm2\n	location: file://SUTPIS01/folders$/sut_nm2\n	id_string: sut_nm2\nbase_folder:\n	id: 38\n	name: sut_nm3\n	location: file://SUTPIS01/folders$/sut_nm3\n	id_string: sut_nm3\nbase_folder:\n	id: 39\n	name: sut_nm4\n	location: file://SUTPIS01/folders$/sut_nm4\n	id_string: sut_nm4\nbase_folder:\n	id: 40\n	name: sut_nmws1\n	location: file://SUTPIS01/folders$/sut_nmws1\n	id_string: sut_nmws1\nbase_folder:\n	id: 41\n	name: sut_nmws2\n	location: file://SUTPIS01/folders$/sut_nmws2\n	id_string: sut_nmws2\nbase_folder:\n	id: 42\n	name: sut_nmws3\n	location: file://SUTPIS01/folders$/sut_nmws3\n	id_string: sut_nmws3\nbase_folder:\n	id: 43\n	name: sut_nmws4\n	location: file://SUTPIS01/folders$/sut_nmws4\n	id_string: sut_nmws4\nbase_folder:\n	id: 44\n	name: sut_pet1\n	location: file://SUTPIS01/folders$/sut_pet1\n	id_string: sut_pet1\nbase_folder:\n	id: 45\n	name: sut_pet2\n	location: file://SUTPIS01/folders$/sut_pet2\n	id_string: sut_pet2\nbase_folder:\n	id: 46\n	name: sut_nm5\n	location: file://SUTPIS01/folders$/sut_nm5\n	id_string: sut_nm5\nbase_folder:\n	id: 47\n	name: sut_nm6\n	location: file://SUTPIS01/folders$/sut_nm6\n	id_string: sut_nm6\nbase_folder:\n	id: 48\n	name: sut_nm7\n	location: file://SUTPIS01/folders$/sut_nm7\n	id_string: sut_nm7\nbase_folder:\n	id: 49\n	name: sut_ctws2\n	location: file://SUTPIS01/folders$/sut_ctws2\n	id_string: sut_ctws2\nbase_folder:\n	id: 50\n	name: sut_ot2\n	location: file://SUTPIS01/folders$/sut_ot2\n	id_string: sut_ot2\nbase_folder:\n	id: 51\n	name: sut_ot3\n	location: file://SUTPIS01/folders$/sut_ot3\n	id_string: sut_ot3\nbase_folder:\n	id: 52\n	name: sut_ot4\n	location: file://SUTPIS01/folders$/sut_ot4\n	id_string: sut_ot4\nbase_folder:\n	id: 53\n	name: che_ct1\n	location: file://CHEPIS01/folders$/che_ct1\n	id_string: che_ct1\nbase_folder:\n	id: 54\n	name: che_ct2\n	location: file://CHEPIS01/folders$/che_ct2\n	id_string: che_ct2\nbase_folder:\n	id: 55\n	name: che_ct3\n	location: file://CHEPIS01/folders$/che_ct3\n	id_string: che_ct3\nbase_folder:\n	id: 56\n	name: che_mr1\n	location: file://CHEPIS01/folders$/che_mr1\n	id_string: che_mr1\nbase_folder:\n	id: 57\n	name: che_mrws1\n	location: file://CHEPIS01/folders$/che_mrws1\n	id_string: che_mrws1\nbase_folder:\n	id: 58\n	name: che_mr2\n	location: file://CHEPIS01/folders$/che_mr2\n	id_string: che_mr2\nbase_folder:\n	id: 59\n	name: che_mrws2\n	location: file://CHEPIS01/folders$/che_mrws2\n	id_string: che_mrws2\nbase_folder:\n	id: 60\n	name: che_mg1\n	location: file://CHEPIS01/folders$/che_mg1\n	id_string: che_mg1\nbase_folder:\n	id: 61\n	name: che_mg2\n	location: file://CHEPIS01/folders$/che_mg2\n	id_string: che_mg2\nbase_folder:\n	id: 62\n	name: che_mg3\n	location: file://CHEPIS01/folders$/che_mg3\n	id_string: che_mg3\nbase_folder:\n	id: 63\n	name: che_mg4\n	location: file://CHEPIS01/folders$/che_mg4\n	id_string: che_mg4\nbase_folder:\n	id: 64\n	name: che_us1\n	location: file://CHEPIS01/folders$/che_us1\n	id_string: che_us1\nbase_folder:\n	id: 65\n	name: che_us2\n	location: file://CHEPIS01/folders$/che_us2\n	id_string: che_us2\nbase_folder:\n	id: 66\n	name: che_us3\n	location: file://CHEPIS01/folders$/che_us3\n	id_string: che_us3\nbase_folder:\n	id: 67\n	name: che_us4\n	location: file://CHEPIS01/folders$/che_us4\n	id_string: che_us4\nbase_folder:\n	id: 68\n	name: che_us5\n	location: file://CHEPIS01/folders$/che_us5\n	id_string: che_us5\nbase_folder:\n	id: 69\n	name: che_us6\n	location: file://CHEPIS01/folders$/che_us6\n	id_string: che_us6\nbase_folder:\n	id: 70\n	name: che_xa1\n	location: file://CHEPIS01/folders$/che_xa1\n	id_string: che_xa1\nbase_folder:\n	id: 71\n	name: che_xa2\n	location: file://CHEPIS01/folders$/che_xa2\n	id_string: che_xa2\nbase_folder:\n	id: 72\n	name: che_cr1\n	location: file://CHEPIS01/folders$/che_cr1\n	id_string: che_cr1\nbase_folder:\n	id: 73\n	name: che_cr2\n	location: file://CHEPIS01/folders$/che_cr2\n	id_string: che_cr2\nbase_folder:\n	id: 74\n	name: che_cr3\n	location: file://CHEPIS01/folders$/che_cr3\n	id_string: che_cr3\nbase_folder:\n	id: 75\n	name: che_cr4\n	location: file://CHEPIS01/folders$/che_cr4\n	id_string: che_cr4\nbase_folder:\n	id: 76\n	name: che_dr1\n	location: file://CHEPIS01/folders$/che_dr1\n	id_string: che_dr1\nbase_folder:\n	id: 77\n	name: che_drrf1\n	location: file://CHEPIS01/folders$/che_drrf1\n	id_string: che_drrf1\nbase_folder:\n	id: 78\n	name: che_iopx1\n	location: file://CHEPIS01/folders$/che_iopx1\n	id_string: che_iopx1\nbase_folder:\n	id: 79\n	name: che_ctws1\n	location: file://CHEPIS01/folders$/che_ctws1\n	id_string: che_ctws1\nbase_folder:\n	id: 80\n	name: che_ctws2\n	location: file://CHEPIS01/folders$/che_ctws2\n	id_string: che_ctws2\nbase_folder:\n	id: 81\n	name: che_ot1\n	location: file://CHEPIS01/folders$/che_ot1\n	id_string: che_ot1\nbase_folder:\n	id: 82\n	name: che_ot2\n	location: file://CHEPIS01/folders$/che_ot2\n	id_string: che_ot2\nbase_folder:\n	id: 83\n	name: che_mgws1\n	location: file://CHEPIS01/folders$/che_mgws1\n	id_string: che_mgws1\nbase_folder:\n	id: 84\n	name: che_mgws2\n	location: file://CHEPIS01/folders$/che_mgws2\n	id_string: che_mgws2\nbase_folder:\n	id: 85\n	name: che_mgws3\n	location: file://CHEPIS01/folders$/che_mgws3\n	id_string: che_mgws3\nbase_folder:\n	id: 86\n	name: che_pet1\n	location: file://CHEPIS01/folders$/che_pet1\n	id_string: che_pet1\nbase_folder:\n	id: 87\n	name: che_ct4\n	location: file://CHEPIS01/folders$/che_ct4\n	id_string: che_ct4\nbase_folder:\n	id: 88\n	name: che_nmws1\n	location: file://CHEPIS01/folders$/che_nmws1\n	id_string: che_nmws1\nbase_folder:\n	id: 89\n	name: che_nm1\n	location: file://CHEPIS01/folders$/che_nm1\n	id_string: che_nm1\nbase_folder:\n	id: 90\n	name: che_nmws2\n	location: file://CHEPIS01/folders$/che_nmws2\n	id_string: che_nmws2\nbase_folder:\n	id: 91\n	name: rmaqr\n	location: file://SUTPIS01/folders$/rmaqr\n	id_string: rmaqr\nbase_folder:\n	id: 92\n	name: 6months\n	location: file://SUTPIS01/folders$/6months\n	id_string: 6months\nbase_folder:\n	id: 93\n	name: 12months\n	location: file://SUTPIS01/folders$/12months\n	id_string: 12months\nbase_folder:\n	id: 94\n	name: 18months\n	location: file://SUTPIS01/folders$/18months\n	id_string: 18months\nbase_folder:\n	id: 95\n	name: 24months\n	location: file://SUTPIS01/folders$/24months\n	id_string: 24months\nbase_folder:\n	id: 96\n	name: IR On Call PACSMail\n	type_id: 2\n	location: send://10.163.252.112\n	id_string: PACSMail\nbase_folder:\n	id: 99\n	name: Radiotherapy Planning Sutton\n	type_id: 2\n	location: send://192.168.250.200\n	id_string: Radiotherapy_Planning\nbase_folder:\n	id: 101\n	name: sut_bur\n	location: file://SUTPIS01/folders$/sut_bur\n	id_string: sut_bur\nbase_folder:\n	id: 102\n	name: prefetch\n	location: file://SUTPIS01/folders$/prefetch\n	id_string: prefetch\nbase_folder:\n	id: 104\n	name: net_ret\n	location: file://SUTPIS01/folders$/net_ret\n	id_string: net_ret\nbase_folder:\n	id: 105\n	name: 13months\n	location: file://SUTPIS01/folders$/13months\n	id_string: 13months\nbase_folder:\n	id: 106\n	name: 14months\n	location: file://SUTPIS01/folders$/14months\n	id_string: 14months\nbase_folder:\n	id: 107\n	name: 15months\n	location: file://SUTPIS01/folders$/15months\n	id_string: 15months\nbase_folder:\n	id: 108\n	name: 16months\n	location: file://SUTPIS01/folders$/16months\n	id_string: 16months\nbase_folder:\n	id: 109\n	name: 17months\n	location: file://SUTPIS01/folders$/17months\n	id_string: 17months\nbase_folder:\n	id: 110\n	name: che_ct5\n	location: file://CHEPIS01/folders$/che_ct5\n	id_string: che_ct5\nbase_folder:\n	id: 111\n	name: 17months_2\n	location: file://CHEPIS01/folders$/17months_2\n	id_string: 17months_2\nbase_folder:\n	id: 112\n	name: 15months_2\n	location: file://CHEPIS01/folders$/15months_2\n	id_string: 15months_2\nbase_folder:\n	id: 113\n	name: 16months_2\n	location: file://CHEPIS01/folders$/16months_2\n	id_string: 16months_2\nbase_folder:\n	id: 114\n	name: che_rf\n	location: file://CHEPIS01/folders$/che_rf\n	id_string: che_rf\nbase_folder:\n	id: 115\n	name: sut_bbrad\n	location: file://SUTPIS01/folders$/sut_bbrad\n	id_string: sut_bbrad\nbase_folder:\n	id: 116\n	name: che_us7\n	location: file://CHEPIS01/folders$/che_us7\n	id_string: che_us7\nbase_folder:\n	id: 117\n	name: RPYS RPACS01\n	type_id: 2\n	location: send://192.168.254.20\n	id_string: rpys_0\nbase_folder:\n	id: 118\n	name: sut_dr2\n	location: file://SUTPIS01/folders$/sut_dr2\n	id_string: sut_dr2\nbase_folder:\n	id: 119\n	name: che_dr2\n	location: file://CHEPIS01/folders$/che_dr2\n	id_string: che_dr2\nbase_folder:\n	id: 120\n	name: che_dr3\n	location: file://CHEPIS01/folders$/che_dr3\n	id_string: che_dr3\nbase_folder:\n	id: 121\n	name: che_us8\n	location: file://CHEPIS01/folders$/che_us8\n	id_string: che_us8\nbase_folder:\n	id: 122\n	name: 18months_2\n	location: file://CHEPIS01/folders$/18months_2\n	id_string: 18months_2\nbase_folder:\n	id: 123\n	name: 14months_2\n	location: file://CHEPIS01/folders$/14months_2\n	id_string: 14months_2\nbase_folder:\n	id: 124\n	name: 13months_2\n	location: file://CHEPIS01/folders$/13months_2\n	id_string: 13months_2\nbase_folder:\n	id: 125\n	name: 12months_2\n	location: file://CHEPIS01/folders$/12months_2\n	id_string: 12months_2\nbase_folder:\n	id: 126\n	name: 11months_2\n	location: file://CHEPIS01/folders$/11months_2\n	id_string: 11months_2\nbase_folder:\n	id: 127\n	name: 10months_2\n	location: file://CHEPIS01/folders$/10months_2\n	id_string: 10months_2\nbase_folder:\n	id: 128\n	name: 9months_2\n	location: file://CHEPIS01/folders$/9months_2\n	id_string: 9months_2\nbase_folder:\n	id: 129\n	name: 8months_2\n	location: file://CHEPIS01/folders$/8months_2\n	id_string: 8months_2\nbase_folder:\n	id: 130\n	name: 7months_2\n	location: file://CHEPIS01/folders$/7months_2\n	id_string: 7months_2\nbase_folder:\n	id: 131\n	name: 6months_2\n	location: file://CHEPIS01/folders$/6months_2\n	id_string: 6months_2\nbase_folder:\n	id: 132\n	name: sut_nm8\n	location: file://SUTPIS01/folders$/sut_nm8\n	id_string: sut_nm8\nbase_folder:\n	id: 133\n	name: sut_nmws5\n	location: file://SUTPIS01/folders$/sut_nmws5\n	id_string: sut_nmws5\nbase_folder:\n	id: 134\n	name: sut_nmws6\n	location: file://SUTPIS01/folders$/sut_nmws6\n	id_string: sut_nmws6\nbase_folder:\n	id: 135\n	name: sut_us5\n	location: file://SUTPIS01/folders$/sut_us5\n	id_string: sut_us5\nbase_folder:\n	id: 136\n	name: sut_nm9\n	location: file://SUTPIS01/folders$/sut_nm9\n	id_string: sut_nm9\nbase_folder:\n	id: 137\n	name: sut_nm10\n	location: file://SUTPIS01/folders$/sut_nm10\n	id_string: sut_nm10\nbase_folder:\n	id: 138\n	name: sut_7930\n	location: file://SUTPIS01/folders$/sut_7930\n	id_string: sut_7930\nbase_folder:\n	id: 139\n	name: sut_7931\n	location: file://SUTPIS01/folders$/sut_7931\n	id_string: sut_7931\nbase_folder:\n	id: 140\n	name: sut_7932\n	location: file://SUTPIS01/folders$/sut_7932\n	id_string: sut_7932\nbase_folder:\n	id: 141\n	name: sut_7933\n	location: file://SUTPIS01/folders$/sut_7933\n	id_string: sut_7933\nbase_folder:\n	id: 142\n	name: sut_7934\n	location: file://SUTPIS01/folders$/sut_7934\n	id_string: sut_7934\nbase_folder:\n	id: 143\n	name: che_7935\n	location: file://CHEPIS01/folders$/che_7935\n	id_string: che_7935\nbase_folder:\n	id: 144\n	name: che_7936\n	location: file://CHEPIS01/folders$/che_7936\n	id_string: che_7936\nbase_folder:\n	id: 145\n	name: che_7937\n	location: file://CHEPIS01/folders$/che_7937\n	id_string: che_7937\nbase_folder:\n	id: 146\n	name: che_7938\n	location: file://CHEPIS01/folders$/che_7938\n	id_string: che_7938\nbase_folder:\n	id: 147\n	name: che_7939\n	location: file://CHEPIS01/folders$/che_7939\n	id_string: che_7939\nbase_folder:\n	id: 148\n	name: sut_ot5\n	location: file://SUTPIS01/folders$/sut_ot5\n	id_string: sut_ot5\nbase_folder:\n	id: 149\n	name: Radiotherapy Planning Chelsea\n	type_id: 2\n	location: send://192.168.248.2\n	id_string: Radiotherapy__Planning_Chelsea\nbase_folder:\n	id: 150\n	name: che_bur\n	location: file://CHEPIS01/folders$/che_bur\n	id_string: che_bur\nbase_folder:\n	id: 151\n	name: che_default\n	location: file://CHEPIS01/folders$/che_default\n	id_string: che_default\nbase_folder:\n	id: 152\n	name: che_mg5\n	location: file://CHEPIS01/folders$/che_mg5\n	id_string: che_mg5\nbase_folder:\n	id: 153\n	name: Urostation\n	type_id: 2\n	location: send://192.168.142.194\n	id_string: trdest_KOELIS\nbase_folder:\n	id: 154\n	name: sut_mg5\n	location: file://SUTPIS01/folders$/sut_mg5\n	id_string: sut_mg5\nbase_folder:\n	id: 155\n	name: NICAM\n	location: file://CHEPIS01/folders$/NICAM\n	id_string: NICAM\nbase_folder:\n	id: 156\n	name: sut_us6\n	location: file://SUTPIS01/folders$/sut_us6\n	id_string: sut_us6\n";

}

function SwitchTable(): void {
    var AFtbl: HTMLDivElement = <HTMLDivElement>document.getElementById("af-table-div");
    var BFtbl: HTMLDivElement = <HTMLDivElement>document.getElementById("bf-table-div");
    var btnSwitchTable: HTMLButtonElement = <HTMLButtonElement>document.getElementById("btnSwitchTable");
    

    if (AFview) {
        AFview = false;
        AFtbl.hidden = true;
        BFtbl.hidden = false;
        btnSwitchTable.textContent = "Go to autofiler view";
    }
    else {
        AFview = true;
        BFtbl.hidden = true;
        AFtbl.hidden = false;
        btnSwitchTable.textContent = "Go to basefolder view";

    }
}