///<reference path='AutofilerRule.ts'/>
///<reference path='jquery.d.ts'/>
var ruleList;
ruleList = [];
var txtFilterId;
var txtFilterName;
var cbHideDisabled;
window.onload = function () {
    var el = document.getElementById('content');
    var ruletextarea = document.getElementById('ruletextarea');
    var btnParse = document.getElementById('btnParse');
    txtFilterId = document.getElementById('txtFilterId');
    txtFilterName = document.getElementById('txtFilterName');
    cbHideDisabled = document.getElementById('cbHideDisabled');
    CreateFilterChecks();
    var ButtonClearFilters = document.getElementById('ButtonClearFilters');
    ButtonClearFilters.onclick = function (ev) {
        txtFilterId.value = "";
        txtFilterName.value = "";
        cbHideDisabled.checked = false;
        BuildTable();
    };
    btnParse.onclick = function (ev) {
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
    };
    txtFilterId.onkeyup = function () { BuildTable(); };
    txtFilterName.onkeyup = function () { BuildTable(); };
    cbHideDisabled.onchange = function () { BuildTable(); };
};
document.getElementById('ruletextarea').onchange = function (ev) {
};
function CheckedChange(ev) {
    BuildTable();
}
function FilterBfId(rule) {
    var tmp = rule.basefolders;
    if (tmp.indexOf(this.valueOf()) === -1) {
        return false;
    }
    else {
        return true;
    }
}
function FilterRuleName(rule) {
    var tmp = rule.name;
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
    var fieldNames = [];
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
        var newDiv = document.createElement("div");
        newDiv.classList.add("checkDiv");
        var newCheck = document.createElement("input");
        newCheck.className = "fieldcheck";
        newCheck.type = "checkbox";
        newCheck.checked = true;
        newCheck.id = fieldRef;
        var tag = document.createElement("h5");
        tag.innerHTML = fieldNames[fieldRef];
        newDiv.appendChild(newCheck);
        newDiv.appendChild(tag);
        document.getElementById("fieldSelectors").appendChild(newDiv);
        newCheck.onchange = function (ev) { return CheckedChange(ev); };
    }
    var fieldchecks = document.getElementsByClassName("fieldcheck");
}
function BuildTable() {
    var tmpList;
    tmpList = ruleList;
    var checksBoolArray = [];
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
        var checkboxtmp = checkboxElementArray[n];
        checksBoolArray.push(checkboxtmp.checked);
    }
    document.getElementById('h2RuleCount').innerHTML = "Autofiler Rules: " + tmpList.length;
    var tbl = document.getElementById("nicetable");
    var newtable = document.createElement("table");
    var thead = newtable.createTHead();
    var tbody = newtable.createTBody();
    var headrow = thead.insertRow();
    var properties = Object.getOwnPropertyNames(new AutofilerRule(null));
    newtable.className = 'table-hover table-responsive';
    newtable.id = "nicetable";
    for (var propRef in properties) {
        console.log(propRef);
        if (checksBoolArray[propRef]) {
            var propertyName = properties[propRef];
            var hcell = headrow.insertCell();
            hcell.innerHTML = propertyName;
        }
    }
    for (var ruleRef in tmpList) {
        var rule = tmpList[ruleRef];
        var row = rule.CreateTableRow();
        console.log(checksBoolArray);
        for (var checkBool in checksBoolArray) {
            if (!checksBoolArray[checkBool]) {
                console.log(checkBool);
                var cell = row.childNodes[checkBool];
                console.log(cell);
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
    var textBox = document.getElementById('ruletextarea');
    var cfgText = textBox.textContent;
    var lines = cfgText.split("\n");
    var ruleNames = [];
    for (var index in lines) {
        var line = lines[index];
        var statecheck = false;
        var rule;
        //If it is a commented line skip to next
        if (line == "") {
            continue;
        }
        if (line == null) {
            continue;
        }
        if (line[0] == '#') {
            continue;
        }
        if (line.indexOf("{") != -1) {
            if (line.indexOf("state_check") != -1) {
                statecheck = true;
            }
            else if (line.indexOf("disk_check") != -1 || line.indexOf("auto_archive") != -1) {
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
//# sourceMappingURL=app.js.map