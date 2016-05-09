///<reference path='AutofilerRule.ts'/>
///<reference path='jquery.d.ts'/>


var ruleList : AutofilerRule[];
ruleList = [];

var txtFilterId: HTMLInputElement;
var txtFilterName: HTMLInputElement;
var cbHideDisabled: HTMLInputElement;

window.onload = () => {
    var el = document.getElementById('content');
    var ruletextarea = document.getElementById('ruletextarea');
    var btnParse = document.getElementById('btnParse');

    txtFilterId = <HTMLInputElement> document.getElementById('txtFilterId');
    txtFilterName = <HTMLInputElement> document.getElementById('txtFilterName');
    cbHideDisabled = <HTMLInputElement> document.getElementById('cbHideDisabled');


    PopulateTextArea();

    CreateFilterChecks();

    var ButtonClearFilters = document.getElementById('ButtonClearFilters');
    ButtonClearFilters.onclick = (ev: Event) => {
        txtFilterId.value = "";
        txtFilterName.value = "";
        cbHideDisabled.checked = false;
        BuildTable();

    }

    btnParse.onclick = (ev: Event) => {
        ruleList = [];
        ParseAutofilerCfg();

        console.log("Rules found:" + ruleList.length);

        if (ruleList.length > 0) {
            txtFilterId.disabled = false;
            txtFilterName.disabled = false;
            cbHideDisabled.disabled = false;
        }

        BuildTable();

        document.getElementById("nicetable").focus();
    }

    txtFilterId.onkeyup = () => { BuildTable(); };
    txtFilterName.onkeyup = () => { BuildTable(); };
    cbHideDisabled.onchange = () => { BuildTable(); };
};

document.getElementById('ruletextarea').onchange = (ev : Event) => {
};

function CheckedChange(ev) {
    BuildTable();
}

function FilterBfId(rule) {
    var tmp: number[] = rule.basefolders;
    if (tmp.indexOf(this.valueOf()) === -1) {
        return false;
    }
    else {
        return true;
    }
}

function FilterRuleName(rule) {
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
    var fieldNames: string[] = [];
    fieldNames.push("name");
    fieldNames.push("purgeTimeoutSec");
    fieldNames.push("purgeTimeoutDays");
    fieldNames.push("basefolders");
    fieldNames.push("archival");
    fieldNames.push("upperLimit");
    fieldNames.push("lowerLimit");
    fieldNames.push("time");
    fieldNames.push("enabled");
    fieldNames.push("interval");
    fieldNames.push("archTimeout");
    fieldNames.push("archTimeoutDays");
    fieldNames.push("purgeActive");
    fieldNames.push("maxRffQueue");
    fieldNames.push("rffMaxArchTimeout");
    fieldNames.push("enableStatecheck");
    fieldNames.push("minimum");

    for (var fieldRef in fieldNames) {
        var newDiv: HTMLDivElement = document.createElement("div");
        newDiv.classList.add("checkDiv");

        var newCheck: HTMLInputElement = document.createElement("input");
        newCheck.className = "fieldcheck";
        newCheck.type = "checkbox";
        newCheck.checked = true;
        newCheck.id = fieldRef;

        var tag: HTMLElement = document.createElement("h5");
        tag.innerHTML = fieldNames[fieldRef];

        newDiv.appendChild(newCheck);
        newDiv.appendChild(tag);

        document.getElementById("fieldSelectors").appendChild(newDiv);

        newCheck.onchange = (ev: Event) => CheckedChange(ev);
    } 

    var fieldchecks: NodeList = document.getElementsByClassName("fieldcheck");
}

