var AutofilerParser = (function () {
    function AutofilerParser() {
    }
    AutofilerParser.prototype.ParseAutofilerConfig = function (cfgText) {
        var lines = cfgText.split("\n");
        var ruleNames = [];
        var counter = 0;
        ruleList = [];
        if (cfgText == "") {
            return;
        }
        if (cfgText == null) {
            return;
        }
        for (var index in lines) {
            var line = lines[index];
            var statecheck = false;
            var rule;
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
                    rule = new AutofilerRule(counter);
                    rule.name = value;
                    counter = counter + 1;
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
            if (line.indexOf("}") != -1) {
                if (statecheck) {
                    statecheck = false;
                    continue;
                }
                if (rule.name != null && counter > ruleList.length) {
                    ruleList.push(rule);
                    ruleNames.push(rule.name);
                }
            }
        }
        return ruleList;
    };
    return AutofilerParser;
}());
