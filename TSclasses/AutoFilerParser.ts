class AutofilerParser {

    ParseAutofilerConfig(cfgText: string): AutofilerRule[] {

        var lines = cfgText.split("\n");
        var ruleNames: string[] = [];
        var counter: number = 0;

        ruleList = [];

        if (cfgText == "") { return; }
        if (cfgText == null) { return; }

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

            //If line has a closing bracket it means closing of a rule. If it is a second closing bracket it means we have left disk_check, end function and return list.
            //Else add current rule to List, create a new one and start over.
            if (line.indexOf("}") != -1) {
                if (statecheck) {
                    statecheck = false;
                    continue;
                }
                //if (rule.name != null && ruleNames.indexOf(rule.name) == -1) {
                if (rule.name != null && counter > ruleList.length) {
                    ruleList.push(rule);
                    ruleNames.push(rule.name);
                }
            }
        }
        return ruleList;
    }
}