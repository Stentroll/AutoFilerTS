///<reference path='AutofilerRule.ts'/>
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

    txtFilterId.oninput = function (ev) {
    };

    btnParse.onclick = function (ev) {
        ParseAutofilerCfg();

        console.log("Rules found:" + ruleList.length);

        if (ruleList.length > 0) {
            txtFilterId.disabled = false;
            txtFilterName.disabled = false;
            cbHideDisabled.disabled = false;
        }

        BuildTable();
    };

    txtFilterId.onkeyup = function () {
        BuildTable();
    };
    txtFilterName.onkeyup = function () {
        BuildTable();
    };
    cbHideDisabled.onchange = function () {
        BuildTable();
    };
};

document.getElementById('ruletextarea').onchange = function (ev) {
    //console.log("text changed");
    //console.log(document.getElementById('ruletextarea').innerHTML);
};

function FilterBfId(rule) {
    var tmp = rule.basefolders;
    if (tmp.indexOf(this.valueOf()) === -1) {
        return false;
    } else {
        return true;
    }
}

function FilterRuleName(rule) {
    var tmp = rule.name;
    tmp = tmp.toLowerCase();
    if (tmp.indexOf(this.toLowerCase()) === -1) {
        return false;
    } else {
        return true;
    }
}

function FilterRuleEnabled(rule) {
    return rule.enabled;
}

function BuildTable() {
    var tmpList;
    tmpList = ruleList;

    console.log(txtFilterId.value.length);

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

    var tbl = document.getElementById("nicetable");
    var newtable = document.createElement("table");
    var thead = newtable.createTHead();
    var tbody = newtable.createTBody();
    var headrow = thead.insertRow();
    var properties = Object.getOwnPropertyNames(new AutofilerRule(null));

    newtable.className = 'table-responsive';
    newtable.id = "nicetable";

    for (var propRef in properties) {
        var propertyName = properties[propRef];
        var hcell = headrow.insertCell(propRef);
        hcell.innerHTML = propertyName;
    }

    for (var ruleRef in tmpList) {
        var rule = tmpList[ruleRef];
        var row = rule.CreateTableRow();

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
            } else if (line.indexOf("disk_check") != -1 || line.indexOf("auto_archive") != -1) {
                //Nothing really
            } else {
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
