var AutofilerParser = (function () {
    function AutofilerParser() {
    }
    AutofilerParser.prototype.ParseAutofilerConfig = function (cfgText) {
        var lines = cfgText.split("\n");
        var ruleNames = [];
        var counter = 0;
        var ruleList = [];
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
            if (this.StringContains(line, "{")) {
                if (this.StringContains(line, "state_check")) {
                    statecheck = true;
                }
                else if (this.StringContains(line, "disk_check") || this.StringContains(line, "auto_archive")) {
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
            if (this.StringContains(line, "<") && this.StringContains(line, ">")) {
                var field = line.split(RegExp("<"))[0].trim();
                var value = line.split(RegExp("<"))[1].trim();
                field = field.replace("\>", "");
                value = value.replace("\>", "");
                if (statecheck && this.StringContains(field, "enable")) {
                    field = "enableStatecheck";
                }
                rule.set(field, value);
            }
            if (this.StringContains(line, "}")) {
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
    AutofilerParser.prototype.StringContains = function (input, find) {
        return (input.indexOf(find) != -1);
    };
    return AutofilerParser;
}());
