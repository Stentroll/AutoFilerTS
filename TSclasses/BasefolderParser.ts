class BasefolderParser {

    ParseBasefolderDump(bfText: string): Basefolder[] {

        let lines = bfText.split("\n");
        let ruleNames: string[] = [];
        let field: string;
        let value: string;
        let bf: Basefolder;
        let bfList: Basefolder[] = [];


        if (bfText == "") { return []; }
        if (bfText == null) { return []; }


        for (let index in lines) {
            var line = lines[index];
            line = line.trim();

            //If it is a commented or empty line skip to next
            if (line == "") { continue; }
            if (line == null) { continue; }
            if (line[0] == '#') { continue; }

            if (line.indexOf("base_folder") != -1) {

                if (typeof bf != 'undefined') { bfList.push(bf); }
                bf = new Basefolder();
                continue;
            }
            else {
                field = line.split(":", 1)[0];
                value = line.replace(field + ":", "");
                this.Set(bf, field, value);
            }
        }

        if (typeof bf != 'undefined') {
            bfList.push(bf);
        }

        console.log("Basefolders found:" + bfList.length);
        return bfList;
    }

    Set(bf: Basefolder, field: string, value: string): void {
        if ((field === "id")) {
            bf.id = Number(value);
        }
        else if ((field === "name")) {
            bf.name = value;
        }
        else if ((field === "type_id")) {
            bf.type_id = Number(value);
        }
        else if ((field === "location")) {
            bf.location = value;
        }
        else if ((field === "id_string")) {
            bf.id_string = value;
        }
    }
}