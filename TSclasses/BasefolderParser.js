var BasefolderParser = (function () {
    function BasefolderParser() {
    }
    BasefolderParser.prototype.ParseBasefolderDump = function (bfText) {
        var lines = bfText.split("\n");
        var ruleNames = [];
        var field;
        var value;
        var bf;
        var bfList = [];
        if (bfText == "") {
            return [];
        }
        if (bfText == null) {
            return [];
        }
        for (var index in lines) {
            var line = lines[index];
            line = line.trim();
            if (line == "") {
                continue;
            }
            if (line == null) {
                continue;
            }
            if (line[0] == '#') {
                continue;
            }
            if (line.indexOf("base_folder") != -1) {
                if (typeof bf != 'undefined') {
                    bfList.push(bf);
                }
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
        return bfList;
    };
    BasefolderParser.prototype.Set = function (bf, field, value) {
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
    };
    return BasefolderParser;
}());