function BuildTable() {
    var tmpList: AutofilerRule[];
    tmpList = ruleList;
    var checksBoolArray: boolean[] = [];

    //Handle filtering functions
    if (txtFilterId.value.length != 0) {
        tmpList = tmpList.filter(FilterBfId, Number(txtFilterId.value));
    }

    if (txtFilterName.value.length != 0) {
        tmpList = tmpList.filter(FilterRuleName, txtFilterName.value);
    }

    if (cbHideDisabled.checked) {
        tmpList = tmpList.filter(FilterRuleEnabled, true);
    }

    var checkboxElementArray = document.getElementsByClassName("fieldcheck");


    for (var n = 0; n < checkboxElementArray.length; n++) {
        var checkboxtmp: HTMLInputElement = <HTMLInputElement>checkboxElementArray[n];
        checksBoolArray.push(checkboxtmp.checked);
    }



    document.getElementById('h2RuleCount').innerHTML = "Autofiler Rules: " + tmpList.length;

    var tbl: HTMLTableElement = <HTMLTableElement> document.getElementById("nicetable");
    var newtable: HTMLTableElement = document.createElement("table");
    var thead = <HTMLTableSectionElement> newtable.createTHead();
    var tbody = <HTMLTableSectionElement> newtable.createTBody();
    var headrow: HTMLTableRowElement = <HTMLTableRowElement> thead.insertRow();
    var properties = Object.getOwnPropertyNames(new AutofilerRule(null));

    newtable.className = 'table-hover table-responsive';
    newtable.id = "nicetable";
    
    for (var propRef in properties) {
        console.log(propRef);

        if (checksBoolArray[propRef]) {
            var propertyName = properties[propRef];
            var hcell: HTMLTableHeaderCellElement = <HTMLTableHeaderCellElement> headrow.insertCell();
            hcell.innerHTML = propertyName;
        }
    }

    for (var ruleRef in tmpList) {
        var rule: AutofilerRule = tmpList[ruleRef];
        var row : HTMLTableRowElement = rule.CreateTableRow();
        
        for (var checkBool in checksBoolArray) {
            if (!checksBoolArray[checkBool]) {
                var cell: HTMLTableCellElement = <HTMLTableCellElement>row.childNodes[checkBool];
                cell.hidden = true;
            }
        }

        tbody.appendChild(row);

        document.getElementById("tablediv").removeChild(tbl);
        document.getElementById("tablediv").appendChild(newtable);
        tbl = newtable;
    }
}

function ParseAutofilerCfg() {
    var textBox: HTMLTextAreaElement = <HTMLTextAreaElement> document.getElementById('ruletextarea');
    var cfgText = textBox.textContent;
    var lines = cfgText.split("\n");
    var ruleNames: string[] = [];

    for (var index in lines) {
        var line = lines[index];
        var statecheck: boolean = false;
        var rule: AutofilerRule;

        //If it is a commented line skip to next
        if (line == "") { continue; }
        if (line == null) { continue; }
        if (line[0] == '#') { continue; }

        if (line.indexOf("{") != -1) {

            if (line.indexOf("state_check") != -1) {
                statecheck = true;
            }
            else if (line.indexOf("disk_check") != -1 || line.indexOf("auto_archive") != -1) {
                //Nothing really
            }
            else {
                var value = line.split("{")[0].trim();
                statecheck = false;
                rule = new AutofilerRule(value);
            }
            continue;
        }

        if (line.indexOf("<") != -1 && line.indexOf(">") != -1) {
            var field = line.split(RegExp("<"))[0].trim();
            var value = line.split(RegExp("<"))[1].trim();

            field = field.replace("\>", "");
            value = value.replace("\>", "");


            if (statecheck && field.indexOf("enable") != -1) {
                field = "enableStatecheck";
            }
            rule.set(field, value);
        }

        //If line has a closing bracket it means closing of a rule. If it is a second closing bracket it means we have left disk_check, end function and return list.
        //Else add current rule to List, create a new one and start over.
        if (line.indexOf("}") != -1) {
            if (statecheck) {
                statecheck = false;
                continue;
            }
            if (rule.name != null && ruleNames.indexOf(rule.name) == -1) {
                ruleList.push(rule);
                ruleNames.push(rule.name);
            }
        }
    }
}

