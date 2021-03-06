﻿class AutofilerParser {
    ParseAutofilerConfig(cfgText: string): AutofilerRule[] {

        let lines = cfgText.split("\n");
        let ruleNames: string[] = [];
        let counter: number = 0;
        let defaultBFsString: string = null;

        let ruleList: AutofilerRule[] = [];

        if (cfgText == "") { return []; }
        if (cfgText == null) { return []; }

        // For every line in the AF configuration...
        for (let index in lines) {
            var line = lines[index];
            var statecheck: boolean = false;
            var rule: AutofilerRule;

            //If it is a commented line skip to next
            if (line == "") { continue; }
            if (line == null) { continue; }
            if (line[0] == '#') { continue; }
            
            if (this.StringContains(line, "{")) {
                
                if (this.StringContains(line, "state_check")) {
                    statecheck = true;
                }
                else if (this.StringContains(line, "disk_check") || this.StringContains(line, "auto_archive")) {
                    //Nothing really
                }
                else {
                    let value = line.split("{")[0].trim();
                    statecheck = false;
                    rule = new AutofilerRule(counter);
                    rule.name = value;
                    counter = counter + 1;
                }
                continue;
            }
            
            if (this.StringContains(line, "<") && this.StringContains(line, ">")) {
                let field = line.split(RegExp("<"))[0].trim();
                let value = line.split(RegExp("<"))[1].trim();

                field = field.replace("\>", "");
                value = value.replace("\>", "");


                if (statecheck && this.StringContains(field, "enable")) {
                    field = "enableStatecheck";
                }

                var result:boolean = rule.Set(field, value);

                if (!result) {
                    defaultBFsString = value;
                    console.log("Orphaned BFs: " + value);
                }
            }
            
            //If line has a closing bracket it means closing of a rule. If it is a second closing bracket it means we have left disk_check, end function and return list.
            //Else add current rule to List, create a new one and start over.
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

        // If there is a base_folder_ids specified outside of the config we set those ids on all rules without specified bfs
        if (defaultBFsString !== null) {
            for (var ruleRef in ruleList) {
                if (ruleList[ruleRef].basefolder_ids === null) {
                    console.log("Setting default BFs on:");
                    console.log(ruleList[ruleRef]);
                    ruleList[ruleRef].Set("base_folder_ids", defaultBFsString);
                }
            }
        }

        return ruleList;
    }

    StringContains(input: string, find: string): boolean {
        return (input.indexOf(find) != -1);
    }
}