function PopulateTextArea(): void {
    document.getElementById("ruletextarea").innerHTML = "\n#\n#	Creator: $Id: w_config_autof.C, v 1.40 2010/ 04 / 20 09:43:12 mi- sto Exp $\n    #	Created: 11 / 06 / 14 14:18:27\n    #\n    disk_check {\n        12_months {\n            interval < 3600 >\n                enable < false >\n                purge_timeout < 12960000 >\n                archival < none >\n                lower_limit < 90 >\n                upper_limit < 95 >\n                base_folder_ids < 93 >\n    }\n        16_months_ContC {\n            base_folder_ids < 113 >\n                interval < 216000 >\n                upper_limit < 90 >\n                lower_limit < 88 >\n                archival < none >\n                purge_timeout < 5184000 >\n                enable < true >\n    }\n        17_months_ContC {\n            base_folder_ids < 111 >\n                interval < 216000 >\n                upper_limit < 90 >\n                lower_limit < 88 >\n                archival < none >\n                purge_timeout < 2592000 >\n                enable < true >\n    }\n        15_months_ContC {\n            base_folder_ids < 112 >\n                interval < 216000 >\n                upper_limit < 90 >\n                lower_limit < 88 >\n                archival < none >\n                purge_timeout < 7776000 >\n                enable < true >\n    }\n        24_months_Cont {\n            base_folder_ids < 95 >\n                interval < 3600 >\n                upper_limit < 95 >\n                lower_limit < 90 >\n                archival < none >\n                purge_timeout < 172800 >\n                enable < false >\n    }\n        prefetch {\n            base_folder_ids < 102 >\n                time < 06:00 >\n                    upper_limit < 70 >\n                    lower_limit < 50 >\n                    archival < none >\n                    purge_timeout < 2678400 >\n                    enable < true >\n    }\n        6_months {\n            enable < true >\n                purge_timeout < 31104000 >\n                archival < none >\n                lower_limit < 70 >\n                upper_limit < 80 >\n                time < 00:50 >\n                    base_folder_ids < 92 >\n    }\n        Cont_12 {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 138 139 140 141 142 148>\n    }\n        Cont_11C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 111 112 113>\n    }\n        Cont_10C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 53 54 55 56 57 58 59 60 61 62>\n    }\n        Cont_9C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 63 64 65 66 67 68 69 70 71 72>\n    }\n        Cont_8C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 73 74 75 76 77 78 79 80 81 82>\n    }\n        Cont_7C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 95 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 83 84 85 86 87 88 89 90 110>\n    }\n        Cont_8 {\n            base_folder_ids < 108 >\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_7 {\n            base_folder_ids < 118 109 115 101 132 133 134 135 136 137>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_6 {\n            base_folder_ids < 2 92 93 94 95 102 104 105 106 107>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_5 {\n            base_folder_ids < 44 45 46 47 48 49 50 51 52 91>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_4 {\n            base_folder_ids < 34 35 36 37 38 39 40 41 42 43>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_3 {\n            base_folder_ids < 24 25 26 27 28 29 30 31 32 33>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_2 {\n            base_folder_ids < 14 15 16 17 18 19 20 21 22 23>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_1 {\n            base_folder_ids < 1 4 5 6 7 8 9 10 11 13>\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 41472000 >\n                enable < true >\n    }\n        Cont_burnbank {\n            base_folder_ids < 101 >\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 13824000 >\n                enable < true >\n    }\n        Cont_default {\n            base_folder_ids < 1 >\n                interval < 3600 >\n                upper_limit < 97 >\n                lower_limit < 95 >\n                archival < none >\n                purge_timeout < 7776000 >\n                enable < true >\n    }\n        Daily_1 {\n            base_folder_ids < 1 4 5 6 7 8 9 10 11 13>\n                time < 03:50 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_2 {\n            base_folder_ids < 14 15 16 17 18 19 20 21 22 23>\n                time < 04:05 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_3 {\n            base_folder_ids < 24 25 26 27 28 29 30 31 32 33>\n                time < 04:20 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_4 {\n            base_folder_ids < 34 35 36 37 38 39 40 41 42 43>\n                time < 04:35 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_5 {\n            base_folder_ids < 44 45 46 47 48 49 50 51 52 91>\n                time < 04:50 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_6 {\n            base_folder_ids < 2 92 93 94 95 102 104 105 106 107>\n                time < 05:05 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_8 {\n            base_folder_ids < 108 >\n                time < 05:25 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_7 {\n            base_folder_ids < 118 109 115 101 132 133 134 135 136 137>\n                time < 04:20 >\n                    upper_limit < 93 >\n                    lower_limit < 95 >\n                    archival < none >\n                    purge_timeout < 41472000 >\n                    enable < true >\n    }\n        Daily_7C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 04:35 >\n                    base_folder_ids < 83 84 85 86 87 88 89 90 110 114>\n    }\n        Daily_8C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 04:20 >\n                    base_folder_ids < 73 74 75 76 77 78 79 80 81 82>\n    }\n        Daily_9C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 04:05 >\n                    base_folder_ids < 63 64 65 66 67 68 69 70 71 72>\n    }\n        Daily_10C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 03:50 >\n                    base_folder_ids < 53 54 55 56 57 58 59 60 61 62>\n    }\n        Daily_11C {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 04:05 >\n                    base_folder_ids < 111 112 113>\n    }\n        Daily_12 {\n            enable < true >\n                purge_timeout < 41472000 >\n                archival < none >\n                lower_limit < 93 >\n                upper_limit < 95 >\n                time < 03:55 >\n                    base_folder_ids < 138 139 140 141 142 148>\n    }\n        17_months_cont {\n            enable < true >\n                purge_timeout < 5184000 >\n                archival < none >\n                lower_limit < 96 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 109 >\n    }\n        16_months_cont {\n            enable < true >\n                purge_timeout < 7776000 >\n                archival < none >\n                lower_limit < 96 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 108 >\n    }\n        15_months_cont {\n            enable < true >\n                purge_timeout < 6768000 >\n                archival < none >\n                lower_limit < 96 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 107 >\n    }\n        13_months_cont {\n            enable < true >\n                purge_timeout < 15552000 >\n                archival < none >\n                lower_limit < 96 >\n                upper_limit < 97 >\n                interval < 3600 >\n                base_folder_ids < 105 >\n    }\n        18_months_Cont {\n            enable < true >\n                purge_timeout < 3600 >\n                archival < none >\n                lower_limit < 88 >\n                upper_limit < 90 >\n                interval < 3600 >\n                base_folder_ids < 94 >\n    }\n        14_months_cont {\n            enable < true >\n                purge_timeout < 6048000 >\n                archival < none >\n                lower_limit < 88 >\n                upper_limit < 90 >\n                interval < 3600 >\n                base_folder_ids < 106 >\n    }\n    }\n    auto_archive {\n        Reported_1 {\n            base_folder_ids < 1 4 5 6 7 8 9 10 11 13>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n\n        Reported_2 {\n            base_folder_ids < 14 15 16 17 18 19 20 21 22 23>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_3 {\n            base_folder_ids < 24 25 26 27 28 29 30 31 32 33>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_4 {\n            base_folder_ids < 34 35 36 37 38 39 40 41 42 43>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_5 {\n            base_folder_ids < 44 45 46 47 48 49 50 51 52 101>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_6 {\n            base_folder_ids < 2 92 93 94 95 102 104 105 106 107>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_7 {\n            base_folder_ids < 115 118 108 109 132 133 134 135 136 137>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:20 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Reported_7C {\n            lonely_rff_purge_timeout < 2592000 >\n                purge_timeout < 47347200 >\n                enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge < yes >\n                arch_timeout < 7200 >\n                time < 02:05 >\n                    state_check {\n                minimum < 100 >\n                    enable < true >\n	}\n            base_folder_ids < 83 84 85 86 87 88 89 90 91 110>\n    }\n        Reported_8C {\n            lonely_rff_purge_timeout < 2592000 >\n                purge_timeout < 47347200 >\n                enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge < yes >\n                arch_timeout < 7200 >\n                time < 01:50 >\n                    state_check {\n                minimum < 100 >\n                    enable < true >\n	}\n            base_folder_ids < 73 74 75 76 77 78 79 80 81 82>\n    }\n        Reported_9C {\n            lonely_rff_purge_timeout < 2592000 >\n                purge_timeout < 47347200 >\n                enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge < yes >\n                arch_timeout < 7200 >\n                time < 01:35 >\n                    state_check {\n                minimum < 100 >\n                    enable < true >\n	}\n            base_folder_ids < 63 64 65 66 67 68 69 70 71 72>\n    }\n        Reported_10C {\n            lonely_rff_purge_timeout < 2592000 >\n                purge_timeout < 47347200 >\n                enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge < yes >\n                arch_timeout < 7200 >\n                time < 01:20 >\n                    state_check {\n                minimum < 100 >\n                    enable < true >\n	}\n            base_folder_ids < 53 54 55 56 57 58 59 60 61 62>\n    }\n        Reported_11C {\n            lonely_rff_purge_timeout < 2592000 >\n                purge_timeout < 47347200 >\n                enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge < yes >\n                arch_timeout < 7200 >\n                time < 01:35 >\n                    state_check {\n                minimum < 100 >\n                    enable < true >\n	}\n            base_folder_ids < 111 112 113 114>\n    }\n        Reported_12 {\n            base_folder_ids < 138 139 140 141 142 148>\n                state_check {\n                enable < true >\n                    minimum < 100 >\n	}\n            time < 01:50 >\n                arch_timeout < 7200 >\n                purge < yes >\n                purge_timeout < 47347200 >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 38880000 >\n                enable < true >\n    }\n        Timeout_1 {\n            base_folder_ids < 1 4 5 6 7 8 9 10 11 13>\n                time < 02:35 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_2 {\n            base_folder_ids < 14 15 16 17 18 19 20 21 22 23>\n                time < 02:50 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_3 {\n            base_folder_ids < 24 25 26 27 28 29 30 31 32 33>\n                time < 03:05 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_4 {\n            base_folder_ids < 34 35 36 37 38 39 40 41 42 43>\n                time < 03:20 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_5 {\n            base_folder_ids < 44 45 46 47 48 49 50 51 52 101>\n                time < 03:35 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_6 {\n            base_folder_ids < 2 92 93 94 95 102 104 105 106 107>\n                time < 03:50 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_7 {\n            base_folder_ids < 115 118 108 109 132 133 134 135 136 137>\n                time < 03:05 >\n                    arch_timeout < 1296000 >\n                    purge < yes >\n                    purge_timeout < 47347200 >\n                    max_rff_queue < 500 >\n                    rff_max_arch_timeout < 38880000 >\n                    enable < true >\n    }\n        Timeout_7C {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 04:00 >\n                    base_folder_ids < 83 84 85 86 87 88 89 90 91 110>\n    }\n        Timeout_8C {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 04:20 >\n                    base_folder_ids < 73 74 75 76 77 78 79 80 81 82>\n    }\n        Timeout_9C {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 04:40 >\n                    base_folder_ids < 63 64 65 66 67 68 69 70 71 72>\n    }\n        Timeout_10C {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 05:00 >\n                    base_folder_ids < 53 54 55 56 57 58 59 60 61 62>\n    }\n        Timeout_11C {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 05:15 >\n                    base_folder_ids < 111 112 113 114>\n    }\n        Timeout_12 {\n            enable < true >\n                rff_max_arch_timeout < 38880000 >\n                max_rff_queue < 500 >\n                purge_timeout < 47347200 >\n                purge < yes >\n                arch_timeout < 1296000 >\n                time < 04:10 >\n                    base_folder_ids < 138 139 140 141 142 148>\n    }\n        transition_archive {\n            base_folder_ids < 2 >\n                interval < 900 >\n                arch_timeout < 60 >\n                purge < no >\n                max_rff_queue < 500 >\n                rff_max_arch_timeout < 1209600 >\n                enable < false >\n    }\n    }\n    verbose < 1 >";

}